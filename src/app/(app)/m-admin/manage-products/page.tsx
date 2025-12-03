
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  Package, 
  Search, 
  RefreshCw, 
  ListFilter, 
  PlusCircle, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  ImageIcon,
  X,
  Plus,
  Video,
  BookOpen,
  FileText,
  FileImage,
  CreditCard,
  Contact,
  Presentation,
  Book,
  BookCopy,
  UploadCloud,
  MonitorSmartphone,
  Gift,
  Building,
  Thermometer,
  Trees,
  Users,
  Sun,
  Palette,
  LayoutTemplate,
  KanbanSquare,
  ChevronsUpDown,
  Check,
  Tag,
} from "lucide-react";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Product,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from '@/lib/product-api';

const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/100x100.png";
const ITEMS_PER_PAGE = 10;

const isImageUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(parsedUrl.pathname);
    } catch {
        return false;
    }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Zod Schema for the form
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  isPublished: z.boolean().default(true),
  imageFiles: z.custom<FileList>().optional(),
  existingImageUrls: z.array(z.string().url()).optional(),
  videoUrl: z.string().url("Video URL must be a valid URL.").optional().or(z.literal('')),
}).refine(data => {
  const hasExistingImages = data.existingImageUrls && data.existingImageUrls.length > 0;
  const hasNewImageFiles = data.imageFiles && data.imageFiles.length > 0;
  return hasExistingImages || hasNewImageFiles;
}, {
  message: "At least one image is required.",
  path: ["imageFiles"], // Assign the error to the imageFiles field
});


type ProductFormValues = z.infer<typeof productFormSchema>;

const productCategories = [
  { value: 'Menu Cover', label: 'Menu Cover', icon: Book },
  { value: 'Restaurant Menu', label: 'Restaurant Menu', icon: BookOpen },
  { value: 'Parlour / Salon Menu', label: 'Parlour / Salon Menu', icon: FileText },
  { value: 'Business Card', label: 'Business Card', icon: Contact },
  { value: 'Restaurant Token / Coupon', label: 'Restaurant Token / Coupon', icon: Gift },
  { value: 'Membership Card', label: 'Membership Card', icon: CreditCard },
  { value: 'Leaflet / Brochure', label: 'Leaflet / Brochure', icon: BookCopy },
  { value: 'Banner', label: 'Banner', icon: Presentation },
  { value: 'Bill Folder', label: 'Bill Folder', icon: FileText },
  { value: 'Reservation Card', label: 'Reservation Card', icon: FileImage },
  { value: 'Packaging Box', label: 'Packaging Box', icon: Package },
  { value: 'Branded Carry Bag', label: 'Branded Carry Bag', icon: Package },
  { value: 'Air Conditioner (AC)', label: 'Air Conditioner (AC)', icon: Thermometer },
  { value: 'Furniture', label: 'Furniture', icon: Building },
  { value: 'Nursery / Indoor Plants', label: 'Nursery / Indoor Plants', icon: Trees },
  { value: 'Social Media Management', label: 'Social Media Management', icon: Users },
  { value: 'IPS / Solar Unit', label: 'IPS / Solar Unit', icon: Sun },
  { value: 'Sign Board', label: 'Sign Board', icon: Package },
  { value: '3D Wall Sticker / Wall Art', label: '3D Wall Sticker / Wall Art', icon: Palette },
  { value: 'Interior Design', label: 'Interior Design', icon: LayoutTemplate },
  { value: 'ERP System', label: 'ERP System', icon: KanbanSquare },
  { value: 'Team Tracker & Routine', label: 'Team Tracker & Routine', icon: KanbanSquare },
  { value: 'Digital Menu', label: 'Digital Menu', icon: MonitorSmartphone },
  { value: 'Nameplate', label: 'Nameplate', icon: Tag },
];


