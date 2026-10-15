import { readStudioEbookSource } from '@/app/actions/ebook-studio';

export const runtime = 'nodejs';

export async function GET(request: Request, context: { params: Promise<{ id: string; sourceId: string }> }) {
  const { id, sourceId } = await context.params;
  const result = await readStudioEbookSource(Number(id), Number(sourceId));
  if (!result.success) return Response.json({ error: result.error }, { status: 403 });
  const download = new URL(request.url).searchParams.has('download');
  return new Response(new Uint8Array(Buffer.from(result.data.base64, 'base64')), {
    headers: {
      'Content-Type': result.data.mime,
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(result.data.name)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
