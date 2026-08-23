"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import { getSummernoteDocByIdFromMySql } from "@/app/actions/summernote-docs";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { NotFoundSpace } from "@/components/error/not-found-space";

interface SummernoteDocument {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
    createdAt?: string;
}

export default function SummernoteDocViewClient({ params }: { params?: Promise<{ id: string }> }) {
    const routeParams = useParams() as { id: string };
    const unwrappedParams = params ? use(params) : null;
    const id = unwrappedParams?.id || routeParams.id;
    const [doc, setDoc] = useState<SummernoteDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (doc?.title) {
            const newTitle = `${doc.title} | Summernote Docs | MenuSnap`;
            if (document.title !== newTitle) {
                document.title = newTitle;
            }
        }
    }, [doc?.title]);

    useEffect(() => {
        const fetchDoc = async () => {
            const result = await getSummernoteDocByIdFromMySql(id);

            if (result.success && result.data) {
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
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

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-8 sm:py-12 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-12">
                <div className="flex justify-between items-start border-b-2 border-amber-500/20 pb-8 mb-8">
                    <div className="bg-black rounded-lg p-2 shadow-sm">
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
                        <h1 className="font-bold text-xl sm:text-2xl text-slate-900">{doc.title}</h1>
                        <p className="flex items-center justify-end gap-2 font-medium text-xs sm:text-sm text-slate-500">
                            <CalendarDays className="h-4 w-4 text-amber-600" />
                            {formatDate(doc.createdAt || doc.lastUpdated)}
                        </p>
                    </div>
                </div>

                <div 
                    className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans whitespace-pre-wrap [tab-size:4] summernote-view-content"
                    style={{ whiteSpace: 'pre-wrap', tabSize: 4 }}
                    dangerouslySetInnerHTML={{ __html: doc.content || "<p>No content in this document.</p>" }}
                />
                <style jsx global>{`
                    .summernote-view-content span[style*="white-space:pre"],
                    .summernote-view-content .Apple-tab-span {
                        display: inline-block !important;
                        min-width: 36px !important;
                        max-width: 60px !important;
                        white-space: pre !important;
                    }
                    .summernote-view-content table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin: 12px 0 !important;
                    }
                    .summernote-view-content th,
                    .summernote-view-content td {
                        padding: 6px 12px !important;
                        vertical-align: top !important;
                    }
                    .summernote-view-content img {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                `}</style>
            </div>
        </div>
    );
}
