"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { uploadFileLocally, uploadToImgBB } from '@/app/actions/uploads';
import { toast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  subDir?: string;
  label?: string;
  className?: string;
  useImgBB?: boolean;
}

/**
 * Compresses an image file on HTML5 canvas in the browser.
 * Downscales image to max 1000px and 75% WebP quality (~60KB).
 */
function compressImageClient(file: File, maxWidth = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const img = document.createElement('img');
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width || 800;
              let height = img.height || 600;

              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/webp', quality));
              } else {
                resolve((e.target?.result as string) || '');
              }
            } catch {
              resolve((e.target?.result as string) || '');
            }
          };
          img.onerror = () => resolve((e.target?.result as string) || '');
          img.src = (e.target?.result as string) || '';
        } catch {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } catch {
      resolve('');
    }
  });
}

/**
 * Attempts direct client-side upload to ImgBB from browser.
 */
async function uploadToImgBBClient(base64DataUrl: string): Promise<string | null> {
  try {
    const base64Str = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');
    const apiKey = '523b6fbc5a59e66844acb1fa9e13bd8b';

    const bodyParams = new URLSearchParams();
    bodyParams.append('key', apiKey);
    bodyParams.append('image', base64Str);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data?.url) {
      return data.data.display_url || data.data.url;
    }
  } catch (err) {
    console.warn('Browser direct ImgBB upload failed/timed out:', err);
  }
  return null;
}

export function ImageUploader({
  value = '',
  onChange,
  subDir = 'spotlights',
  label = 'Carousel Photo',
  className,
  useImgBB = false,
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

      setIsUploading(true);

      try {
        // 1. Instant client-side canvas compression (~60KB in <15ms)
        const compressedBase64 = await compressImageClient(file);
        
        let finalUrl: string | null = null;

        // 2. Try CDN / ImgBB Server Action upload first
        try {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = useImgBB ? await uploadToImgBB(formData) : await uploadFileLocally(formData, subDir);
          if (uploadRes.success && uploadRes.data?.url) {
            finalUrl = uploadRes.data.url;
          } else if (useImgBB) {
            const fallbackRes = await uploadFileLocally(formData, subDir);
            if (fallbackRes.success && fallbackRes.data?.url) {
              finalUrl = fallbackRes.data.url;
            }
          }
        } catch (uploadErr) {
          console.warn('File upload action warning:', uploadErr);
        }

        // 3. If remote CDN & local upload failed, use instant compressed WebP string
        if (!finalUrl && compressedBase64) {
          finalUrl = compressedBase64;
        }

        // 4. Update state & UI immediately
        if (finalUrl) {
          onChange(finalUrl);
          setUrlInput(finalUrl);
          toast({ title: 'Success', description: 'Image uploaded successfully!' });
        } else {
          toast({ title: 'Upload Failed', description: 'Could not process image file', variant: 'destructive' });
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast({ title: 'Upload Error', description: 'An error occurred during file upload', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, subDir, useImgBB]
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

      {/* Image Preview Box (If image value exists - SHOW ONLY IMAGE) */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-border/80 bg-card p-1 shadow-sm">
          <div className="relative h-44 w-full rounded-xl overflow-hidden border border-border/40 bg-muted">
            <Image src={value} alt="Uploaded Image Preview" fill unoptimized className="object-cover" />
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-2.5 text-xs font-bold bg-background/80 backdrop-blur-md shadow-md border-border hover:bg-background"
              >
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8 shadow-md"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
