"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { format, parseISO, isValid as isValidDate } from 'date-fns';
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
    createdAt?: string;
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
                if (data.is_deleted) {
                    setDoc(null);
                } else {
                    setDoc({
                        id: data.id,
                        title: data.title,
                        content: data.content,
                        lastUpdated: data.last_updated,
                        createdAt: data.created_at
                    });
                }
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
                                lastUpdated: newData.last_updated,
                                createdAt: newData.created_at || current.createdAt
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
        return <NotFoundSpace />;
    }

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = parseISO(dateString);
            return isValidDate(date) ? format(date, "MMMM d, yyyy") : "Invalid Date";
        } catch {
            return "Invalid Date";
        }
    };

    const customHeader = (
        <div className="flex justify-between items-start border-b-2 border-primary/20 pb-8 mb-4 mt-8 sm:mt-12 mx-6 sm:mx-16 px-2">
            <div className="bg-black p-4 rounded-lg shadow-md print:shadow-none">
                <Image
                    src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                    alt="Color Hut Logo"
                    width={180}
                    height={72}
                    className="object-contain"
                    priority
                />
            </div>
            <div className="text-right text-muted-foreground text-sm space-y-1">
                <p className="font-bold text-xl text-primary">{doc.title}</p>
                <p className="flex items-center justify-end gap-2 font-medium">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(doc.createdAt || doc.lastUpdated)}
                </p>
            </div>
        </div>
    );

    return (
        <GoogleDocsApp
            initialTitle={doc.title}
            initialContent={doc.content}
            readOnly={true}
            hideHeader={true}
            showWatermark={true}
            customPaperHeader={customHeader}
        />
    );
}
