"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
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

export default function MagicDocEdit() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [doc, setDoc] = useState<MagicDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoc = async () => {
            const { data, error } = await supabase
                .from('magic_docs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching doc:", error);
                // Fallback
                const stored = localStorage.getItem('magic-internal-docs') || localStorage.getItem('ch-internal-docs');
                if (stored) {
                    try {
                        const docs: MagicDocument[] = JSON.parse(stored);
                        const found = docs.find(d => d.id === id);
                        if (found) setDoc(found);
                    } catch (e) { }
                }
            } else if (data) {
                if (data.is_deleted) {
                    setDoc(null);
                } else {
                    setDoc({
                        id: data.id,
                        title: data.title,
                        content: data.content,
                        lastUpdated: data.last_updated
                    });
                }
            }
            setLoading(false);
        };

        fetchDoc();
    }, [id]);

    const handleSave = async (data: { title: string; content: string }) => {
        // Update local state immediately to avoid re-fetching
        setDoc(current => current ? { 
            ...current, 
            title: data.title, 
            content: data.content,
            lastUpdated: new Date().toISOString()
        } : null);

        const { error } = await supabase
            .from('magic_docs')
            .update({
                title: data.title,
                content: data.content,
                last_updated: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error("Failed to save doc to Supabase", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!doc) {
        return <NotFoundSpace />;
    }

    return (
        <GoogleDocsApp
            key={id}
            initialTitle={doc.title}
            initialContent={doc.content}
            onSave={handleSave}
            readOnly={false}
        />
    );
}
