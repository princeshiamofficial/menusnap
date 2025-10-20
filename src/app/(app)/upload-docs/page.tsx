"use client";

import { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileText, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .doc, .docx
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xls, .xlsx
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .ppt, .pptx
  "application/zip", "application/x-zip-compressed",
];

export default function UploadDocsPage(): ReactNode {
  const [files, setFiles] = useState<File[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    let validationError = false;

    const validatedFiles = newFiles.filter(file => {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({ title: "Invalid File Type", description: `"${file.name}" is not a supported file type.`, variant: "destructive" });
        validationError = true;
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File Too Large", description: `"${file.name}" exceeds the 10MB size limit.`, variant: "destructive" });
        validationError = true;
        return false;
      }
      return true;
    });

    if (validatedFiles.length > 0) {
      setFiles(prev => {
        const existingFileNames = new Set(prev.map(f => f.name));
        const uniqueNewFiles = validatedFiles.filter(f => !existingFileNames.has(f.name));
        return [...prev, ...uniqueNewFiles];
      });
    }
  }, [toast]);

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    handleFileChange(event.dataTransfer.files);
  }, [handleFileChange]);
  
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

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: "No Files Selected", description: "Please select at least one file to upload.", variant: "destructive" });
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));

    try {
      const response = await fetch("https://colorhutbd.xyz/vm/api/upload.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'An unknown error occurred during upload.');
      }

      toast({
        title: "Upload Successful",
        description: `${result.uploaded_files?.length || files.length} file(s) have been uploaded.`,
      });
      setFiles([]); // Clear files on success
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload files.");
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = useMemo(() => {
    return files.reduce((acc, file) => acc + file.size, 0);
  }, [files]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 space-y-8">
       <header>
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <UploadCloud className="h-8 w-8 mr-3 text-primary" />
          Upload Your Documents
        </h1>
        <p className="text-muted-foreground mt-1">
          Easily upload your design files, documents, or any other necessary assets.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>File Uploader</CardTitle>
          <CardDescription>Drag & drop your files or click to browse.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              isDraggingOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-foreground">Click to upload or drag and drop</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG, etc. (Max 10MB per file)</p>
            <Input id="file-upload-input" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e.target.files)} />
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Selected Files ({files.length})</h3>
              <div className="border rounded-lg max-h-60 overflow-y-auto bg-muted/30">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={file.name + file.lastModified}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                      className="flex items-center justify-between p-3 border-b border-border/50 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-primary shrink-0"/>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveFile(index)}>
                        <X className="h-4 w-4"/>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
               <div className="flex justify-end text-sm font-medium text-muted-foreground">
                Total size: {formatBytes(totalSize)}
              </div>
            </div>
          )}

          {uploadError && (
             <div className="flex items-center gap-3 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle className="h-5 w-5"/>
                <p>{uploadError}</p>
             </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setFiles([])} disabled={files.length === 0 || isUploading}>
              Clear All
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0 || isUploading}>
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Uploading...</> : <> <UploadCloud className="mr-2 h-4 w-4"/> Upload ({files.length})</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
