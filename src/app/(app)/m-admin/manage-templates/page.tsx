
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission } from '@/lib/admin-permissions';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Layers, 
  Search, 
  Star, 
  Globe2, 
  FileEdit, 
  Trash2, 
  RefreshCw, 
  PlusCircle, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ImageIcon,
  X,
  Plus,
  Save,
  Tag,
} from "lucide-react";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  getTemplatesFromMySql, 
  upsertTemplateToMySql, 
  deleteTemplateFromMySql 
} from "@/app/actions/orders";
import { uploadFileLocally } from "@/app/actions/uploads";

const DEFAULT_TEMPLATE_IMAGE_URL = '/placeholder.svg';

interface ApiAdminTemplate {
  id: string;
  name: string;
  description: string;
  isTopRated?: boolean;
  isPublished: boolean;
  tags: string[];
  imageUrl: string;
  createdAt?: string;
  version?: string;
  category?: string;
}

interface AdminTemplateCardProps {
  template: ApiAdminTemplate;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onTogglePublish: (id: string) => void;
  onSetTopRated: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const AdminTemplateCard = memo(function AdminTemplateCard({
  template,
  onEdit,
  onDelete,
  onTogglePublish,
  onSetTopRated,
  canEdit,
  canDelete,
}: AdminTemplateCardProps): ReactNode {
  const [imgSrc, setImgSrc] = useState(template.imageUrl || DEFAULT_TEMPLATE_IMAGE_URL);

  useEffect(() => {
    setImgSrc(template.imageUrl || DEFAULT_TEMPLATE_IMAGE_URL);
  }, [template.imageUrl]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return dateString; 
      return format(date, "dd/MM/yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const getImageHint = (name: string): string => {
    return name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'template design';
  }

  const isUsingPlaceholder = imgSrc === DEFAULT_TEMPLATE_IMAGE_URL;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full bg-card">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative group overflow-hidden">
          {!isUsingPlaceholder && (
            <Image
              src={imgSrc}
              alt=""
              fill
              className="object-cover blur-xl opacity-95"
              priority={false}
              aria-hidden="true"
              onError={() => setImgSrc(DEFAULT_TEMPLATE_IMAGE_URL)}
            />
          )}
          <Image
            src={imgSrc} 
            alt={template.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "relative z-10 transition-all duration-300",
              isUsingPlaceholder ? "object-cover" : "object-contain drop-shadow-xl"
            )}
            data-ai-hint={isUsingPlaceholder ? "placeholder abstract" : getImageHint(template.name)}
            onError={() => setImgSrc(DEFAULT_TEMPLATE_IMAGE_URL)}
          />
          <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none z-20" />
          {template.isTopRated && (
            <Badge variant="default" className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 border-yellow-500 font-semibold py-1 px-2 shadow-md z-30">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Top Rated
            </Badge>
          )}
          <Badge
            variant={template.isPublished ? "default" : "secondary"}
            className={cn(
              "absolute bottom-2 left-2 font-medium py-1 px-2.5 shadow-md text-xs z-30",
              template.isPublished ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-500 hover:bg-gray-600 text-white"
            )}
          >
            {template.isPublished ? (
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
            )}
            {template.isPublished ? "Published" : "Unpublished"}
          </Badge>

          <div className="absolute top-2 right-2 flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
            {canEdit && (
              <>
                <Button variant="outline" size="icon" className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 border-white/30" onClick={() => onSetTopRated(template.id)} aria-label="Toggle Top Rated">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 border-white/30" onClick={() => onTogglePublish(template.id)} aria-label="Toggle Publish Status">
                  <Globe2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 border-white/30" onClick={() => onEdit(template.id)} aria-label="Edit Template">
                  <FileEdit className="h-4 w-4" />
                </Button>
              </>
            )}
            {canDelete && (
              <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-600/70 text-white hover:bg-red-700/90 border-red-500/50" onClick={() => onDelete(template.id, template.name)} aria-label="Delete Template">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
           <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md z-30"
            aria-label="View template details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-semibold mb-1 text-foreground truncate" title={template.name}>{template.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed min-h-[40px] line-clamp-2" title={template.description}>{template.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-xs bg-muted text-muted-foreground">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="font-normal text-xs bg-muted text-muted-foreground">
              +{template.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between items-center">
        <span>
          Created: {formatDate(template.createdAt)}
        </span>
        <span>
          {template.version ? `v${template.version}` : 'v1.0'}
        </span>
      </CardFooter>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.template.id === nextProps.template.id &&
    prevProps.template.name === nextProps.template.name &&
    prevProps.template.isPublished === nextProps.template.isPublished &&
    prevProps.template.isTopRated === nextProps.template.isTopRated &&
    prevProps.template.imageUrl === nextProps.template.imageUrl &&
    prevProps.canEdit === nextProps.canEdit &&
    prevProps.canDelete === nextProps.canDelete
  );
});

function AdminTemplateSkeletonCard(): ReactNode {
  return (
    <Card className="overflow-hidden shadow-md rounded-lg flex flex-col h-full bg-card">
      <CardHeader className="p-0 relative">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/30 flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </CardFooter>
    </Card>
  );
}

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

const addTemplateFormSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  description: z.string().min(1, "Description is required"),
  imageFile: z.custom<FileList>((val) => val instanceof FileList, "Please upload an image")
    .refine((files) => files.length > 0, `Template image is required.`)
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, `Max image size is 5MB.`)
    .refine(
      (files) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ),
  tag: z.string({ required_error: "Please select a tag." }).min(1, "A tag is required."),
  isTopRated: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

type AddTemplateFormValues = z.infer<typeof addTemplateFormSchema>;

interface AddTemplateFormProps {
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

function AddTemplateForm({ onSuccess, onOpenChange }: AddTemplateFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AddTemplateFormValues>({
    resolver: zodResolver(addTemplateFormSchema),
    defaultValues: {
      templateName: "",
      description: "",
      isTopRated: false,
      isPublished: false,
    },
    mode: 'onChange',
  });

  const { control } = form;

  const processAndSetImage = useCallback((file: File | null) => {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Only JPG, PNG, WEBP, and GIF formats are supported.", variant: "destructive" });
        form.setValue("imageFile", new DataTransfer().files, { shouldValidate: true }); 
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }
      if (file.size > maxSize) {
        toast({ title: "File Too Large", description: "Maximum image size is 5MB.", variant: "destructive" });
        form.setValue("imageFile", new DataTransfer().files, { shouldValidate: true }); 
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      form.setValue("imageFile", dataTransfer.files, { shouldValidate: true });
    } else {
      setImagePreview(null);
      form.setValue("imageFile", new DataTransfer().files, { shouldValidate: true });
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  }, [form, toast]);


  const handleImageInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processAndSetImage(file || null);
  }, [processAndSetImage]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processAndSetImage(files[0]);
    }
  }, [processAndSetImage]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          processAndSetImage(file);
          event.preventDefault(); 
          break;
        }
      }
    }
  }, [processAndSetImage]);

  async function onSubmit(data: AddTemplateFormValues) {
    form.clearErrors(); 
    let uploadedImageUrl = "";

    if (data.imageFile && data.imageFile.length > 0) {
      const imageFileToUpload = data.imageFile[0];
      const imageFormData = new FormData();
      imageFormData.append("file", imageFileToUpload);

      try {
        const uploadResult = await uploadFileLocally(imageFormData, 'templates');
        if (!uploadResult.success || !uploadResult.data?.url) {
          throw new Error(uploadResult.message || "Image upload failed");
        }
        uploadedImageUrl = uploadResult.data.url;
      } catch (error: any) {
        toast({ title: "Image Upload Error", description: error.message, variant: "destructive" });
        form.setError("imageFile", { type: "manual", message: error.message || "Failed to upload image."});
        return; 
      }
    } else {
        toast({ title: "Image Required", description: "Please select an image for the template.", variant: "destructive" });
        form.setError("imageFile", { type: "manual", message: "Template image is required."});
        return;
    }

    const templateId = slugify(data.templateName) + '-' + Date.now().toString(36);
    const templatePayload = {
      id: templateId,
      name: data.templateName,
      description: data.description,
      isTopRated: data.isTopRated,
      isPublished: data.isPublished,
      tags: [data.tag],
      imageUrl: uploadedImageUrl,
    };

    try {
      const result = await upsertTemplateToMySql(templatePayload);

      if (!result.success) {
        throw new Error(result.message || `Failed to add template to local database.`);
      }
      toast({ title: "Template Added", description: `Template "${data.templateName}" created successfully in local DB.` });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Template Add Error", description: error.message, variant: "destructive" });
    }
  }


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 w-full">
        <div className="space-y-4 p-6">
          <div>
            <Label htmlFor="templateName-add">Template Name*</Label>
            <Input id="templateName-add" {...form.register("templateName")} placeholder="Enter template name" />
            {form.formState.errors.templateName && <p className="text-sm text-destructive mt-1">{form.formState.errors.templateName.message}</p>}
          </div>

          <div>
            <Label htmlFor="description-add">Description*</Label>
            <Textarea id="description-add" {...form.register("description")} placeholder="Enter template description" rows={4} />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="imageFile-upload-input-add">Template Image</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onPaste={handlePaste}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { fileInputRef.current?.click(); e.preventDefault(); }}}
              tabIndex={0} 
              className={cn(
                "mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/80 transition-colors",
                isDraggingOver ? "border-primary bg-primary/10" : "border-border",
                form.formState.errors.imageFile ? "border-destructive" : ""
              )}
              role="button"
              aria-label="Upload template image"
            >
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Image preview" width={200} height={150} className="mx-auto h-40 w-auto object-contain rounded-md" data-ai-hint="template visual"/>
                ) : (
                  <ImageIcon className="mx-auto h-24 w-24 text-muted-foreground/80" />
                )}
              </div>
            </div>
            <input 
              id="imageFile-upload-input-add"
              ref={fileInputRef} 
              type="file" 
              className="sr-only" 
              onChange={handleImageInputChange} 
              accept="image/png, image/jpeg, image/webp, image/gif" 
            />
            {form.formState.errors.imageFile && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageFile.message as string}</p>}
          </div>
          
          <div>
            <Label htmlFor="tags-add">Tag*</Label>
            <Controller
              control={control}
              name="tag"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="parlour">Parlour</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.tag && <p className="text-sm text-destructive mt-1">{form.formState.errors.tag.message}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Controller
              control={form.control}
              name="isTopRated"
              render={({ field }) => (
                 <Switch id="isTopRated-add" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="isTopRated-add" className="cursor-pointer">Mark as Top Rated</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                 <Switch id="isPublished-add" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="isPublished-add" className="cursor-pointer">Publish to Users</Label>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="p-6 pt-4 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogClose>
        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {form.formState.isSubmitting ? "Adding..." : <><Save className="mr-2 h-4 w-4" /> Add Template</>}
        </Button>
      </DialogFooter>
    </form>
  );
}

const editTemplateFormSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  description: z.string().min(1, "Description is required"),
  imageFile: z.custom<FileList>((val) => val === null || val === undefined || val instanceof FileList, "Invalid image file")
    .optional()
    .refine((files) => !files || files.length === 0 || files?.[0]?.size <= 5 * 1024 * 1024, `Max image size is 5MB.`)
    .refine(
      (files) => !files || files.length === 0 || ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ),
  tag: z.string({ required_error: "Please select a tag." }).min(1, "A tag is required."),
  isTopRated: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

type EditTemplateFormValues = z.infer<typeof editTemplateFormSchema>;

interface EditTemplateFormProps {
  templateData: ApiAdminTemplate;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

function EditTemplateForm({ templateData, onSuccess, onOpenChange }: EditTemplateFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(templateData.imageUrl || null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<EditTemplateFormValues>({
    resolver: zodResolver(editTemplateFormSchema),
    defaultValues: {
      templateName: decodeHtmlEntities(templateData.name),
      description: decodeHtmlEntities(templateData.description),
      tag: templateData.tags?.[0] || "",
      isTopRated: templateData.isTopRated || false,
      isPublished: templateData.isPublished || false,
      imageFile: undefined, 
    },
    mode: 'onChange',
  });

  const { control } = form;

  const processAndSetImage = useCallback((file: File | null) => {
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Only JPG, PNG, WEBP, and GIF formats are supported.", variant: "destructive" });
        form.setValue("imageFile", undefined, { shouldValidate: true });
        setImagePreview(templateData.imageUrl || null); 
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > maxSize) {
        toast({ title: "File Too Large", description: "Maximum image size is 5MB.", variant: "destructive" });
        form.setValue("imageFile", undefined, { shouldValidate: true });
        setImagePreview(templateData.imageUrl || null); 
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      form.setValue("imageFile", dataTransfer.files, { shouldValidate: true });
    } else {
      setImagePreview(templateData.imageUrl || null);
      form.setValue("imageFile", undefined, { shouldValidate: true });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [form, toast, templateData.imageUrl]);

  const handleImageInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processAndSetImage(file || null);
  }, [processAndSetImage]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      processAndSetImage(files[0]);
    }
  }, [processAndSetImage]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          processAndSetImage(file);
          event.preventDefault(); 
          break;
        }
      }
    }
  }, [processAndSetImage]);

  async function onSubmit(data: EditTemplateFormValues) {
    form.clearErrors();
    let finalImageUrl = templateData.imageUrl;

    if (data.imageFile && data.imageFile.length > 0) {
      const imageFileToUpload = data.imageFile[0];
      const imageFormData = new FormData();
      imageFormData.append("file", imageFileToUpload);

      try {
        const uploadResult = await uploadFileLocally(imageFormData, 'templates');
        if (!uploadResult.success || !uploadResult.data?.url) {
          throw new Error(uploadResult.message || "New image upload failed");
        }
        finalImageUrl = uploadResult.data.url;
      } catch (error: any) {
        toast({ title: "Image Upload Error", description: error.message, variant: "destructive" });
        form.setError("imageFile", { type: "manual", message: error.message || "Failed to upload new image."});
        return;
      }
    }

    const templatePayload = {
      id: templateData.id, 
      name: data.templateName,
      description: data.description,
      isTopRated: data.isTopRated,
      isPublished: data.isPublished,
      tags: [data.tag],
      imageUrl: finalImageUrl,
    };

    try {
      const result = await upsertTemplateToMySql(templatePayload);

      if (!result.success) {
        throw new Error(result.message || "Failed to update local template.");
      }
      toast({ title: "Success", description: `Template "${data.templateName}" updated locally.` });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Update Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 w-full">
        <div className="space-y-4 p-6">
          <div>
            <Label htmlFor={`templateName-edit-${templateData.id}`}>Template Name*</Label>
            <Input id={`templateName-edit-${templateData.id}`} {...form.register("templateName")} placeholder="Enter template name" />
            {form.formState.errors.templateName && <p className="text-sm text-destructive mt-1">{form.formState.errors.templateName.message}</p>}
          </div>

          <div>
            <Label htmlFor={`description-edit-${templateData.id}`}>Description*</Label>
            <Textarea id={`description-edit-${templateData.id}`} {...form.register("description")} placeholder="Enter template description" rows={4} />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor={`imageFile-upload-input-edit-${templateData.id}`}>Template Image (Optional: Upload to change)</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onPaste={handlePaste}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { fileInputRef.current?.click(); e.preventDefault(); }}}
              tabIndex={0}
              className={cn(
                "mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/80 transition-colors",
                isDraggingOver ? "border-primary bg-primary/10" : "border-border",
                form.formState.errors.imageFile ? "border-destructive" : ""
              )}
              role="button"
              aria-label="Upload new template image"
            >
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Image preview" width={200} height={150} className="mx-auto h-40 w-auto object-contain rounded-md" data-ai-hint="template visual"/>
                ) : (
                  <ImageIcon className="mx-auto h-24 w-24 text-muted-foreground/80" />
                )}
              </div>
            </div>
             <input 
              id={`imageFile-upload-input-edit-${templateData.id}`}
              ref={fileInputRef} 
              type="file" 
              className="sr-only" 
              onChange={handleImageInputChange} 
              accept="image/png, image/jpeg, image/webp, image/gif" 
            />
            {form.formState.errors.imageFile && <p className="text-sm text-destructive mt-1">{form.formState.errors.imageFile.message as string}</p>}
          </div>
          
          <div>
            <Label htmlFor="tags-edit">Tag*</Label>
            <Controller
              control={control}
              name="tag"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="parlour">Parlour</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.tag && <p className="text-sm text-destructive mt-1">{form.formState.errors.tag.message}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Controller
              control={form.control}
              name="isTopRated"
              render={({ field }) => (
                 <Switch id={`isTopRated-edit-${templateData.id}`} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor={`isTopRated-edit-${templateData.id}`} className="cursor-pointer">Mark as Top Rated</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                 <Switch id={`isPublished-edit-${templateData.id}`} checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor={`isPublished-edit-${templateData.id}`} className="cursor-pointer">Publish to Users</Label>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="p-6 pt-4 border-t">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogClose>
        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {form.formState.isSubmitting ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
        </Button>
      </DialogFooter>
    </form>
  );
}


export default function ManageTemplatesPage(): ReactNode {
  const { isAdminLoggedIn, adminLoading, adminUser } = useAdminAuth();
  const canEdit = checkClientPermission(adminUser, 'manage-templates', 'edit');
  const canDelete = checkClientPermission(adminUser, 'manage-templates', 'delete');
  const canCreate = checkClientPermission(adminUser, 'manage-templates', 'create');
  const [allTemplates, setAllTemplates] = useState<ApiAdminTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unpublished' | 'restaurant' | 'parlour'>('all');
  const [isAddTemplateDialogOpen, setIsAddTemplateDialogOpen] = useState(false);
  const [isEditTemplateDialogOpen, setIsEditTemplateDialogOpen] = useState(false);
  const [editingTemplateData, setEditingTemplateData] = useState<ApiAdminTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDeleteInfo, setTemplateToDeleteInfo] = useState<{ id: string, name: string } | null>(null);
  const { toast } = useToast();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTemplatesFromMySql();
      if (!result.success) throw new Error(result.message || "Failed to fetch templates.");

      const fetchedTemplates: ApiAdminTemplate[] = (result.data as any[]).map((t: any) => {
        // Ensure createdAt is always a string to avoid React Error #31
        let createdAtStr = new Date().toISOString();
        if (t.created_at || t.createdAt) {
          const rawDate = t.created_at || t.createdAt;
          if (rawDate instanceof Date) {
            createdAtStr = rawDate.toISOString();
          } else if (typeof rawDate === 'string') {
            createdAtStr = rawDate;
          }
        }

        return {
          id: String(t.id),
          name: String(t.name),
          description: String(t.description),
          imageUrl: t.imageUrl || DEFAULT_TEMPLATE_IMAGE_URL,
          // Ensure tags are an array of strings, never objects
          tags: Array.isArray(t.tags) ? t.tags.map((tag: any) => String(tag)) : [],
          isPublished: Boolean(t.isPublished),
          isTopRated: Boolean(t.isTopRated),
          createdAt: createdAtStr
        };
      });
      setAllTemplates(fetchedTemplates);
    } catch (e: any) {
      console.error("Failed to fetch templates:", e);
      setError(e.message || "Failed to load templates.");
      setAllTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchTemplates();
    }
  }, [fetchTemplates, isAdminLoggedIn]);

  const handleRefresh = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleAddTemplateSuccess = useCallback(() => {
    setIsAddTemplateDialogOpen(false);
    fetchTemplates();
  }, [fetchTemplates]);

  const handleEditTemplateSuccess = useCallback(() => {
    setIsEditTemplateDialogOpen(false);
    setEditingTemplateData(null);
    fetchTemplates();
  }, [fetchTemplates]);

  const handleOpenEditTemplateDialog = useCallback((id: string) => {
    const templateToEdit = allTemplates.find(t => t.id === id);
    if (templateToEdit) {
      setEditingTemplateData(templateToEdit);
      setIsEditTemplateDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Could not find the template to edit.",
        variant: "destructive",
      });
    }
  }, [allTemplates, toast]);

  const handleDeleteTemplate = useCallback((id: string, name: string) => {
    setTemplateToDeleteInfo({ id, name });
    setIsDeleteDialogOpen(true);
  }, []);

  const executeDeleteTemplate = useCallback(async () => {
    if (!templateToDeleteInfo) return;

    const { id, name } = templateToDeleteInfo;
    try {
      const result = await deleteTemplateFromMySql(id);
      
      if (result.success) {
        setAllTemplates(prev => prev.filter(t => t.id !== id));
        toast({
          title: "Success",
          description: `Template "${name}" deleted successfully from local DB.`,
          variant: "default",
        });
      } else {
        throw new Error(result.message || `Failed to delete template "${name}".`);
      }
    } catch (error: any) {
      console.error(`Failed to delete template ${id}:`, error);
      toast({
        title: "Error",
        description: error.message || `Could not delete template "${name}". Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTemplateToDeleteInfo(null);
    }
  }, [templateToDeleteInfo, toast]);


  const handleTogglePublish = useCallback(async (id: string) => {
    const template = allTemplates.find(t => t.id === id);
    if (!template) return;

    const updatedTemplate = { ...template, isPublished: !template.isPublished };

    try {
        const result = await upsertTemplateToMySql(updatedTemplate);
        if (!result.success) {
            throw new Error(result.message || "Failed to update publish status.");
        }
        setAllTemplates(prev => prev.map(t => (t.id === id ? updatedTemplate : t)));
        toast({
            title: "Status Updated",
            description: `Template "${template.name}" is now ${updatedTemplate.isPublished ? "published" : "unpublished"} in local DB.`,
        });
    } catch (error: any) {
        toast({ title: "Update Error", description: error.message, variant: "destructive" });
    }
  }, [allTemplates, toast]);

  const handleSetTopRated = useCallback(async (id: string) => {
    const template = allTemplates.find(t => t.id === id);
    if (!template) return;

    const updatedTemplate = { ...template, isTopRated: !template.isTopRated };
    
    try {
        const result = await upsertTemplateToMySql(updatedTemplate);
        if (!result.success) {
            throw new Error(result.message || "Failed to update top-rated status.");
        }
        setAllTemplates(prev => prev.map(t => (t.id === id ? updatedTemplate : t)));
        toast({
            title: "Template Updated",
            description: `Template "${template.name}" is now ${updatedTemplate.isTopRated ? "Top Rated" : "standard"}.`,
        });
    } catch (error: any) {
        toast({ title: "Update Error", description: error.message, variant: "destructive" });
    }
  }, [allTemplates, toast]);

  const filteredTemplates = useMemo(() => {
    return allTemplates
      .filter(template => {
        const searchMatch =
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
        
        if (!searchMatch) return false;

        switch (activeFilter) {
          case 'unpublished':
            return !template.isPublished;
          case 'restaurant':
            return template.tags.some(tag => tag.toLowerCase() === 'restaurant');
          case 'parlour':
            return template.tags.some(tag => tag.toLowerCase() === 'parlour');
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (a.isTopRated && !b.isTopRated) return -1;
        if (!a.isTopRated && b.isTopRated) return 1;
        try {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (a.createdAt) {
            return -1; 
          } else if (b.createdAt) {
            return 1;  
          }
        } catch (e) {
            console.warn("Error parsing date for sorting in Manage Templates:", e);
        }
        return 0; 
      });
  }, [allTemplates, searchTerm, activeFilter]);

  const stats = useMemo(() => {
    const publishedCount = allTemplates.filter(t => t.isPublished).length;
    return {
      available: allTemplates.length,
      published: publishedCount,
    };
  }, [allTemplates]);

  return (
    <div className="min-h-full bg-background/30 p-4 sm:p-6 lg:p-10 w-full overflow-x-hidden relative">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8 w-full mt-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Layers className="h-8 w-8 mr-3 text-primary" />
          Templates
        </h1>
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-10 w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <section className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Templates</h2>
            {!isLoading && !error && (
              <p className="text-sm text-muted-foreground mt-1">
                {`${stats.available} templates available • ${stats.published} published`}
              </p>
            )}
            {isLoading && (
                <Skeleton className="h-4 w-48 mt-1.5" />
            )}
            {!isLoading && error && (
                 <p className="text-sm text-muted-foreground mt-1">Could not load stats.</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {canCreate && (
              <Button variant="default" onClick={() => setIsAddTemplateDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filters:</span>
            <Button variant={activeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('all')}>All</Button>
            <Button variant={activeFilter === 'unpublished' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('unpublished')}>Unpublished</Button>
            <Button variant={activeFilter === 'restaurant' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('restaurant')}>Restaurant</Button>
            <Button variant={activeFilter === 'parlour' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('parlour')}>Parlour</Button>
        </div>
      </section>

      <Dialog open={isAddTemplateDialogOpen} onOpenChange={setIsAddTemplateDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl flex flex-col h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">Add New Template</DialogTitle>
          </DialogHeader>
          <AddTemplateForm onSuccess={handleAddTemplateSuccess} onOpenChange={setIsAddTemplateDialogOpen} />
        </DialogContent>
      </Dialog>

      {editingTemplateData && (
        <Dialog open={isEditTemplateDialogOpen} onOpenChange={(open) => {
            setIsEditTemplateDialogOpen(open);
            if (!open) setEditingTemplateData(null);
        }}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl flex flex-col h-[90vh] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle className="text-2xl">
                    Edit Template {editingTemplateData.version ? `(v${editingTemplateData.version})` : ''}
                </DialogTitle>
              </DialogHeader>
              <EditTemplateForm 
                  templateData={editingTemplateData} 
                  onSuccess={handleEditTemplateSuccess} 
                  onOpenChange={(open) => {
                      setIsEditTemplateDialogOpen(open);
                      if (!open) setEditingTemplateData(null);
                  }}
              />
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setTemplateToDeleteInfo(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{decodeHtmlEntities(templateToDeleteInfo?.name || '')}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setTemplateToDeleteInfo(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeleteTemplate} 
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <main>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <AdminTemplateSkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-10 bg-card border border-destructive/50 rounded-lg shadow-md">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
            <p className="text-muted-foreground max-w-md mb-4">{error}</p>
            <Button variant="outline" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-lg shadow border border-border">
              <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                {searchTerm || activeFilter !== 'all' ? "No templates match your search or filter." : "No templates found."}
              </p>
              { !searchTerm && activeFilter === 'all' && canCreate && (
                <Button variant="default" onClick={() => setIsAddTemplateDialogOpen(true)} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Template
                </Button>
              )}
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <AdminTemplateCard
                key={template.id}
                template={template}
                onEdit={handleOpenEditTemplateDialog}
                onDelete={handleDeleteTemplate}
                onTogglePublish={handleTogglePublish}
                onSetTopRated={handleSetTopRated}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
