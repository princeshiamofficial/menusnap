"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { supabase } from "@/lib/supabase";

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

export default function MagicDocDetail() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { isAdminLoggedIn, adminLoading } = useAdminAuth();
    const [doc, setDoc] = useState<MagicDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdminLoggedIn) return;

        const fetchDoc = async () => {
            const { data, error } = await supabase
                .from('magic_docs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching doc:", error);

                // Fallback to local storage
                const stored = localStorage.getItem('magic-internal-docs');
                if (stored) {
                    try {
                        const docs: MagicDocument[] = JSON.parse(stored);
                        const found = docs.find(d => d.id === id);
                        if (found) setDoc(found);
                    } catch (e) { }
                }
            } else if (data) {
                setDoc({
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    lastUpdated: data.last_updated
                });
            }
            setLoading(false);
        };

        fetchDoc();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`public:magic_docs:${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'magic_docs',
                    filter: `id=eq.${id}`
                },
                (payload) => {
                    const newData = payload.new as any;
                    // Only update if it's different to prevent loops
                    setDoc(current => {
                        if (current && (current.title !== newData.title || current.content !== newData.content)) {
                            return {
                                ...current,
                                title: newData.title,
                                content: newData.content,
                                lastUpdated: newData.last_updated
                            };
                        }
                        return current;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, isAdminLoggedIn]);

    const handleSave = async (data: { title: string; content: string }) => {
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
            <div className="flex flex-col h-screen w-full items-center justify-center bg-[#f8f9fa] font-sans">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 font-sans">Document not found</h1>
                <button
                    onClick={() => router.push('/m-admin/magic-docs')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <GoogleDocsApp
            initialTitle={doc.title}
            initialContent={doc.content}
            onSave={handleSave}
            docId={id}
        />
    );
}
