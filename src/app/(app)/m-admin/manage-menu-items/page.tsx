
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
  Textarea
} from "@/components/ui/textarea";
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
import { Separator } from '@/components/ui/separator';
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
  Plus,
  X,
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
import { useForm, Controller, useFieldArray } from "react-hook-form";
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

interface SubMenuItemAdmin {
  id?: string; // Optional: ID for existing sub-items from backend
  name: string;
  price: number;
}

interface MenuItemAdmin {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  status: 'Active' | 'Inactive'; 
  addedDate: string; 
  categoryId: string;
  visibleToUsers?: boolean; 
  image?: string | null; 
  subItems?: SubMenuItemAdmin[];
}

const SKELETON_ITEM_COUNT = 6; 
const STATIC_ITEM_IMAGE_URL = 'https://colorhutbd.xyz/image.svg';

const menuItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name must be 100 characters or less"),
  price: z.coerce.number().min(0, "Price must be a non-negative number. If using variations, this can be 0."),
  description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
  visibleToUsers: z.boolean().default(true),
  subItems: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Variation name is required."),
      price: z.coerce.number().min(0, "Variation price must be non-negative.")
    })
  ).optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;


interface MenuItemFormProps {
  initialData?: Partial<MenuItemAdmin>;
  onSubmit: (data: MenuItemFormValues) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
}

