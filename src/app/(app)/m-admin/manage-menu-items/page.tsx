
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Button,
  buttonVariants
} from "@/components/ui/button";
import {
  Input
} from "@/components/ui/input";
import {
  Label
} from "@/components/ui/label";
import {
  Switch
} from "@/components/ui/switch";
import {
  Badge
} from "@/components/ui/badge";
import {
  ScrollArea
} from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
  Skeleton
} from "@/components/ui/skeleton";
import {
  Search,
  RefreshCw,
  ListFilter,
  PlusCircle,
  Edit3,
  Trash2,
  MoreHorizontal,
  Utensils,
  AlertTriangle,
  PackageSearch,
  GripVertical,
  Save,
  DollarSign,
  ListChecks
} from "lucide-react";
import {
  cn
} from "@/lib/utils";
import {
  format,
  parseISO,
  isValid as isValidDate
} from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Reorder } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


type MenuType = "restaurant" | "parlour";

interface CategoryAdmin {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
  visibleToUsers: boolean;
}

interface MenuItemAdmin {
  id: string;
  name: string;
  price: number;
  status: 'Active' | 'Inactive'; 
  addedDate: string; 
  categoryId: string;
  visibleToUsers?: boolean; 
  image?: string | null; 
}

const SKELETON_ITEM_COUNT = 6; 
const STATIC_ITEM_IMAGE_URL = 'https://colorhutbd.xyz/image.svg';

const menuItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name must be 100 characters or less"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  categoryId: z.string().min(1, "Category is required"),
  visibleToUsers: z.boolean().default(true),
  // id is not part of the form validation for new items, but will be present for edits
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema> & { id?: string };


interface MenuItemFormProps {
  initialData?: MenuItemAdmin;
  categories: CategoryAdmin[];
  menuType: MenuType;
  onSubmit: (data: MenuItemFormValues) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
}

function MenuItemForm({ initialData, categories, menuType, onSubmit, onOpenChange, isEditMode }: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      categoryId: initialData?.categoryId || (categories.length > 0 ? categories[0].id : ""),
      visibleToUsers: initialData ? initialData.status === 'Active' : true,
      id: initialData?.id,
    },
    mode: 'onChange',
  });

  const handleSubmit = async (data: MenuItemFormValues) => {
    const payload = { ...data, id: initialData?.id }; // Ensure ID is included for edits
    await onSubmit(payload);
  };
  
  const currentCategoryName = categories.find(c => c.id === form.watch('categoryId'))?.name || "Select category";


  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-grow">
      <ScrollArea className="flex-grow min-h-0 p-1">
        <div className="space-y-4">
          <div>
            <Label htmlFor="item-name">Item Name*</Label>
            <Input id="item-name" {...form.register("name")} placeholder="e.g., Special Pizza, Coffee" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="item-price">Price (৳)*</Label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="item-price" type="number" {...form.register("price")} placeholder="0.00" className="pl-8" step="0.01"/>
            </div>
            {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
          </div>
          <div>
            <Label htmlFor="item-category">Category*</Label>
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isEditMode} // Disable category change in edit mode for simplicity
                >
                  <SelectTrigger id="item-category" disabled={isEditMode}>
                    <SelectValue placeholder={currentCategoryName} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.categoryId && <p className="text-sm text-destructive mt-1">{form.formState.errors.categoryId.message}</p>}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Controller
              control={form.control}
              name="visibleToUsers"
              render={({ field }) => (
                <Switch id="item-visible" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="item-visible" className="cursor-pointer">Visible to Customers (Active)</Label>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="pt-4 border-t mt-auto">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {form.formState.isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : <><Save className="mr-2 h-4 w-4" /> {isEditMode ? "Save Changes" : "Add Item"}</>}
        </Button>
      </DialogFooter>
    </form>
  );
}


