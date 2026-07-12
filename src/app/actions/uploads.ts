"use server";

import fs from 'fs/promises';
import path from 'path';

/**
 * Uploads a file to the local public/uploads directory.
 * @param formData The form data containing the file.
 * @param subDir Optional subdirectory within public/uploads (e.g., 'templates').
 * @returns Object with success status and the local URL of the uploaded file.
 */
export async function uploadFileLocally(formData: FormData, subDir: string = 'general') {
  try {
    const file = formData.get('file') as File;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No file provided' };
    }

    const bytes = await file.arrayBuffer();
    if (!bytes || bytes.byteLength === 0) {
      return { success: false, message: 'Uploaded file is empty' };
    }
    const buffer = Buffer.from(bytes);

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
    const cleanExt = fileExt.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save to filesystem
    await fs.writeFile(filePath, buffer);
    
    // Return relative URL
    const finalUrl = `/uploads/${subDir}/${fileName}`;
    return { success: true, data: { url: finalUrl } };
  } catch (error: any) {
    console.error("Local Upload Error:", error);
    return { success: false, message: error?.message || "Failed to upload file locally" };
  }
}
