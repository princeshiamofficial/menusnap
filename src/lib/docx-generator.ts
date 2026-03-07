
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import type { MenuItem, Category } from '@/components/menu/menu-preview-dialog';
import { decodeHtmlEntities } from '@/lib/utils';

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
          text: decodeHtmlEntities(businessName),
          bold: true,
          size: 48,
          font: "Arial",
          color: "000000",
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
              text: decodeHtmlEntities(category.name),
              bold: true,
              size: 32,
              font: "Arial",
              color: "F57C12",
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        })
      );

      for (const item of itemsInCategory) {
        const priceText = item.price > 0 ? `\t${item.price.toLocaleString()}/-` : '';
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${decodeHtmlEntities(item.name)}${priceText}`,
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
                  text: decodeHtmlEntities(item.description),
                  italics: true,
                  size: 20,
                  color: "595959",
                }),
              ],
              indent: { left: 400 },
            })
          );
        }

        if (item.subItems && item.subItems.length > 0) {
          for (const subItem of item.subItems) {
            const subPriceText = typeof subItem.price === 'number' && subItem.price > 0 ? `\t${subItem.price.toLocaleString()}/-` : '';
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `- ${decodeHtmlEntities(subItem.name)}${subPriceText}`,
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

// General Tiptap JSON to DOCX generator
export const generateDocxFromJSON = async (json: any, title: string = "Document"): Promise<Blob> => {
  const children: any[] = []

  const processNode = (node: any) => {
    if (!node) return

    switch (node.type) {
      case 'doc':
        node.content?.forEach(processNode)
        break
      case 'paragraph': {
        const textRuns: TextRun[] = []
        node.content?.forEach((child: any) => {
          if (child.type === 'text') {
            textRuns.push(new TextRun({
              text: child.text,
              bold: child.marks?.some((m: any) => m.type === 'bold'),
              italics: child.marks?.some((m: any) => m.type === 'italic'),
              underline: child.marks?.some((m: any) => m.type === 'underline') ? {} : undefined,
              size: 22, // 11pt
              font: "Arial"
            }))
          }
        })
        children.push(new Paragraph({ children: textRuns, spacing: { after: 200 } }))
        break
      }
      case 'heading': {
        const textRuns: TextRun[] = []
        node.content?.forEach((child: any) => {
          if (child.type === 'text') {
            textRuns.push(new TextRun({
              text: child.text,
              bold: true,
              size: node.attrs.level === 1 ? 48 : node.attrs.level === 2 ? 36 : 28,
              font: "Arial"
            }))
          }
        })
        children.push(new Paragraph({
          children: textRuns,
          heading: node.attrs.level === 1 ? HeadingLevel.HEADING_1 : node.attrs.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 200 }
        }))
        break
      }
      case 'bulletList':
        node.content?.forEach((item: any) => {
          if (item.type === 'listItem') {
            const textRuns: TextRun[] = []
            item.content?.forEach((p: any) => {
              p.content?.forEach((child: any) => {
                if (child.type === 'text') {
                  textRuns.push(new TextRun({ text: child.text, size: 22, font: "Arial" }))
                }
              })
            })
            children.push(new Paragraph({
              children: textRuns,
              bullet: { level: 0 },
              spacing: { after: 100 }
            }))
          }
        })
        break
      case 'orderedList':
        node.content?.forEach((item: any, index: number) => {
          if (item.type === 'listItem') {
            const textRuns: TextRun[] = []
            item.content?.forEach((p: any) => {
              p.content?.forEach((child: any) => {
                if (child.type === 'text') {
                  textRuns.push(new TextRun({ text: child.text, size: 22, font: "Arial" }))
                }
              })
            })
            children.push(new Paragraph({
              children: textRuns,
              numbering: { reference: "main-numbering", level: 0 },
              spacing: { after: 100 }
            }))
          }
        })
        break
    }
  }

  processNode(json)

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "main-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch
        }
      },
      children: children
    }]
  })

  return await Packer.toBlob(doc)
}
