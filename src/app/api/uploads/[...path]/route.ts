import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * Dynamic route to serve uploaded media files directly from the filesystem.
 * This bypasses Next.js's static file manifest/caching, ensuring that
 * new uploads are visible immediately without a server restart.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePathArray = params.path;
    const fileName = filePathArray[filePathArray.length - 1];
    const subDir = filePathArray.slice(0, filePathArray.length - 1).join('/');
    
    // Construct the absolute path to the file in the public directory
    const absolutePath = path.resolve(process.cwd(), 'public', 'uploads', subDir, fileName);

    // Read the file from the filesystem
    const fileBuffer = await fs.readFile(absolutePath);

    // Determine the content type based on the file extension
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                        ext === '.png' ? 'image/png' :
                        ext === '.webp' ? 'image/webp' :
                        ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error("Dynamic Media Serving Error:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
