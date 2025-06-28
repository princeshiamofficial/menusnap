
"use client";

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, XCircle } from 'lucide-react';

// Interfaces should match what's stored in localStorage
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SubMenuItem {
  id: string;
  name: string;
  price?: number;
}

interface MenuItem {
  id:string;
  name: string;
  price: number;
  category: string;
  description?: string;
  subItems?: SubMenuItem[];
}

interface PdfData {
  items: MenuItem[];
  categories: Category[];
}

const PDFPage = (): ReactNode => {
  const [data, setData] = useState<PdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedDate, setGeneratedDate] = useState<string | null>(null);

  useEffect(() => {
    const pdfDataString = localStorage.getItem('pdfData');
    if (pdfDataString) {
      try {
        const parsedData: PdfData = JSON.parse(pdfDataString);
        setData(parsedData);
      } catch (e) {
        console.error("Failed to parse PDF data from localStorage", e);
      }
    }
    setGeneratedDate(new Date().toLocaleDateString());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (data) {
      // Delay printing to allow for rendering
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="bg-gray-200 min-h-screen p-8 flex justify-center">
        <div className="w-[210mm] h-[297mm] bg-white p-12 shadow-lg space-y-8">
          <Skeleton className="h-16 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.items.length) {
    return (
      <div className="bg-gray-200 min-h-screen flex items-center justify-center text-center p-4">
        <div className="bg-white p-10 rounded-lg shadow-xl">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold text-foreground">No Data Found</h1>
          <p className="mt-2 text-muted-foreground">Could not find menu data to generate a PDF.</p>
          <p className="text-sm text-muted-foreground">Please go back and make a selection first.</p>
        </div>
      </div>
    );
  }

  const { items, categories } = data;

  const itemsGroupedByCategory = items.reduce((acc, item) => {
    const catId = item.category;
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="bg-gray-200 min-h-screen p-2 sm:p-8 print:bg-white print:p-0">
      <div className="fixed top-4 right-4 print:hidden z-50">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Again
        </Button>
      </div>
      
      {/* A4 Page Container */}
      <main className="w-[210mm] min-h-[297mm] mx-auto bg-white p-12 shadow-lg print:shadow-none font-sans text-black">
        {/* Header */}
        <header className="flex justify-between items-start pb-8 border-b border-gray-200">
          <div className="w-40 h-auto">
            <Image
              src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
              alt="Color Hut Logo"
              width={160}
              height={64}
              priority
              className="object-contain"
            />
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-primary">Menu Selection</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generated on: {generatedDate || '...'}
            </p>
          </div>
        </header>

        {/* Menu Body */}
        <section className="mt-10">
          {categories.map(category => {
            const itemsInCategory = itemsGroupedByCategory[category.id] || [];
            if (itemsInCategory.length === 0) return null;

            return (
              <div key={category.id} className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-orange-200 pb-2 mb-4">
                  {category.name}
                </h2>
                <div className="space-y-5">
                  {itemsInCategory.map(item => (
                    <div key={item.id} className="grid grid-cols-4 gap-4 items-start">
                      <div className="col-span-3">
                        <h3 className="text-base font-semibold text-gray-800">{item.name}</h3>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 italic">{item.description}</p>
                        )}
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="mt-2 pl-4">
                            {item.subItems.map((sub, index) => (
                              <div key={sub.id || index} className="flex justify-between text-xs text-gray-600">
                                <span>- {sub.name}</span>
                                {typeof sub.price === 'number' && <span>৳{sub.price.toLocaleString()}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-1 text-right">
                        {item.price > 0 && <p className="text-base font-semibold text-gray-800">৳{item.price.toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
        
        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pt-8 mt-auto border-t border-gray-200">
          <p>Thank you for choosing Color Hut!</p>
          <p>www.colorhutbd.xyz</p>
        </footer>
      </main>
    </div>
  );
};

export default PDFPage;
