import { z } from 'zod';

const sourceIdSchema = z.number().int().nonnegative();
export const ebookPageDesignSchema = z.object({
  kind: z.literal('ebook-page'),
  title: z.string().min(1).max(200),
  theme: z.enum(['amber', 'blue', 'emerald', 'rose', 'mono']),
  appearance: z.enum(['light', 'dark']),
  typography: z.enum(['serif', 'sans']),
  heroLayout: z.enum(['split', 'centered', 'book-focus']),
  hero: z.object({
    eyebrow: z.string().max(100),
    heading: z.string().min(1).max(250),
    description: z.string().max(1500),
    buttonLabel: z.string().min(1).max(100),
    coverSourceId: sourceIdSchema.describe('Uploaded image ID, or 0 for the existing ebook cover'),
  }),
  sections: z.array(z.object({
    type: z.enum(['features', 'chapters', 'testimonials', 'faq', 'cta']),
    heading: z.string().max(200),
    description: z.string().max(1500),
    items: z.array(z.object({
      title: z.string().max(200),
      description: z.string().max(2000),
      attribution: z.string().max(200),
      imageSourceId: sourceIdSchema.describe('Uploaded image ID, or 0 for no image'),
    })).max(16),
  })).max(10),
  download: z.object({
    heading: z.string().min(1).max(200),
    description: z.string().max(1000),
    buttonLabel: z.string().min(1).max(100),
  }),
});

export type EbookPageDesign = z.infer<typeof ebookPageDesignSchema>;
export interface EbookSource { id: number; name: string; mime: string; attached: boolean }
export interface EbookRevision { id: number; parentId: number | null; prompt: string; response: string; createdAt: string }
export interface EbookPublication { ebookId: number; revisionId: number | null }
export interface EbookWorkspace {
  id: number;
  title: string;
  currentRevisionId: number | null;
  design: EbookPageDesign | null;
  sources: EbookSource[];
  revisions: EbookRevision[];
  publication: EbookPublication | null;
  aiAvailable: boolean;
}

/** Returns the selected branch's conversation, excluding alternate designs. */
export function ebookConversation(revisions: EbookRevision[], current: number | null) {
  const conversation: EbookRevision[] = [];
  const visited = new Set<number>();
  while (current !== null) {
    if (visited.has(current)) throw new Error('Invalid version history.');
    visited.add(current);
    const revision = revisions.find(item => item.id === current);
    if (!revision) throw new Error('Version not found.');
    conversation.unshift(revision);
    current = revision.parentId;
  }
  return conversation;
}

/** Undo follows the parent; redo follows the newest child. Saved branches are retained. */
export function ebookHistoryTarget(revisions: EbookRevision[], current: number | null, direction: 'undo' | 'redo') {
  if (direction === 'undo') {
    if (current === null) throw new Error('Nothing to undo.');
    const revision = revisions.find(item => item.id === current);
    if (!revision) throw new Error('Version not found.');
    return revision.parentId;
  }
  const child = revisions.filter(item => item.parentId === current).sort((a, b) => b.id - a.id)[0];
  if (!child) throw new Error('Nothing to redo.');
  return child.id;
}

/** Collects only the image assets actually used by a page design. */
export function ebookPageImageIds(design: EbookPageDesign) {
  return [...new Set([design.hero.coverSourceId, ...design.sections.flatMap(section => section.items.map(item => item.imageSourceId))].filter(id => id !== 0))];
}

/** Rejects image references outside this draft's uploaded files. */
export function validateEbookPageImages(design: EbookPageDesign, sources: EbookSource[]) {
  for (const id of ebookPageImageIds(design)) {
    if (!sources.some(source => source.id === id && source.mime.startsWith('image/'))) throw new Error('The page references an unavailable image. Please try again.');
  }
  return design;
}

export function ebookPageImageUrl(ebookId: number, sourceId: number, preview = false) {
  return preview ? `/api/admin/ebooks/${ebookId}/sources/${sourceId}/` : `/api/ebook/assets/${ebookId}/${sourceId}/`;
}
