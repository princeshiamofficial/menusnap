import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const subDir = (formData.get('subDir') as string) || 'spotlights';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    if (!bytes || bytes.byteLength === 0) {
      return NextResponse.json({ success: false, message: 'File is empty' }, { status: 400 });
    }
    const inputBuffer = Buffer.from(bytes);

    // Create target directory in public/uploads/${subDir}
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory already exists or created
    }

    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${uniqueSuffix}.webp`;
    const filepath = path.join(uploadDir, filename);

    // Compress image with Sharp to WebP (max 1200px)
    let outputBuffer: Buffer;
    try {
      outputBuffer = await sharp(inputBuffer)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      outputBuffer = inputBuffer;
    }

    // Write file to disk
    await fs.writeFile(filepath, outputBuffer);

    const publicUrl = `/uploads/${subDir}/${filename}`;
    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
      },
    });
  } catch (error: any) {
    console.error('API Upload Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server upload failed' },
      { status: 500 }
    );
  }
}
