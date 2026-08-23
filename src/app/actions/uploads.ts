"use server";

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Optimizes and compresses an image buffer using Sharp.
 */
async function compressBufferWithSharp(
  buffer: Buffer,
  fileType: string = '',
  ext: string = '',
  options: UploadOptions = {}
): Promise<{ buffer: Buffer; ext: string }> {
  const cleanExt = ext.toLowerCase();
  const isGifOrSvg =
    fileType.includes('gif') ||
    fileType.includes('svg') ||
    cleanExt === '.gif' ||
    cleanExt === '.svg';

  if (isGifOrSvg) {
    return { buffer, ext: cleanExt || '.png' };
  }

  const isImage =
    fileType.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.webp'].includes(cleanExt);

  if (!isImage) {
    return { buffer, ext: cleanExt };
  }

  try {
    const maxWidth = options.maxWidth || 1600;
    const maxHeight = options.maxHeight || 1600;
    const quality = options.quality || 80;

    const compressedBuffer = await sharp(buffer)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    return { buffer: Buffer.from(compressedBuffer), ext: '.webp' };
  } catch (error) {
    console.warn('Sharp compression skipped or failed, saving original:', error);
    return { buffer, ext: cleanExt || '.png' };
  }
}

/**
 * Uploads a file to the local public/uploads directory with automatic image compression.
 * @param formData The form data containing the file.
 * @param subDir Optional subdirectory within public/uploads (e.g., 'templates').
 * @param options Optional compression options (maxWidth, maxHeight, quality).
 * @returns Object with success status and the local URL of the uploaded file.
 */
export async function uploadFileLocally(
  formData: FormData,
  subDir: string = 'general',
  options?: UploadOptions
) {
  try {
    const file = formData.get('file') as File;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No file provided' };
    }

    const bytes = await file.arrayBuffer();
    if (!bytes || bytes.byteLength === 0) {
      return { success: false, message: 'Uploaded file is empty' };
    }
    let buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const rawName = file.name || 'image.png';
    let fileExt = path.extname(rawName);
    if (!fileExt) {
      if (file.type === 'image/jpeg') fileExt = '.jpg';
      else if (file.type === 'image/webp') fileExt = '.webp';
      else if (file.type === 'image/gif') fileExt = '.gif';
      else fileExt = '.png';
    }

    // Automatically compress and optimize image
    const compressed = await compressBufferWithSharp(
      buffer,
      file.type,
      fileExt,
      subDir === 'avatars'
        ? { maxWidth: 600, maxHeight: 600, quality: 80, ...options }
        : options
    );
    buffer = compressed.buffer;
    const cleanExt = compressed.ext;

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save to filesystem
    await fs.writeFile(filePath, buffer);
    
    // Return relative URL
    const finalUrl = `/uploads/${subDir}/${fileName}`;
    return { success: true, data: { url: finalUrl } };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload file locally";
    console.error("Local Upload Error:", error);
    return { success: false, message };
  }
}

/**
 * Uploads an image file to ImgBB API (with FreeImageHost CDN fallback).
 * Automatically compresses the image buffer with Sharp first for ultra-fast, reliable uploads.
 * @param formData FormData containing 'file'
 */
export async function uploadToImgBB(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No image file provided' };
    }

    const bytes = await file.arrayBuffer();
    if (!bytes || bytes.byteLength === 0) {
      return { success: false, message: 'Uploaded file is empty' };
    }
    const originalBuffer = Buffer.from(bytes);

    // Extract file extension
    const rawName = file.name || 'image.png';
    let fileExt = path.extname(rawName);
    if (!fileExt) {
      if (file.type === 'image/jpeg') fileExt = '.jpg';
      else if (file.type === 'image/webp') fileExt = '.webp';
      else fileExt = '.png';
    }

    // 1. Ultra-fast Sharp compression
    const { buffer: compressedBuffer } = await compressBufferWithSharp(
      originalBuffer,
      file.type,
      fileExt,
      { maxWidth: 1200, maxHeight: 1200, quality: 80 }
    );

    const base64Str = compressedBuffer.toString('base64');
    const apiKey = '523b6fbc5a59e66844acb1fa9e13bd8b';

    // 2. Try ImgBB API upload
    try {
      const imgbbBody = new FormData();
      imgbbBody.append('key', apiKey);
      imgbbBody.append('image', base64Str);

      const controller1 = new AbortController();
      const timeoutId1 = setTimeout(() => controller1.abort(), 6000);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: imgbbBody,
        signal: controller1.signal,
      });
      clearTimeout(timeoutId1);

      const data = await response.json();
      if (data.success && data.data?.url) {
        const imageUrl = data.data.display_url || data.data.url;
        return {
          success: true,
          data: {
            url: imageUrl,
            thumb: data.data.thumb?.url,
            deleteUrl: data.data.delete_url,
          },
        };
      }
      console.warn('ImgBB API returned non-success response:', data);
    } catch (imgbbErr) {
      console.warn('ImgBB API upload attempt failed:', imgbbErr);
    }

    // 3. Fallback to FreeImageHost CDN API if ImgBB key fails
    try {
      const fihKey = '6d207e260ce005d8f0713e5b4c456860';
      const fihBody = new FormData();
      fihBody.append('key', fihKey);
      fihBody.append('action', 'upload');
      fihBody.append('source', base64Str);
      fihBody.append('format', 'json');

      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 6000);

      const response2 = await fetch(`https://freeimage.host/api/1/upload`, {
        method: 'POST',
        body: fihBody,
        signal: controller2.signal,
      });
      clearTimeout(timeoutId2);

      const data2 = await response2.json();
      if (data2.status_code === 200 && data2.image?.url) {
        return {
          success: true,
          data: {
            url: data2.image.display_url || data2.image.url,
            thumb: data2.image.thumb?.url,
          },
        };
      }
      console.warn('FreeImageHost API error:', data2);
    } catch (fihErr) {
      console.warn('FreeImageHost upload attempt failed:', fihErr);
    }

    // 4. Local File Upload Fallback
    return await uploadFileLocally(formData, 'spotlights');
  } catch (error: any) {
    console.error('Image CDN Upload Exception:', error);
    return { success: false, message: error?.message || 'Failed to upload image' };
  }
}
