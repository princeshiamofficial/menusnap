
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const DEFAULT_TEMPLATE_IMAGE_URL = 'https://erp.colorhutbd.xyz/file/uploads/68502bf9cec52_placeholder.svg';

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
}

function AdminTemplateCard({
  template,
  onEdit,
  onDelete,
  onTogglePublish,
  onSetTopRated,
}: AdminTemplateCardProps): ReactNode {
  
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

  const isDefaultImage = template.imageUrl === DEFAULT_TEMPLATE_IMAGE_URL;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full bg-card">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative group">
          <Image
            src={template.imageUrl} 
            alt={template.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={isDefaultImage ? "placeholder abstract" : getImageHint(template.name)}
          />
          {template.isTopRated && (
            <Badge variant="default" className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 border-yellow-500 font-semibold py-1 px-2 shadow-md">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Top Rated
            </Badge>
          )}
          <Badge
            variant={template.isPublished ? "default" : "secondary"}
            className={cn(
              "absolute bottom-2 left-2 font-medium py-1 px-2.5 shadow-md text-xs",
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

          <div className="absolute top-2 right-2 flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 border-white/30" onClick={() => onSetTopRated(template.id)} aria-label="Toggle Top Rated">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 border-white/30" onClick={() => onTogglePublish(template.id)} aria-label="Toggle Publish Status">
              <Globe2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-black/40 text-white hover:bg-black/60 border-white/30" onClick={() => onEdit(template.id)} aria-label="Edit Template">
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-600/70 text-white hover:bg-red-700/90 border-red-500/50" onClick={() => onDelete(template.id, template.name)} aria-label="Delete Template">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
           <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
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
}

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
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty") })).min(1, "At least one tag is required").max(3, "You can add a maximum of 3 tags"),
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
      tags: [{ value: "" }],
      isTopRated: false,
      isPublished: false,
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

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
        const uploadResponse = await fetch("https://colorhutbd.xyz/vm/api/upload.php", {
          method: "POST",
          body: imageFormData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data.url) {
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

    const templatePayload = {
      id: slugify(data.templateName) + '-' + Date.now().toString(36),
      name: data.templateName,
      description: data.description,
      isTopRated: data.isTopRated,
      isPublished: data.isPublished,
      tags: data.tags.map(tag => tag.value),
      imageUrl: uploadedImageUrl,
      items: [], 
    };

    try {
      const templateResponse = await fetch("https://colorhutbd.xyz/vm/api/templates.php", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templatePayload),
      });
      const templateResult = await templateResponse.json();

      if (!templateResponse.ok || !templateResult.success) {
        throw new Error(templateResult.message || `Failed to add template. Status: ${templateResponse.status}`);
      }
      toast({ title: "Template Added", description: `Template "${data.templateName}" created successfully.` });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Template Add Error", description: error.message, variant: "destructive" });
    }
  }


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
      <ScrollArea className="flex-grow min-h-0">
        <div className="space-y-4 p-1">
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
            <Label>Tags* (Max 3)</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mt-1">
                <Input
                  {...form.register(`tags.${index}.value`)}
                  placeholder={`Tag ${index + 1} (e.g., Restaurant, Cafe)`}
                  className={form.formState.errors.tags?.[index]?.value ? "border-destructive" : ""}
                />
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
             {form.formState.errors.tags?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.tags.message}</p>}
             { form.formState.errors.tags && !form.formState.errors.tags.message &&
                Array.isArray(form.formState.errors.tags) &&
                form.formState.errors.tags.map((tagError, index) =>
                  tagError?.value?.message ? (
                    <p key={index} className="text-sm text-destructive mt-1">
                      Tag {index + 1}: {tagError.value.message}
                    </p>
                  ) : null
                )}

            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="mt-2" disabled={fields.length >= 3}>
              <Plus className="mr-2 h-4 w-4" /> Add Another Tag
            </Button>
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
      <DialogFooter className="pt-4 border-t">
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
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty") })).min(1, "At least one tag is required").max(3, "You can add a maximum of 3 tags"),
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
      templateName: templateData.name || "",
      description: templateData.description || "",
      tags: templateData.tags ? templateData.tags.map(tag => ({ value: tag })) : [{ value: "" }],
      isTopRated: templateData.isTopRated || false,
      isPublished: templateData.isPublished || false,
      imageFile: undefined, 
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags",
  });

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
        const uploadResponse = await fetch("https://colorhutbd.xyz/vm/api/upload.php", {
          method: "POST",
          body: imageFormData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data.url) {
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
      tags: data.tags.map(tag => tag.value),
      imageUrl: finalImageUrl,
      items: templateData.tags, 
    };

    try {
      const templateResponse = await fetch("https://colorhutbd.xyz/vm/api/templates.php", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templatePayload),
      });
      const templateResult = await templateResponse.json();

      if (!templateResponse.ok || !templateResult.success) {
        let backendErrorMessage = "Failed to update template.";
        if (templateResult && templateResult.message) {
            backendErrorMessage = templateResult.message;
        } else if (templateResult && templateResult.data && typeof templateResult.data === 'string') {
            backendErrorMessage = templateResult.data; 
        } else if (templateResponse.statusText) {
            backendErrorMessage = `Failed to update template. Status: ${templateResponse.status} ${templateResponse.statusText}`;
        }
        throw new Error(backendErrorMessage);
      }
      toast({ title: "Template Updated", description: `Template "${data.templateName}" updated successfully.` });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Template Update Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow">
      <ScrollArea className="flex-grow min-h-0">
        <div className="space-y-4 p-1">
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
            <Label>Tags* (Max 3)</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mt-1">
                <Input
                  {...form.register(`tags.${index}.value`)}
                  placeholder={`Tag ${index + 1}`}
                  className={form.formState.errors.tags?.[index]?.value ? "border-destructive" : ""}
                />
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {form.formState.errors.tags?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.tags.message}</p>}
            {form.formState.errors.tags && !form.formState.errors.tags.message && Array.isArray(form.formState.errors.tags) &&
                form.formState.errors.tags.map((tagError, index) =>
                  tagError?.value?.message ? (
                    <p key={index} className="text-sm text-destructive mt-1">
                      Tag {index + 1}: {tagError.value.message}
                    </p>
                  ) : null
                )}

            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="mt-2" disabled={fields.length >= 3}>
              <Plus className="mr-2 h-4 w-4" /> Add Another Tag
            </Button>
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
      <DialogFooter className="pt-4 border-t">
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
  const [allTemplates, setAllTemplates] = useState<ApiAdminTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      const response = await fetch("https://colorhutbd.xyz/vm/api/templates.php", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success || !result.data || !Array.isArray(result.data.templates)) {
        console.error("Invalid API response structure for templates:", result);
        throw new Error("Invalid data format from API");
      }
      
      const fetchedTemplatesSource: ApiAdminTemplate[] = result.data.templates.map((t: any, index: number) => ({
        id: String(t.id), 
        name: t.name || `Untitled Template ${index + 1}`,
        description: t.description || 'No description available.',
        isTopRated: t.isTopRated === undefined ? false : Boolean(t.isTopRated),
        isPublished: t.isPublished === undefined ? (index % 2 === 0) : Boolean(t.isPublished),
        tags: Array.isArray(t.tags) ? t.tags : ['untagged'],
        imageUrl: t.imageUrl || DEFAULT_TEMPLATE_IMAGE_URL,
        createdAt: t.createdAt || new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        version: t.version || `${Math.floor(Math.random() * 3) + 1}.0`,
        category: t.category || "General",
      }));

      const uniqueFetchedTemplates: ApiAdminTemplate[] = [];
      const seenIds = new Set<string>();
      for (const t of fetchedTemplatesSource) {
        if (!seenIds.has(t.id)) {
          uniqueFetchedTemplates.push(t);
          seenIds.add(t.id);
        }
      }
      setAllTemplates(uniqueFetchedTemplates);

    } catch (e: any) {
      console.error("Failed to fetch templates:", e);
      setError(e.message || "Failed to load templates. Please try again later.");
      setAllTemplates([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

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
      const response = await fetch(`https://colorhutbd.xyz/vm/api/templates.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setAllTemplates(prev => prev.filter(t => t.id !== id));
        toast({
          title: "Success",
          description: result.message || `Template "${name}" deleted successfully.`,
          variant: "default",
        });
      } else {
        throw new Error(result.message || `Failed to delete template "${name}". Status: ${response.status}`);
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
        const response = await fetch("https://colorhutbd.xyz/vm/api/templates.php", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTemplate),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to update publish status.");
        }
        setAllTemplates(prev => prev.map(t => (t.id === id ? updatedTemplate : t)));
        toast({
            title: "Status Updated",
            description: `Template "${template.name}" is now ${updatedTemplate.isPublished ? "published" : "unpublished"}.`,
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
        const response = await fetch("https://colorhutbd.xyz/vm/api/templates.php", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTemplate),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to update top-rated status.");
        }
        setAllTemplates(prev => prev.map(t => (t.id === id ? updatedTemplate : t)));
        toast({
            title: "Status Updated",
            description: `Template "${template.name}" ${updatedTemplate.isTopRated ? "is now" : "is no longer"} top-rated.`,
        });
    } catch (error:any) {
        toast({ title: "Update Error", description: error.message, variant: "destructive" });
    }
  }, [allTemplates, toast]);

  const filteredTemplates = useMemo(() => {
    return allTemplates
      .filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
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
  }, [allTemplates, searchTerm]);

  const stats = useMemo(() => {
    const publishedCount = allTemplates.filter(t => t.isPublished).length;
    return {
      available: allTemplates.length,
      published: publishedCount,
    };
  }, [allTemplates]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
            <Button variant="default" onClick={() => setIsAddTemplateDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={isAddTemplateDialogOpen} onOpenChange={setIsAddTemplateDialogOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl flex flex-col max-h-[calc(100vh-80px)]">
          <DialogHeader>
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
            <DialogContent className="sm:max-w-xl md:max-w-2xl flex flex-col max-h-[calc(100vh-80px)]">
            <DialogHeader>
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
              Are you sure you want to delete "{templateToDeleteInfo?.name}"? This action cannot be undone.
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
                {searchTerm ? "No templates match your search." : "No templates found."}
              </p>
              { !searchTerm && (
                <Button variant="default" onClick={() => setIsAddTemplateDialogOpen(true)} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Template
                </Button>
              )}
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template, index) => (
              <AdminTemplateCard
                key={`${template.id}-${index}`}
                template={template}
                onEdit={handleOpenEditTemplateDialog}
                onDelete={handleDeleteTemplate}
                onTogglePublish={handleTogglePublish}
                onSetTopRated={handleSetTopRated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

