
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission } from '@/lib/admin-permissions';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import {
  Button,
  buttonVariants
} from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Badge
} from "@/components/ui/badge";
import {
  Input
} from "@/components/ui/input";
import {
  Label
} from "@/components/ui/label";
import {
  Textarea
} from "@/components/ui/textarea";
import {
  Switch
} from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  ScrollArea
} from '@/components/ui/scroll-area';
import {
  Skeleton
} from "@/components/ui/skeleton";
import {
  LayoutList,
  FolderKanban,
  Eye,
  EyeOff,
  BarChartBig,
  Search,
  RefreshCw,
  ListFilter,
  ArrowUpDown,
  PlusCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  Save,
  AlertTriangle,
  GripVertical,
  FolderTree,
  ArrowRightLeft,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tags,
  Tag,
  X,
  Check,
  Sparkles
} from "lucide-react";
import {
  cn,
  decodeHtmlEntities
} from "@/lib/utils";
import {
  format,
  parseISO
} from 'date-fns';
import {
  useToast
} from "@/hooks/use-toast";
import { 
  getCategoriesFromMySql, 
  upsertCategoryToMySql, 
  deleteCategoryFromMySql,
  getCategoryMappedItems,
  getMenuItemsFromMySql,
  remapMenuItemCategory,
  upsertMenuItemToMySql,
  updateCategoryKeywords,
  getCategoryOrderItems
} from '@/app/actions/orders';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeywordInput } from "@/components/ui/keyword-input";

type CategoryType = "restaurant" | "parlour";

interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  itemCount: number;
  visibleToUsers: boolean;
  createdAt: string;
  status?: string;
  keywords?: string | null;
}

interface StatCardAdminPageProps {
  title: string;
  value: string | number | ReactNode;
  description: string;
  icon: React.ElementType;
  className?: string;
}

function StatCardAdminPage({
  title,
  value,
  description,
  icon: Icon,
  className
}: StatCardAdminPageProps) {
  return (
    <Card className={cn("shadow-lg rounded-xl text-white overflow-hidden", className)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium uppercase tracking-wider opacity-90">{title}</h3>
          <Icon className="h-7 w-7 opacity-80" />
        </div>
        <div className="text-4xl font-bold mb-1.5">{value}</div>
        <p className="text-xs opacity-90">{description}</p>
      </CardContent>
    </Card>
  );
}

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(250, "Description must be 250 characters or less").optional().nullable(),
  icon: z.string().min(1, "Icon is required (e.g., emoji or text)").max(10, "Icon must be 10 characters or less"),
  visibleToUsers: z.boolean().default(true),
  keywords: z.string().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialData?: ApiCategory;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
}

function CategoryForm({ initialData, onSubmit, onOpenChange, isEditMode }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: decodeHtmlEntities(initialData?.name),
      description: decodeHtmlEntities(initialData?.description),
      icon: initialData?.icon || "📁",
      visibleToUsers: initialData?.visibleToUsers === undefined ? true : initialData.visibleToUsers,
      keywords: initialData?.keywords || "",
    },
    mode: 'onChange',
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data);
    // form.reset(); // Resetting form here might clear too early if submission fails and dialog stays open.
    // Consider resetting form only on successful dialog close or successful submission.
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-grow overflow-hidden">
      <ScrollArea className="flex-grow min-h-0">
        <div className="space-y-4 p-6">
          <div>
            <Label htmlFor="category-name">Category Name*</Label>
            <Input id="category-name" {...form.register("name")} placeholder="e.g., Appetizers, Beverages" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="category-description">Description</Label>
            <Textarea id="category-description" {...form.register("description")} placeholder="Short description of the category" rows={3} />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>
          <div>
            <Label htmlFor="category-icon">Icon (Emoji/Text)*</Label>
            <Input id="category-icon" {...form.register("icon")} placeholder="e.g., 🍔, 🥤, ✨" />
            {form.formState.errors.icon && <p className="text-sm text-destructive mt-1">{form.formState.errors.icon.message}</p>}
          </div>
          <div className="pt-1">
            <Controller
              control={form.control}
              name="keywords"
              render={({ field }) => {
                const rawVal = field.value ? String(field.value) : '';
                const kwList = rawVal ? rawVal.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : [];
                return (
                  <KeywordInput
                    keywords={kwList}
                    onChange={(newKws) => field.onChange(newKws.join(', '))}
                    label="Keywords"
                    placeholder="Add your keywords"
                    tooltipText="Keywords help auto-route incoming orders and search matching items."
                  />
                );
              }}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Controller
              control={form.control}
              name="visibleToUsers"
              render={({ field }) => (
                <Switch id="category-visible" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="category-visible" className="cursor-pointer">Visible to Customers</Label>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="p-6 pt-4 border-t mt-auto">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {form.formState.isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : <><Save className="mr-2 h-4 w-4" /> {isEditMode ? "Save Changes" : "Add Category"}</>}
        </Button>
      </DialogFooter>
    </form>
  );
}

