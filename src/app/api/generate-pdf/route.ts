
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import type { MenuItem } from '@/components/menu/menu-preview-dialog';

interface Category {
  id: string;
  name: string;
}

// Helper function to generate PDF and return as a buffer
async function generatePdfBuffer(data: { items: MenuItem[], categories: Category[] }): Promise<Buffer> {
  const { items, categories } = data;

  const itemsGroupedByCategory = items.reduce((acc, item) => {
    const catId = item.category;
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Fetch logo image
  let logoImageBuffer: Buffer | null = null;
  try {
    const response = await fetch('https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png');
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      logoImageBuffer = Buffer.from(arrayBuffer);
    }
  } catch (e) {
    console.error("Could not fetch logo for PDF", e);
  }

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
    const primaryColor = '#F9681A'; // Orange theme color

    // Header
    if (logoImageBuffer) {
      doc.image(logoImageBuffer, 50, 45, { width: 150 });
    }
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Menu Selection', 200, 65, { align: 'right' });
    
    doc.moveDown(4);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);


    // Loop through ordered categories
    for (const category of categories) {
        const itemsInCategory = itemsGroupedByCategory[category.id] || [];
        if (itemsInCategory.length > 0) {
            // Category Title
            doc
              .fontSize(16)
              .font('Helvetica-Bold')
              .fillColor(primaryColor)
              .text(category.name, { underline: false });
            
            doc.moveDown(0.75);

            // Table Header
            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('Item', 70, doc.y);
            doc.text('Price', 450, doc.y, { width: 100, align: 'right' });
            doc.moveDown(0.5);
            doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(70, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Items in Category
            doc.font('Helvetica').fontSize(10).fillColor('#333333');
            for (const item of itemsInCategory) {
                const yPos = doc.y;
                doc.text(item.name, 70, yPos, { width: 360 });
                doc.text(`৳${item.price.toLocaleString()}`, 450, yPos, { width: 100, align: 'right' });
                
                const initialY = doc.y;
                // Reset y to start description on the next line, aligned with item name
                doc.y = yPos;
                doc.x = 70;
                if (item.description) {
                    // Move down slightly from the item name line to start the description
                    doc.moveDown(1.2); 
                    doc.fontSize(8).fillColor('#666666').text(item.description, {
                        width: 360,
                        lineGap: 2,
                        align: 'left',
                        indent: 0,
                    });
                }
                const finalY = doc.y;
                // Position the cursor at the end of the item block (either name or description)
                doc.y = Math.max(initialY, finalY);
                
                doc.moveDown(1);
            }
            doc.moveDown(1);
        }
    }

    // Footer
    const pageBottom = doc.page.height - 50;
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, pageBottom - 20).lineTo(550, pageBottom - 20).stroke();
    doc.fontSize(8)
      .fillColor('grey')
      .text(`Generated on: ${new Date().toLocaleString()}`, 50, pageBottom - 10, { align: 'center' });
    
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
