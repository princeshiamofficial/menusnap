import { readPublishedEbookImage } from '@/app/actions/ebook-studio';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ ebookId: string; sourceId: string }> }) {
  const { ebookId, sourceId } = await context.params;
  const result = await readPublishedEbookImage(Number(ebookId), Number(sourceId));
  if (!result.success) return Response.json({ error: 'Image not found.' }, { status: 404 });
  return new Response(new Uint8Array(Buffer.from(result.data.base64, 'base64')), { headers: {
    'Content-Type': result.data.mime, 'Content-Disposition': 'inline',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  } });
}