type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'items-desc'
  | 'items-asc'
  | 'newest'
  | 'oldest';

const sortOptionsList: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'items-desc', label: 'Most Items' },
  { value: 'items-asc', label: 'Fewest Items' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const ITEMS_PER_PAGE = 10;
const KEYMAP_ITEMS_PER_PAGE = 10;

export default function ManageCategoriesPage(): ReactNode {
  const { isAdminLoggedIn, adminLoading, adminUser } = useAdminAuth();
  const canEdit = checkClientPermission(adminUser, 'manage-categories', 'edit');
  const canDelete = checkClientPermission(adminUser, 'manage-categories', 'delete');
  const canCreate = checkClientPermission(adminUser, 'manage-categories', 'create');
  const [categoryType, setCategoryType] = useState<CategoryType>("restaurant");
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);


  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState<ApiCategory | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDeleteInfo, setCategoryToDeleteInfo] = useState<{ id: string, name: string } | null>(null);

  // Item Keymap state
  const [isKeymapDialogOpen, setIsKeymapDialogOpen] = useState(false);
  const [keymapCategory, setKeymapCategory] = useState<ApiCategory | null>(null);
  const [keymapItems, setKeymapItems] = useState<any[]>([]);
  const [isLoadingKeymap, setIsLoadingKeymap] = useState(false);
  const [keymapSearchTerm, setKeymapSearchTerm] = useState('');
  const [keymapPage, setKeymapPage] = useState(1);
  const [categoryKeywords, setCategoryKeywords] = useState<string[]>([]);
  const [isSavingKeywords, setIsSavingKeywords] = useState(false);
  const [orderItemsForCategory, setOrderItemsForCategory] = useState<any[]>([]);
  const [isLoadingOrderItems, setIsLoadingOrderItems] = useState(false);
  const [orderItemsPage, setOrderItemsPage] = useState(1);
  const [orderItemsSearchTerm, setOrderItemsSearchTerm] = useState('');

  const { toast } = useToast();

  const updateLastUpdatedTime = useCallback(() => {
    setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
  }, [setLastUpdated]);

  const fetchCategories = useCallback(async (type: CategoryType) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCategoriesFromMySql(type);
      if (!result.success) throw new Error(result.message || `Failed to fetch categories.`);

      const fetchedCategories: ApiCategory[] = (result.data as any[]).map((cat: any): ApiCategory => {
        // Ensure createdAt is always a string to avoid React Error #31
        let createdAtStr = new Date().toISOString();
        if (cat.created_at || cat.createdAt) {
          const rawDate = cat.created_at || cat.createdAt;
          if (rawDate instanceof Date) {
            createdAtStr = rawDate.toISOString();
          } else if (typeof rawDate === 'string') {
            createdAtStr = rawDate;
          }
        }

        return {
          id: String(cat.id),
          name: String(cat.name || 'Unnamed Category'),
          description: cat.description || null,
          icon: String(cat.icon || (type === 'parlour' ? '✨' : '📁')),
          itemCount: parseInt(cat.itemCount) || 0,
          visibleToUsers: cat.visibleToUsers === undefined ? true : Boolean(cat.visibleToUsers),
          createdAt: createdAtStr,
          status: cat.status,
          keywords: cat.keywords || null
        };
      });
      setAllCategories(fetchedCategories);
      updateLastUpdatedTime();
    } catch (e: any) {
      console.error(`Failed to fetch ${type} categories:`, e);
      setError(e.message || `Failed to load ${type} categories.`);
      setAllCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [updateLastUpdatedTime]);


  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchCategories(categoryType);
      setCurrentPage(1);
    }
  }, [categoryType, fetchCategories, isAdminLoggedIn]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption]);

  const handleRefresh = useCallback(() => {
    fetchCategories(categoryType);
    setCurrentPage(1);
  }, [categoryType, fetchCategories]);

  const handleAddCategory = async (data: CategoryFormValues) => {
    const newCategoryId = String(Date.now());
    const newCategoryPayload = {
      id: newCategoryId,
      ...data,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      status: data.visibleToUsers ? 'active' : 'inactive',
    };

    try {
      const payload = {
        id: newCategoryId,
        ...data,
        type: categoryType,
        itemCount: 0,
        createdAt: new Date().toISOString(),
        status: data.visibleToUsers ? 'active' : 'inactive',
      };

      const result = await upsertCategoryToMySql(payload);

      if (!result.success) {
        throw new Error(result.message || `Failed to add category.`);
      }

      toast({ title: "Success", description: `Category "${decodeHtmlEntities(data.name)}" added locally.` });
      setIsAddDialogOpen(false);
      fetchCategories(categoryType);
    } catch (error: any) {
      toast({ title: "Error Adding Category", description: error.message, variant: "destructive" });
    }
  };

  const handleEditCategory = async (data: CategoryFormValues) => {
    if (!editingCategoryData) return;

    const updatedCategoryPayload = {
      ...editingCategoryData,
      ...data,
      status: data.visibleToUsers ? 'active' : 'inactive',
    };

    try {
      const updatedCategoryPayload = {
        ...editingCategoryData,
        ...data,
        type: categoryType,
        status: data.visibleToUsers ? 'active' : 'inactive',
      };

      const result = await upsertCategoryToMySql(updatedCategoryPayload);

      if (!result.success) {
        throw new Error(result.message || `Failed to update category.`);
      }

      toast({ title: "Success", description: `Category "${decodeHtmlEntities(data.name)}" updated locally.` });
      setIsEditDialogOpen(false);
      setEditingCategoryData(null);
      fetchCategories(categoryType);
    } catch (error: any) {
      toast({ title: "Error Updating Category", description: error.message, variant: "destructive" });
    }
  };

  const openEditDialog = (category: ApiCategory) => {
    setEditingCategoryData(category);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setCategoryToDeleteInfo({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDeleteInfo) return;
    try {
      const result = await deleteCategoryFromMySql(categoryToDeleteInfo.id);

      if (!result.success) {
        throw new Error(result.message || `Failed to delete category.`);
      }

      toast({ title: "Success", description: `Category "${decodeHtmlEntities(categoryToDeleteInfo.name)}" deleted from local DB.` });
      setIsDeleteDialogOpen(false);
      setCategoryToDeleteInfo(null);
      fetchCategories(categoryType);
    } catch (error: any) {
      toast({ title: "Error Deleting Category", description: error.message, variant: "destructive" });
      setIsDeleteDialogOpen(false);
      setCategoryToDeleteInfo(null);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const categoryToUpdate = allCategories.find(cat => cat.id === id);
    if (!categoryToUpdate) {
      toast({ title: "Error", description: "Category not found.", variant: "destructive" });
      return;
    }

    const updatedCategoryPayload = {
      ...categoryToUpdate,
      visibleToUsers: !categoryToUpdate.visibleToUsers,
      status: !categoryToUpdate.visibleToUsers ? 'active' : 'inactive',
    };

    try {
      const result = await upsertCategoryToMySql(updatedCategoryPayload);

      if (!result.success) {
        throw new Error(result.message || `Failed to update visibility.`);
      }

      toast({ title: "Status Updated", description: `Visibility for "${decodeHtmlEntities(categoryToUpdate.name)}" ${updatedCategoryPayload.visibleToUsers ? 'set to visible' : 'set to hidden'}.` });
      fetchCategories(categoryType);
    } catch (error: any) {
      toast({ title: "Error Updating Visibility", description: error.message, variant: "destructive" });
    }
  };

  const openItemKeymapDialog = async (category: ApiCategory) => {
    setKeymapCategory(category);
    setIsKeymapDialogOpen(true);
    setIsLoadingKeymap(true);
    setIsLoadingOrderItems(true);
    setKeymapSearchTerm('');
    setOrderItemsSearchTerm('');
    setKeymapPage(1);
    setOrderItemsPage(1);

    // Initialize keywords from category
    const rawKw = category.keywords ? String(category.keywords).trim() : '';
    const initialKws = rawKw ? rawKw.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean) : [];
    setCategoryKeywords(initialKws);

    try {
      const [mappedRes, orderRes] = await Promise.all([
        getCategoryMappedItems(category.id),
        getCategoryOrderItems(category.id, categoryType)
      ]);

      if (mappedRes.success && mappedRes.data) {
        setKeymapItems(mappedRes.data);
      } else {
        setKeymapItems([]);
      }

      if (orderRes.success && orderRes.data) {
        setOrderItemsForCategory(orderRes.data);
      } else {
        setOrderItemsForCategory([]);
      }
    } catch (err: any) {
      console.error('Error loading keymap items:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to load mapped items.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingKeymap(false);
      setIsLoadingOrderItems(false);
    }
  };

  const handleSaveKeywords = async () => {
    if (!keymapCategory) return;
    setIsSavingKeywords(true);
    try {
      const kwString = categoryKeywords.join(', ');
      const res = await updateCategoryKeywords(keymapCategory.id, kwString);
      if (!res.success) throw new Error(res.message || 'Failed to save keywords.');

      // Update current category in local state
      setKeymapCategory(prev => prev ? { ...prev, keywords: kwString } : null);
      setAllCategories(prev => prev.map(c => c.id === keymapCategory.id ? { ...c, keywords: kwString } : c));

      // Re-fetch matched order items
      setIsLoadingOrderItems(true);
      const orderRes = await getCategoryOrderItems(keymapCategory.id, categoryType);
      if (orderRes.success && orderRes.data) {
        setOrderItemsForCategory(orderRes.data);
      }

      toast({
        title: 'Keywords Saved',
        description: `Order items matching these keywords will now auto-route to "${decodeHtmlEntities(keymapCategory.name)}".`,
      });
    } catch (err: any) {
      toast({
        title: 'Save Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSavingKeywords(false);
      setIsLoadingOrderItems(false);
    }
  };

  const handleRemapItem = async (itemId: string, newCategoryId: string, itemName: string) => {
    try {
      const res = await remapMenuItemCategory(itemId, newCategoryId);
      if (!res.success) throw new Error(res.message || 'Failed to remap item.');

      toast({
        title: 'Item Remapped',
        description: `"${itemName}" was successfully remapped.`,
      });

      if (keymapCategory) {
        const mappedRes = await getCategoryMappedItems(keymapCategory.id);
        if (mappedRes.success && mappedRes.data) {
          setKeymapItems(mappedRes.data);
        }
        fetchCategories(categoryType);
      }
    } catch (err: any) {
      toast({
        title: 'Remap Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const filteredKeymapItems = useMemo(() => {
    if (!keymapSearchTerm.trim()) return keymapItems;
    const term = keymapSearchTerm.toLowerCase();
    return keymapItems.filter(item => (item.name || '').toLowerCase().includes(term));
  }, [keymapItems, keymapSearchTerm]);

  const keymapTotalPages = Math.max(1, Math.ceil(filteredKeymapItems.length / KEYMAP_ITEMS_PER_PAGE));
  const paginatedKeymapItems = useMemo(() => {
    const startIndex = (keymapPage - 1) * KEYMAP_ITEMS_PER_PAGE;
    return filteredKeymapItems.slice(startIndex, startIndex + KEYMAP_ITEMS_PER_PAGE);
  }, [filteredKeymapItems, keymapPage]);

  const filteredOrderItems = useMemo(() => {
    if (!orderItemsSearchTerm.trim()) return orderItemsForCategory;
    const term = orderItemsSearchTerm.toLowerCase();
    return orderItemsForCategory.filter(it => (it.name || '').toLowerCase().includes(term));
  }, [orderItemsForCategory, orderItemsSearchTerm]);

  const orderItemsTotalPages = Math.max(1, Math.ceil(filteredOrderItems.length / KEYMAP_ITEMS_PER_PAGE));
  const paginatedOrderItems = useMemo(() => {
    const startIndex = (orderItemsPage - 1) * KEYMAP_ITEMS_PER_PAGE;
    return filteredOrderItems.slice(startIndex, startIndex + KEYMAP_ITEMS_PER_PAGE);
  }, [filteredOrderItems, orderItemsPage]);

  const suggestedCategoryKeywords = useMemo(() => {
    if (!keymapCategory) return [];
    const suggestions = new Set<string>();

    // Add category name keywords
    const catWords = decodeHtmlEntities(keymapCategory.name)
      .toLowerCase()
      .replace(/[()[\]{}&/\\+\-_|,:]+/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
    catWords.forEach(w => suggestions.add(w));

    // Common category synonyms
    const lowerName = keymapCategory.name.toLowerCase();
    if (lowerName.includes('appetizer') || lowerName.includes('starter')) {
      ['appetizer', 'starter', 'snacks', 'platter', 'bolani', 'mantu', 'roll', 'crispy'].forEach(w => suggestions.add(w));
    } else if (lowerName.includes('burger')) {
      ['burger', 'patty', 'cheeseburger', 'beef burger', 'chicken burger', 'bun'].forEach(w => suggestions.add(w));
    } else if (lowerName.includes('beverage') || lowerName.includes('drink')) {
      ['juice', 'shake', 'smoothie', 'mojito', 'soda', 'tea', 'coffee', 'cold drink'].forEach(w => suggestions.add(w));
    } else if (lowerName.includes('dessert') || lowerName.includes('sweet')) {
      ['cake', 'ice cream', 'pastry', 'pudding', 'sweet', 'falooda', 'waffle'].forEach(w => suggestions.add(w));
    } else if (lowerName.includes('biryani') || lowerName.includes('rice')) {
      ['biryani', 'kacchi', 'polao', 'fried rice', 'khichuri', 'basmati'].forEach(w => suggestions.add(w));
    }

    // Extract high-frequency words from order items in this category
    if (orderItemsForCategory && orderItemsForCategory.length > 0) {
      const stopWords = new Set(['the', 'and', 'with', 'for', 'pcs', 'piece', 'pieces', 'plate', 'special', 'box', 'set', 'hot', 'cold', 'half', 'full', 'regular', 'mini', 'from', 'order']);
      const wordCounts: Record<string, number> = {};
      for (const item of orderItemsForCategory) {
        const words = String(item.name || '')
          .toLowerCase()
          .replace(/[()[\]{}&/\\+\-_|,.:0-9]+/g, ' ')
          .split(/\s+/)
          .filter(w => w.length >= 3 && !stopWords.has(w));
        for (const w of words) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      }
      const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([w]) => w);
      sortedWords.forEach(w => suggestions.add(w));
    }

    return Array.from(suggestions).filter(s => !categoryKeywords.some(k => k.toLowerCase() === s.toLowerCase())).slice(0, 8);
  }, [keymapCategory, orderItemsForCategory, categoryKeywords]);

  const filteredAndSortedCategories = useMemo(() => {
    let categories = allCategories
      .filter(category => {
        const decodedName = decodeHtmlEntities(category.name);
        const decodedDesc = decodeHtmlEntities(category.description);
        const matchesSearch = decodedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (decodedDesc && decodedDesc.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' ||
          (statusFilter === 'visible' && category.visibleToUsers) ||
          (statusFilter === 'hidden' && !category.visibleToUsers);
        return matchesSearch && matchesStatus;
      });

    switch (sortOption) {
      case 'name-asc':
        categories = categories.sort((a, b) => decodeHtmlEntities(a.name).localeCompare(decodeHtmlEntities(b.name)));
        break;
      case 'name-desc':
        categories = categories.sort((a, b) => decodeHtmlEntities(b.name).localeCompare(decodeHtmlEntities(a.name)));
        break;
      case 'items-desc':
        categories = categories.sort((a, b) => b.itemCount - a.itemCount);
        break;
      case 'items-asc':
        categories = categories.sort((a, b) => a.itemCount - b.itemCount);
        break;
      case 'newest':
        categories = categories.sort((a, b) => {
          try {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } catch { return 0; }
        });
        break;
      case 'oldest':
        categories = categories.sort((a, b) => {
          try {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } catch { return 0; }
        });
        break;
      default:
        categories = categories.sort((a, b) => decodeHtmlEntities(a.name).localeCompare(decodeHtmlEntities(b.name)));
    }
    return categories;
  }, [allCategories, searchTerm, statusFilter, sortOption]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedCategories.length / ITEMS_PER_PAGE);
  }, [filteredAndSortedCategories.length]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedCategories.slice(startIndex, endIndex);
  }, [filteredAndSortedCategories, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };


  const stats = useMemo(() => {
    const total = allCategories.length;
    const visible = allCategories.filter(c => c.visibleToUsers).length;
    const totalItems = allCategories.reduce((sum, c) => sum + c.itemCount, 0);
    const averageItems = total > 0 ? (totalItems / total).toFixed(1) : 0;
    return { total, visible, averageItems };
  }, [allCategories]);

  const categoryTypeName = categoryType === 'restaurant' ? 'Restaurant' : 'Parlour';

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isNaN(date.getTime()) ? dateString : format(date, "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-full bg-background/30 p-4 sm:p-6 lg:p-10 w-full overflow-x-hidden relative">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8 w-full mt-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <FolderKanban className="h-8 w-8 mr-3 text-primary" />
            Category Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage {categoryTypeName.toLowerCase()} MagicTab categories</p>
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="category-type-select" className="text-sm font-medium text-muted-foreground">Category Type:</Label>
          <Select value={categoryType} onValueChange={(value) => setCategoryType(value as CategoryType)}>
            <SelectTrigger id="category-type-select" className="w-full sm:w-[180px] mt-1">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="parlour">Parlour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCardAdminPage
          title={`${categoryTypeName} Categories`}
          value={isLoading ? <Skeleton className="h-10 w-16 bg-white/30" /> : stats.total}
          description="Manage your MagicTab sections"
          icon={LayoutList}
          className="bg-primary"
        />
        <StatCardAdminPage
          title="Visible Categories"
          value={isLoading ? <Skeleton className="h-10 w-16 bg-white/30" /> : stats.visible}
          description={`${stats.total > 0 ? ((stats.visible / stats.total) * 100).toFixed(0) : 0}% shown to customers`}
          icon={Eye}
          className="bg-teal-600"
        />
        <StatCardAdminPage
          title="Average Items"
          value={isLoading ? <Skeleton className="h-10 w-16 bg-white/30" /> : stats.averageItems}
          description="Items per category"
          icon={BarChartBig}
          className="bg-amber-600"
        />
      </section>

      <section className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border flex flex-col flex-grow min-h-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{categoryTypeName} Categories</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your {categoryTypeName.toLowerCase()} MagicTab with custom categories.
              {lastUpdated && <span className="text-green-600 dark:text-green-400"> • Last updated: {lastUpdated}</span>}
            </p>
          </div>
          {canCreate && (
            <Button variant="default" onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground mt-3 sm:mt-0">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add {categoryTypeName} Category
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-border">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'visible' | 'hidden')}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptionsList.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-grow min-h-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 border rounded-md">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Error loading categories: {error}</p>
            </div>
          ) : paginatedCategories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <LayoutList className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">No categories found.</p>
              {searchTerm && <p>Try adjusting your search or filters.</p>}
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] hidden sm:table-cell"></TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xl">
                          {category.icon}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{decodeHtmlEntities(category.name)}</div>
                        {category.description && <div className="text-xs text-muted-foreground line-clamp-1">{decodeHtmlEntities(category.description)}</div>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">{category.itemCount} items</Badge>
                      </TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={category.visibleToUsers ? "default" : "outline"}
                          className={cn(category.visibleToUsers ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border-green-300 dark:border-green-600" : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border-red-300 dark:border-red-600")}>
                          {category.visibleToUsers ? <Eye className="h-3.5 w-3.5 mr-1.5" /> : <EyeOff className="h-3.5 w-3.5 mr-1.5" />}
                          {category.visibleToUsers ? "Visible" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canEdit && (
                              <>
                                <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleVisibility(category.id)}>
                                  {category.visibleToUsers ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                  {category.visibleToUsers ? "Set as Hidden" : "Set as Visible"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openItemKeymapDialog(category)}>
                                  <FolderTree className="mr-2 h-4 w-4 text-orange-500" /> Item Keymap
                                </DropdownMenuItem>
                              </>
                            )}
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDeleteCategory(category.id, category.name)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border text-sm text-muted-foreground">
          <p>Showing {paginatedCategories.length} of {filteredAndSortedCategories.length} {categoryTypeName.toLowerCase()} categories.</p>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant={totalPages === 0 ? "outline" : "default"}
              size="sm"
              className="w-8 h-8 p-0"
              disabled={totalPages === 0 || isLoading}
              onClick={() => setCurrentPage(1)}
            >
              {totalPages > 0 ? currentPage : '-'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0 || isLoading}
            >
              Next
            </Button>
          </div>
          <Button variant="outline" size="sm" disabled>Export {categoryTypeName} Categories</Button>
        </div>
      </section>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)] p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">Add New {categoryTypeName} Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleAddCategory}
            onOpenChange={setIsAddDialogOpen}
            isEditMode={false}
          />
        </DialogContent>
      </Dialog>

      {editingCategoryData && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingCategoryData(null);
        }}>
          <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)] p-0 gap-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-2xl">Edit {categoryTypeName} Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              initialData={editingCategoryData}
              onSubmit={handleEditCategory}
              onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) setEditingCategoryData(null);
              }}
              isEditMode={true}
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{decodeHtmlEntities(categoryToDeleteInfo?.name || '')}"? This action cannot be undone. All associated menu items might also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDeleteInfo(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Item Keymap Dialog */}
      {keymapCategory && (
        <Dialog open={isKeymapDialogOpen} onOpenChange={(open) => {
          setIsKeymapDialogOpen(open);
          if (!open) setKeymapCategory(null);
        }}>
          <DialogContent className="sm:max-w-3xl md:max-w-4xl flex flex-col max-h-[90vh] p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-5 pb-4 border-b bg-muted/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl shadow-xs shrink-0">
                    {keymapCategory.icon || '📁'}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <span>Item Keymap:</span>
                      <span className="text-primary">{decodeHtmlEntities(keymapCategory.name)}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                      Manage, map, or re-route items assigned to this {categoryTypeName.toLowerCase()} category.
                    </DialogDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs shrink-0">
                  {keymapItems.length} items mapped
                </Badge>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden p-6">
              <Tabs defaultValue="keywords" className="h-full flex flex-col">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="keywords" className="text-xs flex items-center gap-1.5">
                    <Tags className="w-3.5 h-3.5 text-primary" />
                    Item Keywords ({categoryKeywords.length})
                  </TabsTrigger>
                  <TabsTrigger value="mapped" className="text-xs">
                    Mapped Items ({filteredKeymapItems.length})
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Item Keywords (Order Auto-Mapping) */}
                <TabsContent value="keywords" className="flex-1 flex flex-col min-h-0 space-y-4 mt-0 overflow-y-auto pr-1">
                  <div className="bg-card border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                          <Tags className="w-4 h-4 text-primary" />
                          <span>Category Auto-Routing Keywords</span>
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Items from customer orders containing these keywords will automatically show under <strong className="text-foreground">{decodeHtmlEntities(keymapCategory.name)}</strong>.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSaveKeywords}
                        disabled={isSavingKeywords}
                        className="font-semibold text-xs h-8.5 px-4 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                      >
                        {isSavingKeywords ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1.5" /> Save Keywords
                          </>
                        )}
                      </Button>
                    </div>

                    <KeywordInput
                      keywords={categoryKeywords}
                      onChange={setCategoryKeywords}
                      label="Keywords"
                      placeholder="Add your keywords"
                      tooltipText={`Any items from customer orders containing these keywords will route to ${decodeHtmlEntities(keymapCategory.name)}.`}
                      suggestions={suggestedCategoryKeywords}
                    />

                    {categoryKeywords.length === 0 && suggestedCategoryKeywords.length === 0 && (
                      <div className="text-xs text-muted-foreground italic flex items-center gap-1.5 pt-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        No custom keywords added yet. Items from customer orders will use default matching.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 1: Mapped Items */}
                <TabsContent value="mapped" className="flex-1 flex flex-col min-h-0 space-y-3 mt-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search mapped items..."
                      value={keymapSearchTerm}
                      onChange={(e) => {
                        setKeymapSearchTerm(e.target.value);
                        setKeymapPage(1);
                      }}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto border rounded-xl divide-y min-h-[300px] max-h-[420px]">
                    {isLoadingKeymap ? (
                      <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Loading items...</span>
                      </div>
                    ) : filteredKeymapItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs gap-1">
                        <FolderTree className="h-8 w-8 opacity-40 mb-1" />
                        <p className="font-semibold">
                          {keymapSearchTerm ? `No items matching "${keymapSearchTerm}"` : 'No items mapped to this category.'}
                        </p>
                        <p className="text-[11px] opacity-75">Switch to "Map From Catalog" or "Quick Add" to map items here.</p>
                      </div>
                    ) : (
                      paginatedKeymapItems.map((item: any) => (
                        <div key={item.id} className="p-3 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{decodeHtmlEntities(item.name)}</span>
                              {item.subItems && item.subItems.length > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {item.subItems.length} variations
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span className="font-medium text-foreground">৳ {Number(item.price).toLocaleString()}</span>
                              {item.description && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[280px]">{decodeHtmlEntities(item.description)}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Fast lightweight native select for instant rendering */}
                            <div className="relative flex items-center">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
                              <select
                                value={item.categoryId || keymapCategory.id}
                                onChange={(e) => {
                                  const newCatId = e.target.value;
                                  if (newCatId && newCatId !== keymapCategory.id) {
                                    handleRemapItem(item.id, newCatId, item.name);
                                  }
                                }}
                                aria-label="Re-map category"
                                className="h-8 pl-8 pr-2 text-xs rounded-md border border-input bg-background text-foreground hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring max-w-[170px] truncate cursor-pointer shadow-xs"
                              >
                                {allCategories.map((c) => (
                                  <option key={c.id} value={c.id} className="bg-popover text-popover-foreground py-1">
                                    {c.icon ? `${c.icon} ` : ''}{decodeHtmlEntities(c.name)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Tab 1 Pagination */}
                  {filteredKeymapItems.length > KEYMAP_ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between px-1 pt-2 text-xs text-muted-foreground shrink-0 border-t">
                      <span>
                        Showing {Math.min((keymapPage - 1) * KEYMAP_ITEMS_PER_PAGE + 1, filteredKeymapItems.length)} - {Math.min(keymapPage * KEYMAP_ITEMS_PER_PAGE, filteredKeymapItems.length)} of {filteredKeymapItems.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs gap-1"
                          onClick={() => setKeymapPage(p => Math.max(1, p - 1))}
                          disabled={keymapPage <= 1}
                        >
                          <ChevronLeft className="h-3.5 w-3.5" /> Prev
                        </Button>
                        <span className="font-medium text-foreground">
                          {keymapPage} / {keymapTotalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs gap-1"
                          onClick={() => setKeymapPage(p => Math.min(keymapTotalPages, p + 1))}
                          disabled={keymapPage >= keymapTotalPages}
                        >
                          Next <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="p-4 border-t bg-muted/20 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsKeymapDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      </div>
    </div>
  );
}











