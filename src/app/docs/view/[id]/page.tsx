"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getMagicDocByIdFromMySql } from "@/app/actions/magic-docs";
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
            const result = await getMagicDocByIdFromMySql(id);

            if (!result.success) {
                console.error("Error fetching doc:", result.message);
                // Fallback
                const stored = localStorage.getItem('magic-internal-docs') || localStorage.getItem('ch-internal-docs');
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
                    lastUpdated: data.lastUpdated,
                    createdAt: data.createdAt
                });
            }
            setLoading(false);
        };

        fetchDoc();
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
        <div className="flex justify-between items-start border-b-2 border-primary/20 pb-8 mb-4 mt-8 sm:mt-12 mx-4 sm:mx-16 px-2">
            <div className="bg-black p-3 sm:p-4 rounded-lg shadow-md print:shadow-none">
                <Image
                    src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                    alt="Color Hut Logo"
                    width={180}
                    height={72}
                    className="w-32 sm:w-44 h-auto object-contain"
                    priority
                />
            </div>
            <div className="text-right text-muted-foreground text-sm space-y-1">
                <p className="font-bold text-lg sm:text-xl text-primary">{doc.title}</p>
                <p className="flex items-center justify-end gap-2 font-medium text-xs sm:text-sm">
                    <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            docId={id}
            showWatermark={true}
            customPaperHeader={customHeader}
        />
    );
}
