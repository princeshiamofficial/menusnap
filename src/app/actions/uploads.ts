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
 * Uploads an image file to ImgBB API using the API key.
 * @param formData FormData containing 'file'
 */
export async function uploadToImgBB(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No image file provided' };
    }

    const apiKey = '523b6fbc5a59e66844acb1fa9e13bd8b';
    const body = new FormData();
    body.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body,
    });

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
    } else {
      console.error('ImgBB API returned error:', data.error);
      return { success: false, message: data.error?.message || 'Image upload failed' };
    }
  } catch (error: any) {
    console.error('ImgBB Upload Exception:', error);
    return { success: false, message: error?.message || 'Failed to upload image' };
  }
}

