"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

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
  onDelete: (id: string) => void;
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

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full bg-card">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative group">
          <Image
            src={template.imageUrl || `https://placehold.co/600x450.png?text=${encodeURIComponent(template.name)}`}
            alt={template.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={getImageHint(template.name)}
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
            <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-600/70 text-white hover:bg-red-700/90 border-red-500/50" onClick={() => onDelete(template.id)} aria-label="Delete Template">
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

export default function ManageTemplatesPage(): ReactNode {
  const [allTemplates, setAllTemplates] = useState<ApiAdminTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchTemplates = async () => {
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
      
      const fetchedTemplates: ApiAdminTemplate[] = result.data.templates.map((t: any, index: number) => ({
        id: String(t.id),
        name: t.name || `Untitled Template ${index + 1}`,
        description: t.description || 'No description available.',
        isTopRated: t.isTopRated === undefined ? false : Boolean(t.isTopRated),
        isPublished: t.isPublished === undefined ? (index % 2 === 0) : Boolean(t.isPublished),
        tags: Array.isArray(t.tags) ? t.tags : ['untagged'],
        imageUrl: t.imageUrl || `https://placehold.co/600x450.png?text=Template+${index + 1}`,
        createdAt: t.createdAt || new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        version: t.version || `${Math.floor(Math.random() * 3) + 1}.0`,
        category: t.category || "General",
      }));
      setAllTemplates(fetchedTemplates);
    } catch (e: any) {
      console.error("Failed to fetch templates:", e);
      setError(e.message || "Failed to load templates. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleRefresh = () => {
    fetchTemplates();
  };

  const handleAddTemplate = () => {
    console.log("Add new template clicked");
    toast({
      title: "Feature Coming Soon",
      description: "Adding new templates will be available shortly.",
    });
  };
  
  const handleEditTemplate = (id: string) => {
    console.log(`Edit template: ${id}`);
    toast({
      title: "Feature Coming Soon",
      description: `Editing template ${id} will be available shortly.`,
    });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }
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
          description: result.message || "Template deleted successfully.",
          variant: "default",
        });
      } else {
        throw new Error(result.message || `Failed to delete template. Status: ${response.status}`);
      }
    } catch (error: any) {
      console.error(`Failed to delete template ${id}:`, error);
      toast({
        title: "Error",
        description: error.message || "Could not delete template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = (id: string) => {
    console.log(`Toggle publish status for template: ${id}`);
    setAllTemplates(prev => prev.map(t => t.id === id ? {...t, isPublished: !t.isPublished } : t));
     toast({
      title: "Status Updated (Client-side)",
      description: `Publish status for template ${id} toggled locally. API integration pending.`,
    });
  };

  const handleSetTopRated = (id: string) => {
    console.log(`Set top rated for template: ${id}`);
     setAllTemplates(prev => prev.map(t => t.id === id ? {...t, isTopRated: !t.isTopRated } : t));
     toast({
      title: "Status Updated (Client-side)",
      description: `Top-rated status for template ${id} toggled locally. API integration pending.`,
    });
  };

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
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
            {isLoading && !error ? (
                 <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                {error ? "Could not load stats." :
                  `${stats.available} templates available • ${stats.published} published`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="default" onClick={handleAddTemplate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>
      </section>

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
                <Button variant="default" onClick={handleAddTemplate} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
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
                onEdit={handleEditTemplate}
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
    
    
