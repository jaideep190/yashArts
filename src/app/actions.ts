'use server';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function uploadArtwork(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'artworks');

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return the public path for the client to use
    const publicPath = `/artworks/${filename}`;

    // Revalidate the home page to show the new image immediately
    revalidatePath('/');

    return { success: true, path: publicPath };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return { success: false, error: 'Failed to save the file.' };
  }
}
