import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { MenuItem, Category } from '@/components/menu/menu-preview-dialog';

export const generateMenuDocx = async (
  items: MenuItem[],
  categories: Category[],
  businessName: string
): Promise<Blob> => {
  const itemsGroupedByCategory = items.reduce((acc, item) => {
    const catId = item.category;
    if (!acc[catId]) {
      acc[catId] = [];
    }
    acc[catId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const docChildren: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: businessName,
          bold: true,
          size: 48,
          font: "Arial",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  for (const category of categories) {
    const itemsInCategory = itemsGroupedByCategory[category.id] || [];
    if (itemsInCategory.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: category.name,
              bold: true,
              size: 32,
              font: "Arial",
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      for (const item of itemsInCategory) {
        const priceText = item.price > 0 ? `\t৳${item.price.toLocaleString()}` : '';
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.name,
                bold: true,
                size: 24,
              }),
              new TextRun({
                text: priceText,
                bold: true,
                size: 24,
              }),
            ],
            tabStops: [
                {
                    type: "right",
                    position: 9020, // Max width for A4
                },
            ],
          })
        );

        if (item.description) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: item.description,
                  italics: true,
                  size: 20,
                  color: "595959",
                }),
              ],
              indent: { left: 400 },
              spacing: { after: 100 },
            })
          );
        }

        if (item.subItems && item.subItems.length > 0) {
          for (const subItem of item.subItems) {
            const subPriceText = typeof subItem.price === 'number' ? `\t৳${subItem.price.toLocaleString()}` : '';
             docChildren.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `- ${subItem.name}`,
                            size: 20,
                            color: "333333",
                        }),
                         new TextRun({
                            text: subPriceText,
                            size: 20,
                            color: "333333",
                        }),
                    ],
                     tabStops: [
                        {
                            type: "right",
                            position: 9020,
                        },
                    ],
                    indent: { left: 800 },
                })
            );
          }
        }
         docChildren.push(new Paragraph({ text: "", spacing: { after: 150 } })); // space after item
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
            page: {
                margin: {
                    top: 720, // 0.5 inch
                    right: 720,
                    bottom: 720,
                    left: 720,
                },
            },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};
