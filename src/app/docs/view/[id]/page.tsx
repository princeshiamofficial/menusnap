"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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

export default function MagicDocView() {
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
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-[#f8f9fa] font-sans px-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 font-sans">Document Not Found</h1>
                <p className="text-gray-600 mb-6 font-sans">The document you're looking for doesn't exist or has been removed.</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium font-sans"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <GoogleDocsApp
            initialTitle={doc.title}
            initialContent={doc.content}
            readOnly={true}
            hideHeader={true}
        />
    );
}
