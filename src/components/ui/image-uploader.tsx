"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { uploadFileLocally } from '@/app/actions/uploads';
import { toast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  subDir?: string;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value = '',
  onChange,
  subDir = 'spotlights',
  label = 'Carousel Photo',
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrlInput(value);
  }, [value]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File', description: 'Please select an image file (PNG, JPG, WEBP, etc.)', variant: 'destructive' });
        return;
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadFileLocally(formData, subDir);

        if (result.success && result.data?.url) {
          onChange(result.data.url);
          setUrlInput(result.data.url);
          toast({ title: 'Success', description: 'Image uploaded successfully!' });
        } else {
          // Fallback to FileReader base64 data URL if local file upload failed
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Url = e.target?.result as string;
            if (base64Url) {
              onChange(base64Url);
              setUrlInput(base64Url);
              toast({ title: 'Success', description: 'Image loaded successfully!' });
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error('File upload error:', error);
        // Fallback to FileReader base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Url = e.target?.result as string;
          if (base64Url) {
            onChange(base64Url);
            setUrlInput(base64Url);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, subDir]
  );

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Clipboard Paste Handler
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      // 1. Check for image files in clipboard
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              e.preventDefault();
              handleFile(file);
              return;
            }
          }
        }
      }

      // 2. Check for text URL pasted into container
      const text = e.clipboardData?.getData('text');
      if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/uploads'))) {
        onChange(text);
        setUrlInput(text);
      }
    },
    [handleFile, onChange]
  );

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      toast({ title: 'Updated', description: 'Image URL updated successfully!' });
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all",
              activeTab === 'upload' ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Upload / Drop / Paste
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all",
              activeTab === 'url' ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Image URL
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Image Preview Box (If image value exists) */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-border/80 bg-muted/30 p-2 flex items-center gap-3">
          <div className="relative h-16 w-20 rounded-xl overflow-hidden border border-border bg-background shrink-0">
            <Image src={value} alt="Uploaded Image Preview" fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{value.split('/').pop() || 'Selected Image'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{value}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : activeTab === 'upload' ? (
        /* Drag, Drop, Click, Paste Zone */
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border/80 hover:border-primary/60 bg-card hover:bg-muted/20"
          )}
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-xs font-bold text-foreground">Uploading image...</p>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Click to select, drag &amp; drop, or <span className="text-primary underline">paste image</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  PNG, JPG, WEBP or GIF (Ctrl+V anywhere to paste)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image URL Input */
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste image URL (https://images.unsplash.com/...)"
            className="bg-card border-border text-xs"
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            className="font-bold shrink-0 text-xs px-3"
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