export default function ManageMenuItemsPage(): ReactNode {
  const [menuType, setMenuType] = useState<MenuType>("restaurant");
  const [allCategories, setAllCategories] = useState<CategoryAdmin[]>([]);
  const [orderedCategories, setOrderedCategories] = useState<CategoryAdmin[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryAdmin | null>(null);
  
  const [allMenuItems, setAllMenuItems] = useState<MenuItemAdmin[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItemAdmin[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [loadingItems, setLoadingItems] = useState(false); 
  const [errorItems, setErrorItems] = useState<string | null>(null);

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [editingItemData, setEditingItemData] = useState<MenuItemAdmin | null>(null);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [itemToDeleteInfo, setItemToDeleteInfo] = useState<{ id: string, name: string } | null>(null);
  
  const { toast } = useToast();

  const getCategoriesApiUrl = (type: MenuType) => type === 'parlour'
    ? 'https://colorhutbd.xyz/vm/api/parlour-categories.php'
    : 'https://colorhutbd.xyz/vm/api/categories.php';

  const getMenuItemsApiUrl = (type: MenuType) => type === 'parlour'
    ? 'https://colorhutbd.xyz/vm/api/parlour-items.php'
    : 'https://colorhutbd.xyz/vm/api/menu-items.php';


  const fetchCategoriesAndItems = useCallback(async (currentMenuType: MenuType, retainSelectedCategory: boolean = false) => {
    setLoadingCategories(true);
    setErrorCategories(null);
    setLoadingItems(true);
    setErrorItems(null);

    const prevSelectedCategoryId = retainSelectedCategory ? selectedCategory?.id : null;

    const categoriesApiUrl = getCategoriesApiUrl(currentMenuType);
    const menuItemsApiUrl = getMenuItemsApiUrl(currentMenuType);

    try {
      const [categoriesResponse, menuItemsResponse] = await Promise.all([
        fetch(categoriesApiUrl, { headers: { 'Accept': 'application/json' } }),
        fetch(menuItemsApiUrl, { headers: { 'Accept': 'application/json' } }) // Fetch all items, not visibleOnly for admin
      ]);

      if (!categoriesResponse.ok) throw new Error(`Categories API error! status: ${categoriesResponse.status}`);
      const categoriesResult = await categoriesResponse.json();
      if (!categoriesResult.success || !categoriesResult.data || !Array.isArray(categoriesResult.data.categories)) {
        throw new Error('Invalid data format for categories.');
      }
      const fetchedCategoriesRaw: CategoryAdmin[] = categoriesResult.data.categories.map((cat: any): CategoryAdmin => ({
        id: String(cat.id),
        name: String(cat.name || 'Unnamed Category'),
        icon: String(cat.icon || '📁'),
        itemCount: parseInt(cat.itemCount) || 0,
        visibleToUsers: cat.visibleToUsers === undefined ? true : Boolean(cat.visibleToUsers), 
      }));
      
      const visibleAdminCategories = fetchedCategoriesRaw.filter(cat => cat.visibleToUsers);

      setAllCategories(visibleAdminCategories);
      setOrderedCategories(visibleAdminCategories);

      if (visibleAdminCategories.length > 0) {
        let categoryToSelect = visibleAdminCategories[0];
        if (prevSelectedCategoryId) {
            const foundCat = visibleAdminCategories.find(c => c.id === prevSelectedCategoryId);
            if (foundCat) categoryToSelect = foundCat;
        }
        setSelectedCategory(categoryToSelect);
      } else {
        setSelectedCategory(null);
      }

      if (!menuItemsResponse.ok) throw new Error(`Menu Items API error! status: ${menuItemsResponse.status}`);
      const menuItemsResult = await menuItemsResponse.json();

      let rawItemsArray: any[] = [];
      if (Array.isArray(menuItemsResult)) { // Direct array for restaurant items
          rawItemsArray = menuItemsResult;
      } else if (menuItemsResult.success) { // Standard structure for parlour items or other successful responses
        if (Array.isArray(menuItemsResult.data)) {
          rawItemsArray = menuItemsResult.data;
        } else if (menuItemsResult.data && Array.isArray(menuItemsResult.data.items)) {
          rawItemsArray = menuItemsResult.data.items;
        } else {
          throw new Error('Invalid data format for menu items.');
        }
      } else {
        throw new Error(menuItemsResult.message || 'API request for menu items was not successful.');
      }
      
      const fetchedMenuItems: MenuItemAdmin[] = rawItemsArray.map((item: any): MenuItemAdmin => ({
        id: String(item.id),
        name: String(item.name || 'Unnamed Item'),
        price: parseFloat(item.price) || 0,
        status: (item.visibleToUsers === '1' || item.visibleToUsers === true || item.status === 'active') ? 'Active' : 'Inactive',
        addedDate: item.createdAt || new Date().toISOString(),
        categoryId: String(item.category),
        visibleToUsers: item.visibleToUsers === undefined ? true : Boolean(item.visibleToUsers),
        image: item.image || null, 
      }));
      setAllMenuItems(fetchedMenuItems);

    } catch (e: any) {
      console.error("Failed to fetch data:", e);
      setErrorCategories(e.message || `Failed to load ${currentMenuType} categories.`);
      setErrorItems(e.message || `Failed to load ${currentMenuType} menu items.`);
      setAllCategories([]);
      setOrderedCategories([]);
      setSelectedCategory(null);
      setAllMenuItems([]);
    } finally {
      setLoadingCategories(false);
      setLoadingItems(false);
    }
  }, [selectedCategory?.id]);

  useEffect(() => {
    fetchCategoriesAndItems(menuType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuType]);

  useEffect(() => {
    if (!selectedCategory) {
        setFilteredMenuItems([]); 
        return;
    }

    let items = allMenuItems.filter(item => item.categoryId === selectedCategory.id);

    if (searchTerm) {
      items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      items = items.filter(item => item.status.toLowerCase() === statusFilter);
    }
    setFilteredMenuItems(items);
  }, [allMenuItems, selectedCategory, searchTerm, statusFilter]);

  const totalAllItemsCount = useMemo(() => {
    return allCategories.reduce((sum, cat) => sum + cat.itemCount, 0);
  }, [allCategories]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValidDate(date) ? format(date, "MMM d, yyyy") : "Invalid Date";
    } catch {
      return "Invalid Date";
    }
  };

  const handleRefresh = () => {
    fetchCategoriesAndItems(menuType, true); 
  };


  const handleAddMenuItem = async (data: MenuItemFormValues) => {
    // Backend generates ID for new items
    const { id, ...payloadWithoutId } = data;
    
    try {
      const response = await fetch(getMenuItemsApiUrl(menuType), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payloadWithoutId),
      });
      const result = await response.json();
      if (!response.ok || (result && result.success === false)) { // Check for explicit success false
        throw new Error(result.message || `Failed to add menu item. Status: ${response.status}`);
      }
      toast({ title: "Success", description: result.message || `Item "${data.name}" added to ${selectedCategory?.name || 'category'}.` });
      setIsAddItemDialogOpen(false);
      fetchCategoriesAndItems(menuType, true);
    } catch (error: any) {
      toast({ title: "Error Adding Item", description: error.message, variant: "destructive" });
    }
  };

  const openEditItemDialog = (item: MenuItemAdmin) => {
    setEditingItemData(item);
    setIsEditItemDialogOpen(true);
  };

  const handleEditMenuItem = async (data: MenuItemFormValues) => {
    if (!data.id) {
      toast({ title: "Error", description: "Item ID is missing for update.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(getMenuItemsApiUrl(menuType), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data), // Send full data including ID
      });
      const result = await response.json();
      if (!response.ok || (result && result.success === false)) {
        throw new Error(result.message || `Failed to update item. Status: ${response.status}`);
      }
      toast({ title: "Success", description: result.message || `Item "${data.name}" updated.` });
      setIsEditItemDialogOpen(false);
      setEditingItemData(null);
      fetchCategoriesAndItems(menuType, true);
    } catch (error: any) {
      toast({ title: "Error Updating Item", description: error.message, variant: "destructive" });
    }
  };

  const openDeleteItemDialog = (item: MenuItemAdmin) => {
    setItemToDeleteInfo({ id: item.id, name: item.name });
    setIsDeleteItemDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDeleteInfo) return;
    try {
      const response = await fetch(`${getMenuItemsApiUrl(menuType)}?id=${itemToDeleteInfo.id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      const result = await response.json();
      if (!response.ok || (result && result.success === false && response.status !== 404) ) { // Allow 404 if item was already deleted
         if (response.status === 404 && result.message && result.message.toLowerCase().includes('not found')) {
            // Treat as success if backend confirms not found, means it's effectively deleted
         } else {
            throw new Error(result.message || `Failed to delete item. Status: ${response.status}`);
         }
      }
      toast({ title: "Success", description: result.message || `Item "${itemToDeleteInfo.name}" deleted.` });
    } catch (error: any) {
      toast({ title: "Error Deleting Item", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteItemDialogOpen(false);
      setItemToDeleteInfo(null);
      fetchCategoriesAndItems(menuType, true);
    }
  };


  return (
    <div className="flex h-[calc(100vh-theme(spacing.16)-1px)] bg-muted/30">
      <aside className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start items-center text-md h-10 mb-2 font-semibold",
              !selectedCategory ? 'bg-muted text-foreground' : 'text-foreground'
            )}
            onClick={() => setSelectedCategory(null)} 
          >
            All Items
            <Badge variant="secondary" className="ml-auto bg-muted text-muted-foreground">{totalAllItemsCount}</Badge>
          </Button>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categories</h3>
        </div>
        <ScrollArea className="flex-1">
          {loadingCategories && (
            <div className="p-2 space-y-2.5">
              {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-md" />)}
            </div>
          )}
          {errorCategories && <p className="p-4 text-sm text-destructive">Error: {errorCategories}</p>}
          {!loadingCategories && !errorCategories && orderedCategories.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No visible categories found for {menuType}.</p>
          )}
          {!loadingCategories && !errorCategories && orderedCategories.length > 0 && (
             <Reorder.Group axis="y" values={orderedCategories} onReorder={setOrderedCategories} className="p-2 space-y-1">
              {orderedCategories.map(category => (
                <Reorder.Item key={category.id} value={category} className="bg-card rounded-md">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start items-center text-sm h-9 rounded-md",
                      selectedCategory?.id === category.id
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-card-foreground'
                    )}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span className="mr-2 text-md">{category.icon}</span>
                    <span className="flex-1 text-left truncate">{category.name}</span>
                    <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground font-normal">{category.itemCount}</Badge>
                    <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab ml-1" />
                  </Button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        <div className="py-3 px-6 border-b border-border bg-card flex items-center justify-between gap-2">
          <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-10 text-sm h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={menuType} onValueChange={(value) => setMenuType(value as MenuType)}>
              <SelectTrigger className="w-[150px] text-sm h-9">
                <Utensils className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="parlour">Parlour</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingCategories || loadingItems} className="h-9">
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingCategories || loadingItems ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
              <SelectTrigger className="w-[130px] text-sm h-9">
                <ListFilter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button 
                size="sm" 
                className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                    if (orderedCategories.length > 0) {
                        setEditingItemData(null); // Clear any editing data
                        setIsAddItemDialogOpen(true);
                    } else {
                        toast({title: "Cannot Add Item", description: "Please add a category first.", variant: "default"});
                    }
                }}
                disabled={orderedCategories.length === 0}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 bg-background">
          <div className="p-6">
            {loadingItems && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: SKELETON_ITEM_COUNT }).map((_, i) => (
                  <div key={i} className="flex items-center p-3 gap-4 bg-card border border-border rounded-lg shadow-sm">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            )}
            {!loadingItems && errorItems && (
              <div className="text-center py-10 text-destructive bg-card border border-destructive/20 rounded-lg">
                <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
                <p className="text-md">Error loading items: {errorItems}</p>
              </div>
            )}
            {!loadingItems && !errorItems && !selectedCategory && (
                 <div className="flex-1 flex items-center justify-center text-center py-10 text-muted-foreground bg-card border border-border rounded-lg">
                    <div>
                        <PackageSearch className="mx-auto h-12 w-12 mb-4 opacity-70" />
                        <p className="text-md">Select a category to view its menu items.</p>
                    </div>
                </div>
            )}
            {!loadingItems && !errorItems && selectedCategory && filteredMenuItems.length === 0 && (
              <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-lg">
                 <PackageSearch className="mx-auto h-12 w-12 mb-4 opacity-70" />
                <p className="text-md">
                  {searchTerm || statusFilter !== 'all'
                    ? "No items match your criteria for this category."
                    : "No menu items available for this category."}
                </p>
              </div>
            )}
            {!loadingItems && !errorItems && selectedCategory && filteredMenuItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map(item => (
                  <div key={item.id} className="flex items-center p-3 gap-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      <Image 
                        src={STATIC_ITEM_IMAGE_URL} 
                        alt={item.name} 
                        width={40} 
                        height={40} 
                        className="h-full w-full object-contain" 
                        data-ai-hint="item illustration"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <Badge 
                          variant={item.status === 'Active' ? 'default' : 'outline'}
                          className={cn(
                            "text-xs px-1.5 py-0.5",
                            item.status === 'Active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border-green-300 dark:border-green-600' 
                            : 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border-red-300 dark:border-red-600'
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Added {formatDate(item.addedDate)}</p>
                    </div>
                    <div className="text-sm font-semibold text-foreground whitespace-nowrap">
                      ৳{item.price.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditItemDialog(item)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Item
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openDeleteItemDialog(item)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                          </DropdownMenuItem>
                          <DropdownMenuSeparator/>
                          <DropdownMenuItem disabled>Duplicate Item</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        {selectedCategory && filteredMenuItems.length > 0 && (
          <div className="flex justify-start items-center py-3 px-6 border-t border-border bg-card text-sm text-muted-foreground">
            <p>Showing {filteredMenuItems.length} items for "{selectedCategory.name}".</p>
          </div>
        )}
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Menu Item</DialogTitle>
          </DialogHeader>
          <MenuItemForm 
            categories={orderedCategories}
            menuType={menuType}
            onSubmit={handleAddMenuItem} 
            onOpenChange={setIsAddItemDialogOpen}
            isEditMode={false}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      {editingItemData && (
         <Dialog open={isEditItemDialogOpen} onOpenChange={(open) => {
            setIsEditItemDialogOpen(open);
            if (!open) setEditingItemData(null);
          }}>
          <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Menu Item</DialogTitle>
            </DialogHeader>
            <MenuItemForm 
              initialData={editingItemData}
              categories={orderedCategories}
              menuType={menuType}
              onSubmit={handleEditMenuItem} 
              onOpenChange={(open) => {
                setIsEditItemDialogOpen(open);
                if (!open) setEditingItemData(null);
              }}
              isEditMode={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={isDeleteItemDialogOpen} onOpenChange={setIsDeleteItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDeleteInfo?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDeleteInfo(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteItem} 
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

