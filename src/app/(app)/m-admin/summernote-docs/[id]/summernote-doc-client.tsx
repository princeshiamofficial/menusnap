"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { getSummernoteDocByIdFromMySql, upsertSummernoteDocToMySql } from "@/app/actions/summernote-docs";
import { NotFoundSpace } from "@/components/error/not-found-space";
import Header from "@/components/editor/google-docs/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

const SummernoteEditor = dynamic(() => import("@/components/editor/summernote/summernote-editor"), {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-[#f8f9fa] flex items-center justify-center animate-pulse text-gray-500 font-medium font-sans text-xl">Loading Summernote Editor...</div>
});

interface SummernoteDocument {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
}

export default function SummernoteDocClient({ params }: { params?: Promise<{ id: string }> }) {
    const routeParams = useParams() as { id: string };
    const unwrappedParams = params ? use(params) : null;
    const id = unwrappedParams?.id || routeParams.id;
    const router = useRouter();
    const { isAdminLoggedIn, adminLoading } = useAdminAuth();
    const [doc, setDoc] = useState<SummernoteDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("Untitled Document");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (title) {
            const newTitle = `${title} | Summernote Docs | MenuSnap`;
            if (document.title !== newTitle) {
                document.title = newTitle;
            }
        }
    }, [title]);

    useEffect(() => {
        if (!isAdminLoggedIn) return;

        const fetchDoc = async () => {
            const result = await getSummernoteDocByIdFromMySql(id);

            if (result.success && result.data) {
                const data = result.data;
                setDoc({
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    lastUpdated: data.lastUpdated
                });
                setTitle(data.title || "Untitled Document");
                setContent(data.content || "");
            }
            setLoading(false);
        };

        fetchDoc();
    }, [id, isAdminLoggedIn]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await upsertSummernoteDocToMySql({
                id,
                title,
                content
            });

            if (!result.success) {
                console.error("Failed to save doc to MySQL", result.message);
                alert("Failed to save document");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = (mode: 'editor' | 'viewer') => {
        const path = mode === 'editor' ? `/docs/summernote/edit/${id}` : `/docs/summernote/view/${id}`;
        const url = `${window.location.origin}${path}`;
        navigator.clipboard.writeText(url);
    };

    if (adminLoading || loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
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
        <div className="min-h-screen flex flex-col bg-[#f8f9fa] w-full">
            <Header
                title={title}
                onTitleChange={setTitle}
                isSaving={isSaving}
                readOnly={false}
                docId={id}
                onShare={handleShare}
                customActions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/m-admin/summernote-docs')}
                            className="h-8 gap-1 text-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-8 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                }
            />

            <main className="flex-1 w-full bg-[#f8f9fa]">
                <SummernoteEditor
                    initialContent={content}
                    onChange={setContent}
                    minHeight={550}
                />
            </main>
        </div>
    );
}
