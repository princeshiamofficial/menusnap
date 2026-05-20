"use client";

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission } from '@/lib/admin-permissions';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Plus, FileText, Trash2, Search, ArrowUpDown, MoreVertical, Eye, Edit3, RefreshCw, AlertTriangle, CalendarDays, Undo2, History } from "lucide-react";
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

import { formatDisplayDate, parseMySqlDateAsUtc } from '@/lib/dateUtils';

interface MagicDocument {
    id: string;
    title: string;
    content: string;
    lastUpdated: string;
    createdAt?: string;
    isDeleted?: boolean;
    deletedAt?: string;
}

export default function MagicDocsPage(): ReactNode {
    const router = useRouter();
    const { isAdminLoggedIn, adminLoading, adminUser } = useAdminAuth();
    const canEdit = checkClientPermission(adminUser, 'magic-docs', 'edit');
    const canDelete = checkClientPermission(adminUser, 'magic-docs', 'delete');
    const canCreate = checkClientPermission(adminUser, 'magic-docs', 'create');
    const [docs, setDocs] = useState<MagicDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [isTrashOpen, setIsTrashOpen] = useState(false);
    const [trashDocs, setTrashDocs] = useState<MagicDocument[]>([]);
    const ITEMS_PER_PAGE = 10;



    // Load docs on mount
    const fetchDocs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getMagicDocsFromMySql();

            if (!result.success) {
                console.error("Error fetching docs:", result.message);
                // Fallback to localStorage for existing users
                const stored = localStorage.getItem('magic-internal-docs') || localStorage.getItem('ch-internal-docs');
                if (stored) {
                    try {
                        setDocs(JSON.parse(stored));
                        setIsLoading(false);
                        return;
                    } catch (e) {
                        console.error("Failed to parse local docs", e);
                    }
                }
                setDocs([]);
                setIsLoading(false);
                return;
            }

            if (result.success && Array.isArray(result.data)) {
                const data = result.data;
                const allMapped = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    content: d.content,
                    lastUpdated: d.lastUpdated,
                    createdAt: d.createdAt,
                    isDeleted: !!d.is_deleted,
                    deletedAt: d.deletedAt
                }));
                setDocs(allMapped.filter((d: any) => !d.isDeleted));
                setTrashDocs(allMapped.filter((d: any) => d.isDeleted));
            }
        } catch (e: any) {
            setError(e.message || "Failed to load docs");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdminLoggedIn) {
            fetchDocs();
        }
    }, [fetchDocs, isAdminLoggedIn]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortOption]);

    const handleRefresh = useCallback(() => {
        fetchDocs();
        setCurrentPage(1);
    }, [fetchDocs]);

    const handleCreateNew = async () => {
        const id = crypto.randomUUID();
        const newDoc = {
            id,
            title: "Untitled Document",
            content: "",
        };

        const result = await upsertMagicDocToMySql(newDoc);

        if (!result.success) {
            console.error("Error creating doc:", result.message);
            alert("Failed to create document in MySQL");
            return;
        }

        router.push(`/m-admin/magic-docs/${id}`);
    };

    const handleMoveToTrash = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Move this document to trash?")) {
            const result = await deleteMagicDocFromMySql(id);

            if (!result.success) {
                console.error("Error moving to trash:", result.message);
                alert("Failed to move document to trash.");
            } else {
                fetchDocs();
            }
        }
    };

    const handleRestore = async (id: string) => {
        // Find the doc in trashDocs to get its metadata
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
            fetchDocs();
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this document? This action cannot be undone.")) {
            const result = await permanentDeleteMagicDocFromMySql(id);

            if (!result.success) {
                console.error("Error permanently deleting doc:", result.message);
                alert("Failed to delete document permanently.");
            } else {
                fetchDocs();
            }
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

    const filteredAndSortedDocs = useMemo(() => {
        let filteredDocs = docs.filter(doc =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        switch (sortOption) {
            case 'newest':
                filteredDocs.sort((a, b) => {
                    const dateA = a.createdAt || a.lastUpdated;
                    const dateB = b.createdAt || b.lastUpdated;
                    try { return parseMySqlDateAsUtc(dateB as string).getTime() - parseMySqlDateAsUtc(dateA as string).getTime(); } catch { return 0; }
                });
                break;
            case 'oldest':
                filteredDocs.sort((a, b) => {
                    const dateA = a.createdAt || a.lastUpdated;
                    const dateB = b.createdAt || b.lastUpdated;
                    try { return parseMySqlDateAsUtc(dateA as string).getTime() - parseMySqlDateAsUtc(dateB as string).getTime(); } catch { return 0; }
                });
                break;
            case 'title-asc':
                filteredDocs.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                filteredDocs.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
        return filteredDocs;
    }, [docs, searchTerm, sortOption]);

    const totalPages = useMemo(() => Math.ceil(filteredAndSortedDocs.length / ITEMS_PER_PAGE), [filteredAndSortedDocs.length]);

    const paginatedDocs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedDocs, currentPage]);

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
            <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </motion.tr>
    ));

    return (
        <div className="min-h-full bg-background/30 p-4 sm:p-6 lg:p-10 w-full overflow-x-hidden relative">
            <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8 w-full mt-10">
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0">
                        <Select value={sortOption} onValueChange={(value) => setSortOption(value as any)}>
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
                    ) : paginatedDocs.length === 0 ? (
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
                                        <TableHead className="w-[180px]">Created</TableHead>
                                        <TableHead className="w-[180px]">Updated</TableHead>
                                        <TableHead className="w-[120px]">Docs ID</TableHead>
                                        <TableHead className="text-right w-[80px]">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {paginatedDocs.map((doc, index) => (
                                            <motion.tr
                                                key={doc.id}
                                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                            >
                                                <TableCell className="text-center text-muted-foreground font-medium text-xs">
                                                    {filteredAndSortedDocs.length - ((currentPage - 1) * ITEMS_PER_PAGE + index)}
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
                                                    {doc.id.split('-')[0]}...
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
                                                                    <DropdownMenuItem onClick={(e) => handleMoveToTrash(doc.id, e as any)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
                    <p>Showing {paginatedDocs.length} of {filteredAndSortedDocs.length} docs.</p>
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
                                                            onClick={() => handlePermanentDelete(doc.id)}
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
            </div>
        </div>
    );
}
