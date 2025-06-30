'use server';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

// Use require for image-size as it's more reliable in Next.js server environments
const sizeOf = require('image-size');

export async function uploadArtwork(formData: FormData) {
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;

  if (!file) {
    return { success: false, error: 'No file provided.' };
  }
  if (!title || title.trim().length === 0) {
    return { success: false, error: 'A title is required.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Sanitize title for use in filename
    const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const fileExtension = file.name.split('.').pop() || 'png';
    const filename = `${Date.now()}-${safeTitle}.${fileExtension}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'artworks');

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Get image dimensions on the server
    const dimensions = sizeOf(filePath);

    // Return the public path and dimensions for the client to use
    const publicPath = `/artworks/${filename}`;

    // Revalidate the home page to show the new image immediately
    revalidatePath('/');

    return { 
      success: true, 
      path: publicPath,
      width: dimensions.width,
      height: dimensions.height
    };
  } catch (error: any) {
    console.error('Upload failed:', error);
    // Return the actual error message for better debugging
    return { success: false, error: error.message || 'Failed to save the file.' };
  }
}

export async function uploadProfilePicture(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // Use a fixed filename to make it easy to reference
    const filename = 'profile.png';
    const uploadDir = path.join(process.cwd(), 'public', 'profile');

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Get image dimensions on the server
    const dimensions = sizeOf(filePath);

    // Return the public path to the client
    const publicPath = `/profile/${filename}`;

    // Revalidate the home page to show the new image immediately on the server
    revalidatePath('/');

    return { 
      success: true, 
      path: publicPath,
      width: dimensions.width,
      height: dimensions.height
    };
  } catch (error: any) {
    console.error('Upload failed:', error);
    // Return the actual error message for better debugging
    return { success: false, error: error.message || 'Failed to save the file.' };
  }
}
