
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
} from "lucide-react";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Product,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/product-api';

const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/100x100.png";

const isImageUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        // Basic check for common image extensions
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(parsedUrl.pathname);
    } catch {
        return false;
    }
};

// Zod Schema for the form
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters."),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  isPublished: z.boolean().default(true),
  imageUrls: z.array(
    z.string().url("Each image URL must be a valid URL.")
     .refine(isImageUrl, { message: "URL must be a direct link to an image (e.g., .png, .jpg)." })
  ).min(1, "At least one image URL is required."),
  videoUrls: z.array(z.string().url("Each video URL must be a valid URL.")),
});
type ProductFormValues = z.infer<typeof productFormSchema>;

const productCategories = [
  { value: 'Menu Book', label: 'Menu Book', icon: BookOpen },
  { value: 'Menu Card', label: 'Menu Card', icon: FileText },
  { value: 'Leaflet', label: 'Leaflet', icon: FileImage },
  { value: 'Brochure', label: 'Brochure', icon: BookCopy },
  { value: 'Membership Card', label: 'Membership Card', icon: CreditCard },
  { value: 'Business Card', label: 'Business Card', icon: Contact },
  { value: 'X Banner', label: 'X Banner', icon: Presentation },
  { value: 'Menu Book Cover', label: 'Menu Book Cover', icon: Book },
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
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        imageUrls: initialData.imageUrls || [],
        videoUrls: initialData.videoUrls || [],
    } : {
      name: "",
      description: "",
      category: "",
      isPublished: true,
      imageUrls: [],
      videoUrls: [],
    },
  });

  const { fields: imageUrlsFields, append: appendImageUrl, remove: removeImageUrl } = useFieldArray({
    control: form.control,
    name: "imageUrls",
  });
  
  const { fields: videoUrlsFields, append: appendVideoUrl, remove: removeVideoUrl } = useFieldArray({
    control: form.control,
    name: "videoUrls",
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const handleAddImageUrl = () => {
    const urlCheck = z.string().url().safeParse(newImageUrl);
    if (urlCheck.success) {
      if(isImageUrl(newImageUrl)) {
        appendImageUrl(newImageUrl);
        setNewImageUrl("");
        form.clearErrors("imageUrls");
      } else {
        form.setError("imageUrls", { type: "manual", message: "URL must be a direct link to an image." });
      }
    } else {
       form.setError("imageUrls", { type: "manual", message: "Please enter a valid URL." });
    }
  };

  const handleAddVideoUrl = () => {
    const urlCheck = z.string().url().safeParse(newVideoUrl);
    if (urlCheck.success) {
      appendVideoUrl(newVideoUrl);
      setNewVideoUrl("");
      form.clearErrors("videoUrls");
    } else {
      form.setError("videoUrls", { type: "manual", message: "Please enter a valid URL." });
    }
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
              <Label htmlFor="category">Category</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {productCategories.map(cat => (
                         <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4 text-muted-foreground" />
                                <span>{cat.label}</span>
                            </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
            </div>

            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
                  <Label>Image URLs</Label>
                  <div className="flex gap-2">
                      <Input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://example.com/image.png" />
                      <Button type="button" variant="outline" size="icon" onClick={handleAddImageUrl}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <ScrollArea className="h-32 w-full rounded-md border bg-background p-2 space-y-2">
                      {imageUrlsFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md shadow-sm">
                              <Image src={field.value || DEFAULT_PRODUCT_IMAGE} alt="preview" width={32} height={32} className="w-8 h-8 object-cover rounded-sm border" data-ai-hint="product image" />
                              <span className="text-xs truncate flex-1">{field.value}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeImageUrl(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                      ))}
                        {imageUrlsFields.length === 0 && <p className="text-xs text-muted-foreground text-center pt-8">No image URLs added.</p>}
                  </ScrollArea>
                    {form.formState.errors.imageUrls?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageUrls.message}</p>}
                    {form.formState.errors.imageUrls?.root?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageUrls.root.message}</p>}
              </div>
              <div className="space-y-2 p-3 rounded-md bg-muted/30 border border-border/60">
                  <Label>Video URLs</Label>
                  <div className="flex gap-2">
                      <Input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                      <Button type="button" variant="outline" size="icon" onClick={handleAddVideoUrl}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <ScrollArea className="h-32 w-full rounded-md border bg-background p-2 space-y-2">
                      {videoUrlsFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md shadow-sm">
                              <div className="w-8 h-8 flex items-center justify-center bg-card rounded-sm border"><Video className="h-5 w-5 text-muted-foreground" /></div>
                              <span className="text-xs truncate flex-1">{field.value}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeVideoUrl(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                      ))}
                        {videoUrlsFields.length === 0 && <p className="text-xs text-muted-foreground text-center pt-8">No video URLs added.</p>}
                  </ScrollArea>
                  {form.formState.errors.videoUrls && <p className="text-sm text-destructive mt-1">{form.formState.errors.videoUrls.message}</p>}
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
        <Button type="submit" disabled={isSubmitting}>
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

  const handleAddProduct = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await createProduct({ ...data, id: '' });
      toast({ title: "Success", description: "Product added successfully." });
      setIsFormOpen(false);
      fetchProducts();
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
      await updateProduct(editingProduct.id, data);
      toast({ title: "Success", description: "Product updated successfully." });
      setIsFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
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
      toast({ title: "Success", description: "Product deleted." });
      fetchProducts();
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
        if (statusFilter === 'published' && !p.isPublished) return false;
        if (statusFilter === 'draft' && p.isPublished) return false;
        return true;
      })
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, statusFilter, searchTerm]);
  
  const stats = useMemo(() => ({
    totalProducts: products.length,
    published: products.filter(p=>p.isPublished).length
  }), [products]);

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
          <div className="flex items-center gap-2 pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by product name..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchProducts} disabled={isLoading}><RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} /></Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
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
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
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
                    <TableCell colSpan={5} className="h-24 text-center">
                        {error ? <span className="text-destructive">{error}</span> : "No products found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
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