// Reusable Stat Card Component
function StatCard({ title, value, icon: Icon, description, className }: { title: string; value: string | number; icon: React.ElementType; description: string; className?: string; }) {
  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Product Form Component
function ProductForm({ initialData, onSubmit, onOpenChange, isEditMode, isSubmitting }: { initialData?: Product, onSubmit: (data: ProductFormValues) => void, onOpenChange: (open: boolean) => void, isEditMode: boolean, isSubmitting: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const { toast } = useToast();
  const [comboboxOpen, setComboboxOpen] = useState(false)
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        existingImageUrls: initialData.imageUrls || [],
        videoUrl: initialData.videoUrl || '',
        imageFiles: undefined,
    } : {
      name: "",
      description: "",
      category: "",
      isPublished: true,
      existingImageUrls: [],
      videoUrl: '',
      imageFiles: undefined,
    },
    mode: 'onChange', // Important for `isValid` to update on change
  });
  
  const existingImageUrls = form.watch('existingImageUrls') || [];

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({ title: "Invalid File Type", description: `${file.name} is not a supported image type.`, variant: "destructive" });
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File Too Large", description: `${file.name} exceeds the 5MB size limit.`, variant: "destructive" });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      validFiles.forEach(file => dataTransfer.items.add(file));
      form.setValue("imageFiles", dataTransfer.files, { shouldValidate: true });

      const previews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeExistingImage = (index: number) => {
    const updatedUrls = [...existingImageUrls];
    updatedUrls.splice(index, 1);
    form.setValue('existingImageUrls', updatedUrls, { shouldValidate: true });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    handleFileChange(event.dataTransfer.files);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow overflow-hidden">
      <ScrollArea className="flex-grow p-6">
        <div className="space-y-4">
            <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...form.register("name")} className="mt-1" />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} rows={4} className="mt-1" />
            </div>

            <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
                <Label>Category</Label>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className="w-full justify-between mt-1"
                        >
                          {field.value
                            ? productCategories.find((cat) => cat.value === field.value)?.label
                            : "Select a category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search category..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {productCategories.map((cat) => (
                                <CommandItem
                                  key={cat.value}
                                  value={cat.value}
                                  onSelect={(currentValue) => {
                                    field.onChange(currentValue === field.value ? "" : currentValue);
                                    setComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === cat.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                   <div className="flex items-center gap-2">
                                      <cat.icon className="h-4 w-4 text-muted-foreground" />
                                      <span>{cat.label}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>
                )}
            </div>

            <Separator />
            
            <div className="space-y-4">
               <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
                <Label>Product Images*</Label>
                <div 
                  className={cn("mt-1 flex justify-center rounded-lg border border-dashed border-border/80 px-6 py-10 transition-colors", isDraggingOver && "border-primary bg-primary/10")}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80">
                        <span>Upload files</span>
                        <input id="file-upload" ref={fileInputRef} name="imageFiles" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e.target.files)} accept={ALLOWED_IMAGE_TYPES.join(",")} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
                {form.formState.errors.imageFiles && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageFiles.message as string}</p>}

                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {existingImageUrls.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group">
                       <Image src={url} alt="Existing product image" width={100} height={100} className="w-full aspect-square object-cover rounded-md border" />
                       <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100" onClick={() => removeExistingImage(index)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  ))}
                   {imagePreviews.map((preview, index) => (
                    <div key={`preview-${index}`} className="relative group">
                       <Image src={preview} alt="New image preview" width={100} height={100} className="w-full aspect-square object-cover rounded-md border-2 border-primary" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
                  <Label>Video URL</Label>
                  <div className="flex gap-2">
                      <Input {...form.register("videoUrl")} placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  {form.formState.errors.videoUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.videoUrl.message}</p>}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
              <Label>Publishing</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Controller
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => ( <Switch id="isPublished" checked={field.value} onCheckedChange={field.onChange} /> )}
                />
                <Label htmlFor="isPublished">Publish Product</Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">When published, the product will be visible to all customers.</p>
            </div>
        </div>
      </ScrollArea>
      <DialogFooter className="px-6 py-4 border-t mt-auto">
        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
        <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
          <Save className="mr-2 h-4 w-4" />{isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? "Save Changes" : "Add Product")}
        </Button>
      </DialogFooter>
    </form>
  )
}


export default function ManageProductsPage(): ReactNode {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products.');
      toast({ title: "Error", description: err.message || 'Failed to fetch products.', variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchProducts();
    }
  }, [isAdminLoggedIn, fetchProducts]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleAddProduct = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const newProduct = await createProduct(data);
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "Success", description: "Product added successfully." });
      setIsFormOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || 'Failed to add product.', variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditProduct = async (data: ProductFormValues) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const updatedProduct = await updateProduct(editingProduct.id, data);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast({ title: "Success", description: "Product updated successfully." });
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || 'Failed to update product.', variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      toast({ title: "Success", description: "Product deleted." });
    } catch (err: any) {
       toast({ title: "Error", description: err.message || 'Failed to delete product.', variant: "destructive" });
    } finally {
      setIsAlertOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (statusFilter !== 'all' && (statusFilter === 'published') !== p.isPublished) return false;
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, statusFilter, categoryFilter, searchTerm]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  }, [filteredProducts.length]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };
  
  const stats = useMemo(() => ({
    totalProducts: products.length,
    published: products.filter(p=>p.isPublished).length
  }), [products]);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy") : 'N/A';
    } catch (error) {
      return 'N/A';
    }
  };

  if (adminLoading) { return <div className="flex h-screen w-full items-center justify-center"><p>Loading Admin Area...</p></div>; }
  if (!isAdminLoggedIn) { return <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8"><AdminLoginForm /></div>; }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Package className="h-8 w-8 mr-3 text-primary" />
          Product Management
        </h1>
        <p className="text-muted-foreground mt-1">Add, edit, and manage all your products.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatCard title="Total Products" value={isLoading ? <Skeleton className="h-6 w-16" /> : stats.totalProducts} description="Number of unique products" icon={Package} className="shadow-lg" />
        <StatCard title="Published" value={isLoading ? <Skeleton className="h-6 w-16" /> : stats.published} description="Products visible to customers" icon={CheckCircle} className="shadow-lg" />
      </section>

      <Card className="flex-grow flex flex-col shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage your product inventory.</CardDescription>
            </div>
            <Button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Add Product</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by product name..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="Filter by category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {productCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchProducts} disabled={isLoading}><RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} /></Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-grow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedProducts.length > 0 ? (
                  paginatedProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image 
                          src={product.imageUrls[0] || DEFAULT_PRODUCT_IMAGE} 
                          alt={product.name} 
                          width={40} 
                          height={40} 
                          className="rounded-md object-cover border" 
                          data-ai-hint="product image" 
                        />
                      </TableCell>
                      <TableCell className="font-medium">{decodeHtmlEntities(product.name)}</TableCell>
                      <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(product.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={product.isPublished ? "default" : "secondary"} className={cn(product.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                          {product.isPublished ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                          {product.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        {error ? <span className="text-destructive">{error}</span> : "No products found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
           <div className="flex justify-between items-center mt-auto p-4 border-t border-border text-sm text-muted-foreground">
              <p>Showing {paginatedProducts.length} of {filteredProducts.length} products.</p>
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
            </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl p-0 h-[90vh]">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            isEditMode={!!editingProduct}
            initialData={editingProduct || undefined}
            onOpenChange={setIsFormOpen}
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