function MenuItemForm({ initialData, onSubmit, onOpenChange, isEditMode }: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      description: initialData?.description || "",
      visibleToUsers: initialData ? initialData.status === 'Active' : true,
      subItems: initialData?.subItems?.map(si => ({ id: si.id, name: si.name, price: si.price })) || [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subItems",
  });

  const [newSubItemName, setNewSubItemName] = useState('');
  const [newSubItemPrice, setNewSubItemPrice] = useState('');

  const handleAddSubItemClick = () => {
    const priceVal = parseFloat(newSubItemPrice);
    if (newSubItemName.trim() && !isNaN(priceVal) && priceVal >= 0) {
      append({ name: newSubItemName.trim(), price: priceVal });
      setNewSubItemName('');
      setNewSubItemPrice('');
    } else {
      if (!newSubItemName.trim()) form.setError("subItems.root", { type: "manual", message: "Variation name cannot be empty." });
      if (isNaN(priceVal) || priceVal < 0) form.setError("subItems.root", { type: "manual", message: "Variation price must be a valid non-negative number." });
    }
  };


  const handleSubmit = async (data: MenuItemFormValues) => {
    await onSubmit(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-grow">
      <ScrollArea className="flex-grow min-h-0 p-1">
        <div className="space-y-4">
          <div>
            <Label htmlFor="item-name">Item name</Label>
            <Input id="item-name" {...form.register("name")} placeholder="Enter item name" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="item-price">Base Price</Label>
            <Input id="item-price" type="number" {...form.register("price")} placeholder="Enter base price (can be 0 if using variations)" step="0.01"/>
            {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
          </div>
          <div>
            <Label htmlFor="item-description">Description (optional)</Label>
            <Textarea 
              id="item-description" 
              {...form.register("description")} 
              placeholder="Enter item description" 
              rows={3} 
            />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>

          <Separator className="my-6" />

          <div>
            <Label className="text-base font-semibold">Item Variations / Sizes (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Add different sizes or variations for this item, like Small, Medium, Large.</p>
            <div className="mt-3 flex items-start gap-2">
              <div className="flex-grow space-y-1">
                <Label htmlFor="new-subitem-name" className="sr-only">Variation Name</Label>
                <Input 
                  id="new-subitem-name"
                  placeholder="Variation name (e.g., Small, Regular)"
                  value={newSubItemName}
                  onChange={(e) => setNewSubItemName(e.target.value)}
                />
              </div>
              <div className="w-32 space-y-1">
                <Label htmlFor="new-subitem-price" className="sr-only">Variation Price</Label>
                <Input 
                  id="new-subitem-price"
                  type="number"
                  placeholder="Price"
                  value={newSubItemPrice}
                  onChange={(e) => setNewSubItemPrice(e.target.value)}
                  step="0.01"
                />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleAddSubItemClick} className="mt-0 h-10 w-10 shrink-0" aria-label="Add variation">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            {form.formState.errors.subItems?.root?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.subItems.root.message}</p>}
          </div>

          {fields.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-foreground">Added Variations: {fields.length}</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="text-destructive hover:text-destructive/80 h-auto p-0 text-xs" 
                  onClick={() => remove()} // remove() without index clears all
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3 max-h-48 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center justify-between p-2 rounded-md bg-card shadow-sm">
                    <div className="flex items-center gap-2 flex-grow">
                       <span className="text-sm text-foreground truncate">{form.watch(`subItems.${index}.name`)}</span>
                       <span className="text-xs text-muted-foreground">-</span>
                       <span className="text-sm font-medium text-foreground">৳{form.watch(`subItems.${index}.price`)?.toLocaleString()}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)} 
                      className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
                      aria-label={`Remove ${form.watch(`subItems.${index}.name`)} variation`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </ScrollArea>
      <DialogFooter className="pt-6 border-t mt-auto">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {form.formState.isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Item")}
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
        fetch(menuItemsApiUrl, { headers: { 'Accept': 'application/json' } })
      ]);

      if (!categoriesResponse.ok) throw new Error(`Categories API error! status: ${categoriesResponse.status}`);
      const categoriesResult = await categoriesResponse.json();
      if (!categoriesResult.success || !categoriesResult.data || !Array.isArray(categoriesResult.data.categories)) {
        throw new Error('Invalid data format for categories.');
      }
      const fetchedCategoriesRaw: Omit<CategoryAdmin, 'itemCount'>[] = categoriesResult.data.categories.map((cat: any): Omit<CategoryAdmin, 'itemCount'> => ({
        id: String(cat.id),
        name: String(cat.name || 'Unnamed Category'),
        icon: String(cat.icon || '📁'),
        visibleToUsers: cat.visibleToUsers === undefined ? true : Boolean(cat.visibleToUsers), 
      }));
      
      const visibleAdminCategories = fetchedCategoriesRaw.filter(cat => cat.visibleToUsers);

      setAllCategories(visibleAdminCategories.map(cat => ({ ...cat, itemCount: 0 })));
      setOrderedCategories(visibleAdminCategories.map(cat => ({ ...cat, itemCount: 0 })));


      if (!menuItemsResponse.ok) throw new Error(`Menu Items API error! status: ${menuItemsResponse.status}`);
      const menuItemsResult = await menuItemsResponse.json();

      let rawItemsArray: any[] = [];
        if (currentMenuType === 'restaurant' && Array.isArray(menuItemsResult)) {
            rawItemsArray = menuItemsResult;
        } else if (menuItemsResult.success) {
            if (Array.isArray(menuItemsResult.data)) { // For parlour items which are nested under data
                rawItemsArray = menuItemsResult.data;
            } else if (menuItemsResult.data && Array.isArray(menuItemsResult.data.items)) { // Parlour items v2 (items key)
                rawItemsArray = menuItemsResult.data.items;
            } else if (menuItemsResult.data && Array.isArray(menuItemsResult.data.menuItems)) { // Parlour items v3 (menuItems key)
                 rawItemsArray = menuItemsResult.data.menuItems;
            } else {
                throw new Error('Invalid data format for menu items (expected array under "data", "data.items", or "data.menuItems" for parlour, or direct array for restaurant).');
            }
        } else if (Array.isArray(menuItemsResult)){ // Fallback for restaurant if not success but is array
             rawItemsArray = menuItemsResult;
        }
         else {
            throw new Error(menuItemsResult.message || 'API request for menu items was not successful and data format is unrecognized.');
        }
      
      const fetchedMenuItems: MenuItemAdmin[] = rawItemsArray.map((item: any): MenuItemAdmin => ({
        id: String(item.id),
        name: String(item.name || 'Unnamed Item'),
        price: parseFloat(item.price) || 0,
        description: item.description || null,
        status: (item.visibleToUsers === '1' || item.visibleToUsers === true || item.status === 'active' || item.status === 'Active') ? 'Active' : 'Inactive',
        addedDate: item.createdAt || item.addedDate || new Date().toISOString(),
        categoryId: String(item.category || item.categoryId),
        visibleToUsers: item.visibleToUsers === undefined ? true : Boolean(item.visibleToUsers),
        image: item.image || null, 
        subItems: Array.isArray(item.subItems) ? item.subItems.map((si: any) => ({id: String(si.id), name: String(si.name), price: parseFloat(si.price) || 0})) : [],
      }));
      setAllMenuItems(fetchedMenuItems);

      const categoryCounts = fetchedMenuItems.reduce((acc, item) => {
        acc[item.categoryId] = (acc[item.categoryId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const updatedCategories = visibleAdminCategories.map(cat => ({
        ...cat,
        itemCount: categoryCounts[cat.id] || 0
      }));

      setAllCategories(updatedCategories);
      setOrderedCategories(updatedCategories);
      
      if (updatedCategories.length > 0) {
        let categoryToSelect = updatedCategories[0];
        if (prevSelectedCategoryId) {
            const foundCat = updatedCategories.find(c => c.id === prevSelectedCategoryId);
            if (foundCat) categoryToSelect = foundCat;
        }
        setSelectedCategory(categoryToSelect);
      } else {
        setSelectedCategory(null);
      }


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


  const handleAddMenuItem = async (formData: MenuItemFormValues) => {
    if (!selectedCategory) {
        toast({ title: "Error", description: "No category selected to add the item to.", variant: "destructive" });
        return;
    }
    // The backend API for POST menu-items.php generates the ID if not provided.
    // So, we don't send an 'id' field from the client for new items.
    const payload = { 
        name: formData.name,
        price: formData.price,
        description: formData.description,
        categoryId: selectedCategory.id,
        status: formData.visibleToUsers ? 'Active' : 'Inactive',
        visibleToUsers: formData.visibleToUsers,
        subItems: formData.subItems ? formData.subItems.map(si => ({name: si.name, price: si.price})) : [], // Send subItems without client-generated IDs
    };
        
    try {
      const response = await fetch(getMenuItemsApiUrl(menuType), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || (result && result.success === false) || (result && result.item === undefined && result.success !== true)) {
        throw new Error(result.message || `Failed to add menu item. Status: ${response.status}`);
      }
      toast({ title: "Success", description: result.message || `Item "${formData.name}" added to ${selectedCategory?.name || 'category'}.` });
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

  const handleEditMenuItem = async (formData: MenuItemFormValues) => {
    if (!editingItemData) {
      toast({ title: "Error", description: "No item selected for editing.", variant: "destructive" });
      return;
    }
    const payload = { 
        id: editingItemData.id, 
        name: formData.name,
        price: formData.price,
        description: formData.description,
        categoryId: editingItemData.categoryId, // Category doesn't change on edit
        status: formData.visibleToUsers ? 'Active' : 'Inactive',
        visibleToUsers: formData.visibleToUsers,
        subItems: formData.subItems ? formData.subItems.map(si => ({id: si.id, name: si.name, price: si.price})) : [], // Send subItems with their IDs if they exist
    };
    try {
      const response = await fetch(getMenuItemsApiUrl(menuType), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload), 
      });
      const result = await response.json();
      if (!response.ok || (result && result.success === false) || (result && result.item === undefined && result.success !== true) ) {
        throw new Error(result.message || `Failed to update item. Status: ${response.status}`);
      }
      toast({ title: "Success", description: result.message || `Item "${formData.name}" updated.` });
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
      if (!response.ok || (result && result.success === false && response.status !== 404) ) {
         if (response.status === 404 && result.message && result.message.toLowerCase().includes('not found')) {
            // Treat as success if backend confirms not found
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
                    if (selectedCategory && orderedCategories.length > 0) {
                        setEditingItemData(null); 
                        setIsAddItemDialogOpen(true);
                    } else {
                        toast({title: "Cannot Add Item", description: "Please select a category first.", variant: "default"});
                    }
                }}
                disabled={!selectedCategory || orderedCategories.length === 0}
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
                    <Skeleton className="h-10 w-10 rounded-md" />
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
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
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

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Add New {selectedCategory?.name ? `${selectedCategory.name} Item` : `${menuType.charAt(0).toUpperCase() + menuType.slice(1)} Item`}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm 
            onSubmit={handleAddMenuItem} 
            onOpenChange={setIsAddItemDialogOpen}
            isEditMode={false}
          />
        </DialogContent>
      </Dialog>

      {editingItemData && (
         <Dialog open={isEditItemDialogOpen} onOpenChange={(open) => {
            setIsEditItemDialogOpen(open);
            if (!open) setEditingItemData(null);
          }}>
          <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Edit {editingItemData?.name || 'Menu Item'}
              </DialogTitle>
            </DialogHeader>
            <MenuItemForm 
              initialData={editingItemData}
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
    
