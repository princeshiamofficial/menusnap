"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { getMagicDocByIdFromMySql, upsertMagicDocToMySql } from "@/app/actions/magic-docs";
import { NotFoundSpace } from "@/components/error/not-found-space";

const GoogleDocsApp = dynamic(() => import("@/components/editor/google-docs/google-docs-app"), {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-[#f8f9fa] flex items-center justify-center animate-pulse text-gray-500 font-medium font-sans text-xl">Loading Magic Doc...</div>
});

interface MagicDocument {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
}

export default function MagicDocClient() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { isAdminLoggedIn, adminLoading } = useAdminAuth();
    const [doc, setDoc] = useState<MagicDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (doc?.title) {
            const newTitle = `${doc.title} | MenuSnap`;
            if (document.title !== newTitle) {
                document.title = newTitle;
            }
        }
    }, [doc?.title]);

    useEffect(() => {
        if (!isAdminLoggedIn) return;

        const fetchDoc = async () => {
            const result = await getMagicDocByIdFromMySql(id);

            if (!result.success) {
                console.error("Error fetching doc:", result.message);

                // Fallback to local storage
                const stored = localStorage.getItem('magic-internal-docs');
                if (stored) {
                    try {
                        const docs: MagicDocument[] = JSON.parse(stored);
                        const found = docs.find(d => d.id === id);
                        if (found) setDoc(found);
                    } catch (e) { }
                }
            } else if (result.data) {
                const data = result.data;
                setDoc({
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    lastUpdated: data.lastUpdated
                });
            }
            setLoading(false);
        };

        fetchDoc();
    }, [id, isAdminLoggedIn]);

    const handleSave = async (data: { title: string; content: string }) => {
        // Update local state immediately to avoid re-fetching
        setDoc(prev => (prev ? { 
            ...prev, 
            title: data.title, 
            content: data.content,
            lastUpdated: new Date().toISOString()
        } : null));

        const result = await upsertMagicDocToMySql({
            id,
            title: data.title,
            content: data.content
        });

        if (!result.success) {
            console.error("Failed to save doc to MySQL", result.message);
        }
    };

    if (adminLoading || loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAdminLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
                <AdminLoginForm />
            </div>
        );
    }

    if (!doc) {
        return (
            <NotFoundSpace />
        );
    }

    return (
        <GoogleDocsApp
            key={id}
            initialTitle={doc.title}
            initialContent={doc.content}
            onSave={handleSave}
            docId={id}
        />
    );
}
