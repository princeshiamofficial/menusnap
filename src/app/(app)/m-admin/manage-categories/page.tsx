
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  GripVertical
} from "lucide-react";
import {
  cn
} from "@/lib/utils";
import {
  format,
  parseISO
} from 'date-fns';
import {
  useToast
} from "@/hooks/use-toast";
import {
  useForm,
  Controller
} from "react-hook-form";
import {
  zodResolver
} from "@hookform/resolvers/zod";
import * as z from "zod";

type CategoryType = "restaurant" | "parlour";

interface ApiCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  itemCount: number;
  visibleToUsers: boolean;
  createdAt: string;
  status?: string; // API provides 'status', but we'll primarily use visibleToUsers
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
  icon: z.string().min(1, "Icon is required (e.g., emoji or text)").max(10, "Icon must be 10 characters or less"), // Simple text/emoji for now
  visibleToUsers: z.boolean().default(true),
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
      name: initialData?.name || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "📁",
      visibleToUsers: initialData?.visibleToUsers === undefined ? true : initialData.visibleToUsers,
    },
    mode: 'onChange',
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    await onSubmit(data);
    form.reset(); // Reset form after successful submission
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-grow">
      <ScrollArea className="flex-grow min-h-0 p-1">
        <div className="space-y-4">
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
      <DialogFooter className="pt-4 border-t mt-auto">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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


export default function ManageCategoriesPage(): ReactNode {
  const [categoryType, setCategoryType] = useState<CategoryType>("restaurant");
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState<ApiCategory | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDeleteInfo, setCategoryToDeleteInfo] = useState<{ id: string, name: string } | null>(null);

  const { toast } = useToast();

  const updateLastUpdatedTime = useCallback(() => {
    setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
  }, [setLastUpdated]);

  const fetchCategories = useCallback(async (type: CategoryType) => {
    setIsLoading(true);
    setError(null);
    const apiUrl = type === 'parlour'
      ? 'https://colorhutbd.xyz/vm/api/parlour-categories.php'
      : 'https://colorhutbd.xyz/vm/api/categories.php';

    try {
      const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`API error! status: ${response.status}`);
      const result = await response.json();

      if (!result.success || !result.data || !Array.isArray(result.data.categories)) {
        console.error(`Invalid API response structure for ${type} categories:`, result);
        throw new Error(`Invalid data format from API for ${type} categories.`);
      }

      const fetchedCategories: ApiCategory[] = result.data.categories.map((cat: any): ApiCategory => ({
        id: String(cat.id),
        name: String(cat.name || 'Unnamed Category'),
        description: cat.description || null,
        icon: String(cat.icon || '📁'),
        itemCount: parseInt(cat.itemCount) || 0,
        visibleToUsers: cat.visibleToUsers === undefined ? true : Boolean(cat.visibleToUsers),
        createdAt: cat.createdAt || new Date().toISOString(),
        status: cat.status
      }));
      setAllCategories(fetchedCategories);
      updateLastUpdatedTime();
    } catch (e: any) {
      console.error(`Failed to fetch ${type} categories:`, e);
      setError(e.message || `Failed to load ${type} categories.`);
      setAllCategories([]); 
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setAllCategories, updateLastUpdatedTime]);


  useEffect(() => {
    fetchCategories(categoryType);
  }, [categoryType, fetchCategories]);

  const handleRefresh = useCallback(() => {
    fetchCategories(categoryType);
  }, [categoryType, fetchCategories]);

  const handleAddCategory = async (data: CategoryFormValues) => {
    console.log("Adding category:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newCategory: ApiCategory = {
      id: String(Date.now()), 
      ...data,
      itemCount: 0,
      createdAt: new Date().toISOString(),
    };
    setAllCategories(prev => [newCategory, ...prev]);
    toast({ title: "Success", description: `Category "${data.name}" added.` });
    setIsAddDialogOpen(false);
    updateLastUpdatedTime();
  };

  const handleEditCategory = async (data: CategoryFormValues) => {
    if (!editingCategoryData) return;
    console.log("Editing category:", editingCategoryData.id, data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAllCategories(prev => prev.map(cat => cat.id === editingCategoryData.id ? { ...cat, ...data, id: cat.id, itemCount: cat.itemCount, createdAt: cat.createdAt } : cat));
    toast({ title: "Success", description: `Category "${data.name}" updated.` });
    setIsEditDialogOpen(false);
    setEditingCategoryData(null);
    updateLastUpdatedTime();
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
    console.log("Deleting category:", categoryToDeleteInfo.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAllCategories(prev => prev.filter(cat => cat.id !== categoryToDeleteInfo.id));
    toast({ title: "Success", description: `Category "${categoryToDeleteInfo.name}" deleted.` });
    setIsDeleteDialogOpen(false);
    setCategoryToDeleteInfo(null);
    updateLastUpdatedTime();
  };

  const handleToggleVisibility = async (id: string) => {
    console.log("Toggling visibility for category:", id);
    await new Promise(resolve => setTimeout(resolve, 500));
    setAllCategories(prev => prev.map(cat => cat.id === id ? { ...cat, visibleToUsers: !cat.visibleToUsers } : cat));
    const category = allCategories.find(c => c.id === id);
    toast({ title: "Status Updated", description: `Visibility for "${category?.name}" ${category?.visibleToUsers ? 'hidden' : 'visible'}.` });
    updateLastUpdatedTime();
  };


  const filteredCategories = useMemo(() => {
    return allCategories
      .filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' ||
          (statusFilter === 'visible' && category.visibleToUsers) ||
          (statusFilter === 'hidden' && !category.visibleToUsers);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allCategories, searchTerm, statusFilter]);

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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <FolderKanban className="h-8 w-8 mr-3 text-primary" />
            Category Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage {categoryTypeName.toLowerCase()} menu categories</p>
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
          description="Manage your menu sections"
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
              Organize your {categoryTypeName.toLowerCase()} menu with custom categories.
              {lastUpdated && <span className="text-green-600 dark:text-green-400"> • Last updated: {lastUpdated}</span>}
            </p>
          </div>
          <Button variant="default" onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground mt-3 sm:mt-0">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add {categoryTypeName} Category
          </Button>
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
          <Button variant="outline" disabled>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>
        
        <div className="flex-grow min-h-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
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
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <LayoutList className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">No categories found.</p>
              {searchTerm && <p>Try adjusting your search or filters.</p>}
            </div>
          ) : (
            <ScrollArea className="max-h-[500px] w-full">
              <Table>
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
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="hidden sm:table-cell">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xl">
                          {category.icon}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{category.name}</div>
                        {category.description && <div className="text-xs text-muted-foreground line-clamp-1">{category.description}</div>}
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
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
                              <Edit3 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVisibility(category.id)}>
                              {category.visibleToUsers ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                              {category.visibleToUsers ? "Set as Hidden" : "Set as Visible"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteCategory(category.id, category.name)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
          <p>Showing {filteredCategories.length} of {allCategories.length} {categoryTypeName.toLowerCase()} categories.</p>
          <Button variant="outline" disabled>Export {categoryTypeName} Categories</Button>
        </div>
      </section>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)]">
          <DialogHeader>
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
          <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)]">
            <DialogHeader>
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
              Are you sure you want to delete "{categoryToDeleteInfo?.name}"? This action cannot be undone. All associated menu items might also be affected.
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

    </div>
  );
}
    

    