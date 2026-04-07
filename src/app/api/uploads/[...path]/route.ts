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
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // In Next.js 15+, params must be awaited
    const { path: filePathArray } = await params;
    
    if (!filePathArray || filePathArray.length === 0) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    const fileName = filePathArray[filePathArray.length - 1];
    
    // Construct absolute path. Try multiple common structures for production.
    const root = process.cwd();
    const possiblePaths = [
      path.join(root, 'public', 'uploads', ...filePathArray),
      // Standalone mode often has the app structure in .next/standalone
      path.join(root, '.next', 'standalone', 'public', 'uploads', ...filePathArray)
    ];

    let absolutePath = possiblePaths[0];
    let fileBuffer;

    try {
      fileBuffer = await fs.readFile(absolutePath);
    } catch (e) {
      // Try the next path if the first fails
      absolutePath = possiblePaths[1];
      fileBuffer = await fs.readFile(absolutePath);
    }

    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                        ext === '.png' ? 'image/png' :
                        ext === '.webp' ? 'image/webp' :
                        ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';

    // Return the file
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
