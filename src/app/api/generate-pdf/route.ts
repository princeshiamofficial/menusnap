import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import type { MenuItem } from '@/components/menu/menu-preview-dialog';

interface Category {
  id: string;
  name: string;
}

// Helper function to generate PDF and return as a buffer
function generatePdfBuffer(data: { items: MenuItem[], categories: Category[] }): Promise<Buffer> {
  const { items, categories } = data;

  const itemsGroupedByCategory = items.reduce((acc, item) => {
    const catId = item.category;
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      font: 'Helvetica',
    });
    const buffers: any[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // --- PDF Content ---

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Menu Selection', { align: 'center' });
    
    doc.moveDown(2);

    // Loop through ordered categories
    for (const category of categories) {
        const itemsInCategory = itemsGroupedByCategory[category.id] || [];
        if (itemsInCategory.length > 0) {
            // Category Title
            doc
              .fontSize(18)
              .font('Helvetica-Bold')
              .text(category.name, { underline: true });
            
            doc.moveDown(0.5);

            // Items in Category
            for (const item of itemsInCategory) {
                doc
                  .fontSize(12)
                  .font('Helvetica')
                  .list([`${item.name} - ৳${item.price.toLocaleString()}`], {
                      bulletRadius: 2,
                  });
                
                if (item.description) {
                    doc.fontSize(10).fillColor('grey').text(item.description, { indent: 20, lineGap: 2 });
                }
                
                doc.moveDown(0.5);
            }
            doc.moveDown(1);
        }
    }

    // Footer
    doc
      .fontSize(8)
      .fillColor('grey')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center', lineGap: 10 });
    
    doc.end();
  });
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, categories } = body;

    if (!items || !categories || !Array.isArray(items) || !Array.isArray(categories)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid data provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const pdfBuffer = await generatePdfBuffer({ items, categories });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="menu_selection.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
