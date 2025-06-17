
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Button,
  buttonVariants
} from "@/components/ui/button";
import {
  Input
} from "@/components/ui/input";
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
  GripVertical
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

type MenuType = "restaurant" | "parlour";

interface CategoryAdmin {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
}

interface MenuItemAdmin {
  id: string;
  name: string;
  price: number;
  status: 'Active' | 'Inactive'; // Based on visibleToUsers
  addedDate: string; // ISO string for createdAt
  categoryId: string;
  image?: string | null;
}

const ITEMS_PER_PAGE_ITEMS = 15;

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
  const [loadingItems, setLoadingItems] = useState(false); // Only true when explicitly fetching items
  const [errorItems, setErrorItems] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchCategoriesAndItems = useCallback(async (currentMenuType: MenuType, retainSelectedCategory: boolean = false) => {
    setLoadingCategories(true);
    setErrorCategories(null);
    setLoadingItems(true);
    setErrorItems(null);

    const prevSelectedCategoryId = retainSelectedCategory ? selectedCategory?.id : null;

    const categoriesApiUrl = currentMenuType === 'parlour'
      ? 'https://colorhutbd.xyz/vm/api/parlour-categories.php'
      : 'https://colorhutbd.xyz/vm/api/categories.php';
    const menuItemsApiUrl = currentMenuType === 'parlour'
      ? 'https://colorhutbd.xyz/vm/api/parlour-items.php'
      : 'https://colorhutbd.xyz/vm/api/menu-items.php';

    try {
      const [categoriesResponse, menuItemsResponse] = await Promise.all([
        fetch(categoriesApiUrl, { headers: { 'Accept': 'application/json' } }),
        fetch(menuItemsApiUrl, { headers: { 'Accept': 'application/json' } })
      ]);

      // Process Categories
      if (!categoriesResponse.ok) throw new Error(`Categories API error! status: ${categoriesResponse.status}`);
      const categoriesResult = await categoriesResponse.json();
      if (!categoriesResult.success || !categoriesResult.data || !Array.isArray(categoriesResult.data.categories)) {
        throw new Error('Invalid data format for categories.');
      }
      const fetchedCategories: CategoryAdmin[] = categoriesResult.data.categories.map((cat: any): CategoryAdmin => ({
        id: String(cat.id),
        name: String(cat.name || 'Unnamed Category'),
        icon: String(cat.icon || '📁'),
        itemCount: parseInt(cat.itemCount) || 0,
      }));
      setAllCategories(fetchedCategories);
      setOrderedCategories(fetchedCategories);

      if (fetchedCategories.length > 0) {
        let categoryToSelect = fetchedCategories[0];
        if (prevSelectedCategoryId) {
            const foundCat = fetchedCategories.find(c => c.id === prevSelectedCategoryId);
            if (foundCat) categoryToSelect = foundCat;
        }
        setSelectedCategory(categoryToSelect);
      } else {
        setSelectedCategory(null);
      }

      // Process Menu Items
      if (!menuItemsResponse.ok) throw new Error(`Menu Items API error! status: ${menuItemsResponse.status}`);
      const menuItemsResult = await menuItemsResponse.json();

      let rawItemsArray: any[] = [];
      if (menuItemsResult.success) {
        if (Array.isArray(menuItemsResult.data)) {
          rawItemsArray = menuItemsResult.data;
        } else if (menuItemsResult.data && Array.isArray(menuItemsResult.data.items)) { // Alternative structure
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
      setCurrentPage(1);
    }
  }, [selectedCategory?.id]);

  useEffect(() => {
    fetchCategoriesAndItems(menuType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuType]); // Removed fetchCategoriesAndItems from deps to avoid loop with retainSelectedCategory

  useEffect(() => {
    let items = selectedCategory
      ? allMenuItems.filter(item => item.categoryId === selectedCategory.id)
      : allMenuItems; // Show all items if "All Items" (null category) is selected

    if (searchTerm) {
      items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      items = items.filter(item => item.status.toLowerCase() === statusFilter);
    }
    setFilteredMenuItems(items);
    setCurrentPage(1);
  }, [allMenuItems, selectedCategory, searchTerm, statusFilter]);

  const totalAllItemsCount = useMemo(() => {
    return allCategories.reduce((sum, cat) => sum + cat.itemCount, 0);
  }, [allCategories]);

  const paginatedMenuItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_ITEMS;
    return filteredMenuItems.slice(startIndex, startIndex + ITEMS_PER_PAGE_ITEMS);
  }, [filteredMenuItems, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredMenuItems.length / ITEMS_PER_PAGE_ITEMS);
  }, [filteredMenuItems.length]);

  const handlePreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

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
    fetchCategoriesAndItems(menuType, true); // Retain selected category
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16)-1px)] bg-muted/30">
      {/* Categories Sidebar */}
      <aside className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start items-center text-md h-10 mb-2 font-semibold",
              !selectedCategory ? 'bg-muted text-foreground' : 'text-foreground'
            )}
            onClick={() => setSelectedCategory(null)} // Select "All Items"
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
            <p className="p-4 text-sm text-muted-foreground">No categories found for {menuType}.</p>
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

      {/* Menu Items Content Area */}
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
            <Button size="sm" className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 bg-background">
          <div className="p-6 space-y-3">
            {loadingItems && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center p-3 gap-4 bg-card border border-border rounded-lg shadow-sm">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))
            )}
            {!loadingItems && errorItems && (
              <div className="text-center py-10 text-destructive bg-card border border-destructive/20 rounded-lg">
                <AlertTriangle className="mx-auto h-10 w-10 mb-3" />
                <p className="text-md">Error loading items: {errorItems}</p>
              </div>
            )}
            {!loadingItems && !errorItems && paginatedMenuItems.length === 0 && (
              <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-lg">
                 <PackageSearch className="mx-auto h-12 w-12 mb-4 opacity-70" />
                <p className="text-md">
                  {searchTerm || statusFilter !== 'all' || selectedCategory
                    ? "No items match your criteria."
                    : "No menu items available for this category."}
                </p>
                {!selectedCategory && <p className="text-sm mt-1">Select a category or check the menu type.</p>}
              </div>
            )}
            {!loadingItems && !errorItems && paginatedMenuItems.map(item => (
              <div key={item.id} className="flex items-center p-3 gap-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {/* Placeholder for image - could use item.image if available or first letter */}
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-full" /> : <Utensils className="h-5 w-5"/>}
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
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-auto px-2 text-muted-foreground hover:text-foreground">
                    <Edit3 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-auto px-2 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Toggle Status</DropdownMenuItem>
                      <DropdownMenuItem>Feature Item</DropdownMenuItem>
                      <DropdownMenuSeparator/>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">Duplicate Item</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {totalPages > 0 && (
          <div className="flex justify-between items-center py-3 px-6 border-t border-border bg-card text-sm text-muted-foreground">
            <p>Showing {paginatedMenuItems.length} of {filteredMenuItems.length} items.</p>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || loadingItems} className="h-8">Previous</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled>{currentPage}</Button>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || loadingItems} className="h-8">Next</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

