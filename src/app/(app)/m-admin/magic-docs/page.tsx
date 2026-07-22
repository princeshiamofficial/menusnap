"use client";

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission } from '@/lib/admin-permissions';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Plus, FileText, Trash2, Search, ArrowUpDown, MoreVertical, Eye, Edit3, RefreshCw, AlertTriangle, CalendarDays, Undo2, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getMagicDocsFromMySql, 
    upsertMagicDocToMySql, 
    deleteMagicDocFromMySql, 
    permanentDeleteMagicDocFromMySql 
} from '@/app/actions/magic-docs';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDisplayDate, parseMySqlDateAsUtc } from '@/lib/dateUtils';

interface MagicDocument {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
    createdAt?: string;
    createdBy?: string;
    createdByUserId?: number | null;
    creatorAvatarUrl?: string | null;
    isDeleted?: boolean;
    deletedAt?: string;
}

interface DeleteTarget {
    id: string;
    title: string;
    isPermanent: boolean;
}

export default function MagicDocsPage(): ReactNode {
    const router = useRouter();
    const { isAdminLoggedIn, adminLoading, adminUser } = useAdminAuth();
    const canEdit = checkClientPermission(adminUser, 'magic-docs', 'edit');
    const canDelete = checkClientPermission(adminUser, 'magic-docs', 'delete');
    const canCreate = checkClientPermission(adminUser, 'magic-docs', 'create');
    const [docs, setDocs] = useState<MagicDocument[]>([]);
    const [totalDocsCount, setTotalDocsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    const [trashDocs, setTrashDocs] = useState<MagicDocument[]>([]);
    const ITEMS_PER_PAGE = 10;

    // Load docs from server action with pagination, search & sort
    const fetchDocs = useCallback(async (page: number, search: string, sort: 'newest' | 'oldest' | 'title-asc' | 'title-desc') => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getMagicDocsFromMySql({
                page,
                limit: ITEMS_PER_PAGE,
                search,
                sort
            });

            if (!result.success) {
                console.error("Error fetching docs:", result.message);
                const stored = localStorage.getItem('magic-internal-docs') || localStorage.getItem('ch-internal-docs');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        setDocs(parsed);
                        setTotalDocsCount(parsed.length);
                        setIsLoading(false);
                        return;
                    } catch (e) {
                        console.error("Failed to parse local docs", e);
                    }
                }
                setDocs([]);
                setTotalDocsCount(0);
                setIsLoading(false);
                return;
            }

            if (result.success && Array.isArray(result.data)) {
                const data = result.data;
                const mapped = data.map((d: any) => ({
                    id: String(d.id || ''),
                    title: d.title || 'Untitled Document',
                    content: d.content || '',
                    lastUpdated: d.lastUpdated || d.last_updated || '',
                    createdAt: d.createdAt || d.created_at || '',
                    createdBy: d.createdBy || d.created_by || 'Admin',
                    createdByUserId: d.createdByUserId || d.created_by_user_id || null,
                    creatorAvatarUrl: d.creatorAvatarUrl || d.avatar_url || null,
                    isDeleted: !!d.is_deleted,
                    deletedAt: d.deletedAt || d.deleted_at || null
                }));
                setDocs(mapped);
                setTotalDocsCount(result.totalCount ?? mapped.length);

                if (result.trashDocs && Array.isArray(result.trashDocs)) {
                    const mappedTrash = result.trashDocs.map((d: any) => ({
                        id: String(d.id || ''),
                        title: d.title || 'Untitled Document',
                        content: d.content || '',
                        lastUpdated: d.lastUpdated || d.last_updated || '',
                        createdAt: d.createdAt || d.created_at || '',
                        createdBy: d.createdBy || d.created_by || 'Admin',
                        createdByUserId: d.createdByUserId || d.created_by_user_id || null,
                        creatorAvatarUrl: d.creatorAvatarUrl || d.avatar_url || null,
                        isDeleted: true,
                        deletedAt: d.deletedAt || d.deleted_at || null
                    }));
                    setTrashDocs(mappedTrash);
                }
            }
        } catch (e: any) {
            setError(e.message || "Failed to load docs");
        } finally {
            setIsLoading(false);
        }
    }, [ITEMS_PER_PAGE]);

    // Debounced fetch on search / sort / page change
    useEffect(() => {
        if (!isAdminLoggedIn) return;
        const timer = setTimeout(() => {
            fetchDocs(currentPage, searchTerm, sortOption);
        }, 250);
        return () => clearTimeout(timer);
    }, [fetchDocs, isAdminLoggedIn, currentPage, searchTerm, sortOption]);

    const handleRefresh = useCallback(() => {
        fetchDocs(currentPage, searchTerm, sortOption);
    }, [fetchDocs, currentPage, searchTerm, sortOption]);

    const handleCreateNew = async () => {
        const id = crypto.randomUUID();
        const authorName = adminUser?.name || adminUser?.email || "Admin";
        const authorUserId = adminUser?.id || null;
        const newDoc = {
            id,
            title: "Untitled Document",
            content: "",
            createdByUserId: authorUserId,
            createdBy: authorName
        };

        const result = await upsertMagicDocToMySql(newDoc);

        if (!result.success) {
            console.error("Error creating doc:", result.message);
            alert("Failed to create document in MySQL");
            return;
        }

        router.push(`/m-admin/magic-docs/${id}`);
    };

    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleMoveToTrash = (id: string, title: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTarget({ id, title, isPermanent: false });
    };

    const handlePermanentDelete = (id: string, title: string) => {
        setDeleteTarget({ id, title, isPermanent: true });
    };

    const handleRestore = async (id: string) => {
        const docToRestore = trashDocs.find(d => d.id === id);
        if (!docToRestore) return;

        const result = await upsertMagicDocToMySql({
            ...docToRestore,
            isDeleted: false,
            deletedAt: null
        });

        if (!result.success) {
            console.error("Error restoring doc:", result.message);
            alert("Failed to restore document.");
        } else {
            fetchDocs(currentPage, searchTerm, sortOption);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            if (deleteTarget.isPermanent) {
                const result = await permanentDeleteMagicDocFromMySql(deleteTarget.id);
                if (!result.success) {
                    console.error("Error permanently deleting doc:", result.message);
                    alert("Failed to delete document permanently.");
                }
            } else {
                const result = await deleteMagicDocFromMySql(deleteTarget.id);
                if (!result.success) {
                    console.error("Error moving to trash:", result.message);
                    alert("Failed to move document to trash.");
                }
            }
            fetchDocs(currentPage, searchTerm, sortOption);
        } catch (err: any) {
            console.error("Delete operation failed:", err);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const formatDateForDisplay = (dateString: string | null | undefined, includeTime: boolean = true): string => {
        if (!dateString) return 'N/A';
        const date = parseMySqlDateAsUtc(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const options: Intl.DateTimeFormatOptions = includeTime
            ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Dhaka' }
            : { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Dhaka' };
        return date.toLocaleString('en-US', options);
    };

    const totalPages = useMemo(() => Math.ceil(totalDocsCount / ITEMS_PER_PAGE), [totalDocsCount, ITEMS_PER_PAGE]);

    const orderRowSkeletons = Array.from({ length: Math.min(ITEMS_PER_PAGE, 5) }).map((_, i) => (
        <motion.tr
            key={`skeleton-${i}`}
            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
        >
            <TableCell><Skeleton className="h-5 w-8" /></TableCell>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </motion.tr>
    ));

    return (
        <div className="min-h-full bg-background/30 p-2 sm:p-4 w-full overflow-x-hidden relative">
            <div className="w-full space-y-4 sm:space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Magic Docs
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage all your internal documents.</p>
                </div>
                <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <Button variant="outline" onClick={() => setIsTrashOpen(true)} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                            <History className="h-4 w-4 mr-2" />
                            Trash ({trashDocs.length})
                        </Button>
                    </motion.div>
                    {canCreate && (
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                            <Button variant="default" onClick={handleCreateNew}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Document
                            </Button>
                        </motion.div>
                    )}
                </div>
            </header>

            <section className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border flex flex-col flex-grow min-h-0">
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 pb-4 border-b border-border">
                    <div className="relative flex-grow w-full sm:w-auto sm:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by Title or ID..."
                            className="pl-10 w-full h-9 text-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0">
                        <Select 
                            value={sortOption} 
                            onValueChange={(value) => {
                                setSortOption(value as any);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-auto min-w-[180px] h-9 text-sm">
                                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Created (Newest First)</SelectItem>
                                <SelectItem value="oldest">Created (Oldest First)</SelectItem>
                                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex-grow min-h-0">
                    {isLoading ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">SL</TableHead>
                                    <TableHead>Document Title</TableHead>
                                    <TableHead className="w-[140px]">Created By</TableHead>
                                    <TableHead className="w-[180px]">Created</TableHead>
                                    <TableHead className="w-[180px]">Updated</TableHead>
                                    <TableHead className="w-[120px]">Docs ID</TableHead>
                                    <TableHead className="text-right w-[80px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody><AnimatePresence>{orderRowSkeletons}</AnimatePresence></TableBody>
                        </Table>
                    ) : error ? (
                        <motion.div
                            className="text-center py-10 text-destructive"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                            <p className="text-lg">Error loading docs: {error}</p>
                            <Button variant="outline" onClick={handleRefresh} className="mt-4">
                                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                            </Button>
                        </motion.div>
                    ) : docs.length === 0 ? (
                        <motion.div
                            className="text-center py-10 text-muted-foreground"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p className="text-lg">No documents found.</p>
                            {searchTerm && <p>Try adjusting your search or filters.</p>}
                        </motion.div>
                    ) : (
                        <div className="overflow-x-auto no-scrollbar">
                            <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px] text-center">SL</TableHead>
                                        <TableHead>Document Title</TableHead>
                                        <TableHead className="w-[140px]">Created By</TableHead>
                                        <TableHead className="w-[180px]">Created</TableHead>
                                        <TableHead className="w-[180px]">Updated</TableHead>
                                        <TableHead className="w-[120px]">Docs ID</TableHead>
                                        <TableHead className="text-right w-[80px]">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {docs.map((doc, index) => (
                                            <motion.tr
                                                key={doc.id}
                                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                            >
                                                <TableCell className="text-center text-muted-foreground font-medium text-xs">
                                                    {totalDocsCount - ((currentPage - 1) * ITEMS_PER_PAGE + index)}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-primary/10 rounded">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                        </div>
                                                    <span 
                                                        className="hover:underline cursor-pointer text-primary" 
                                                        onClick={() => canEdit ? router.push(`/m-admin/magic-docs/${doc.id}`) : window.open(`/docs/view/${doc.id}`, '_blank')}
                                                    >
                                                        {doc.title}
                                                    </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-foreground/90">
                                                    <div className="flex items-center gap-2" title={`Created by ${doc.createdBy || 'Admin'}`}>
                                                        <Avatar className="h-6 w-6 border border-border/50 shrink-0">
                                                            {doc.creatorAvatarUrl ? (
                                                                <AvatarImage src={doc.creatorAvatarUrl} alt={doc.createdBy || 'User'} />
                                                            ) : null}
                                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                                                                {(doc.createdBy || 'A').charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate max-w-[110px]">{doc.createdBy || 'Admin'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <div className="flex items-center" title="Created Date">
                                                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                                        {formatDateForDisplay(doc.createdAt || doc.lastUpdated)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <div className="flex items-center" title="Last Updated Date">
                                                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                                                        {formatDateForDisplay(doc.lastUpdated)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]" title={doc.id}>
                                                    {doc.id ? (doc.id.includes('-') ? doc.id.split('-')[0] : doc.id) : 'N/A'}...
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {canEdit && (
                                                                <DropdownMenuItem onClick={() => router.push(`/m-admin/magic-docs/${doc.id}`)}>
                                                                    <Edit3 className="mr-2 h-4 w-4" /> Edit Content
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => window.open(`/docs/view/${doc.id}`, '_blank')}>
                                                                <Eye className="mr-2 h-4 w-4" /> View Read-Only
                                                            </DropdownMenuItem>
                                                            {canDelete && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={(e) => handleMoveToTrash(doc.id, doc.title, e as any)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Docs
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border text-sm text-muted-foreground">
                    <p>Showing {docs.length} of {totalDocsCount} docs.</p>
                    <div className="flex items-center space-x-1">
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                            >
                                Previous
                            </Button>
                        </motion.div>
                        <span className="px-2">Page {currentPage} of {Math.max(1, totalPages)}</span>
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                            >
                                Next
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>
            {/* Trash Recovery Dialog */}
            <Dialog open={isTrashOpen} onOpenChange={setIsTrashOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 border-none shadow-2xl bg-white rounded-2xl overflow-hidden">
                    <DialogHeader className="px-8 py-8 space-y-2 select-none">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-500" />
                                Trash Bin
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-gray-500 text-[15px] leading-relaxed">
                            These items will be kept for recovery. You can restore them anytime or remove them permanently.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
                        <ScrollArea className="flex-1 px-4">
                            <AnimatePresence mode="popLayout">
                                {trashDocs.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center py-24 text-center"
                                    >
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <History className="h-8 w-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-900 font-medium">Your trash is clear</p>
                                        <p className="text-gray-500 text-sm mt-1">Deleted documents will appear here temporarily.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-2 py-2">
                                        {trashDocs.map((doc) => (
                                            <motion.div
                                                key={doc.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                className="group relative flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium text-gray-900 truncate">
                                                            {doc.title}
                                                        </span>
                                                        <span className="text-[12px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <CalendarDays className="h-3 w-3" />
                                                            Deleted {doc.deletedAt ? formatDateForDisplay(doc.deletedAt as string) : 'recently'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 ml-4">
                                                    {canEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-all"
                                                            onClick={() => handleRestore(doc.id)}
                                                        >
                                                            <Undo2 className="h-4 w-4 mr-1.5" />
                                                            Restore
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            onClick={() => handlePermanentDelete(doc.id, doc.title)}
                                                            title="Delete permanently"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Popup Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="max-w-md rounded-2xl p-6 shadow-2xl border border-border bg-card">
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 mb-2">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-center text-foreground">
                            {deleteTarget?.isPermanent ? "Permanently Delete Document?" : "Move Document to Trash?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-sm text-muted-foreground mt-2 leading-relaxed">
                            {deleteTarget?.isPermanent ? (
                                <>
                                    Are you sure you want to permanently delete <strong className="text-foreground font-semibold">"{deleteTarget?.title}"</strong>? This action cannot be undone.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to move <strong className="text-foreground font-semibold">"{deleteTarget?.title}"</strong> to trash? You can restore it anytime from the trash bin.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                        <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-border hover:bg-muted font-medium">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmDelete();
                            }}
                            disabled={isDeleting}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-500/20"
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4 animate-spin" /> Deleting...
                                </span>
                            ) : (
                                deleteTarget?.isPermanent ? "Delete Permanently" : "Move to Trash"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </div>
    );
}
