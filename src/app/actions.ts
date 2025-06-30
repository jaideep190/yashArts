'use server';

import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

export async function deleteArtwork(src: string) {
  if (!src || !src.startsWith('/artworks/')) {
    return { success: false, error: 'Invalid file path.' };
  }

  try {
    const filePath = path.join(process.cwd(), 'public', src);
    await unlink(filePath);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Deletion failed:', error);
    // Specifically check for file not found error to give a better message
    if (error.code === 'ENOENT') {
         return { success: false, error: 'File not found. It may have already been deleted.' };
    }
    return { success: false, error: 'Failed to delete the file.' };
  }
}


const profileDataSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
  instagram: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address.'),
});

export type ProfileData = z.infer<typeof profileDataSchema>;

const profileDataPath = path.join(process.cwd(), 'public', 'profile', 'profile.json');

export async function getProfileData(): Promise<ProfileData> {
  try {
    const fileContent = await readFile(profileDataPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, create it with default data.
    const defaultData: ProfileData = {
      name: 'Thakur Yashraj Singh',
      description: 'An artist exploring the dance between light and shadow, capturing fleeting moments and emotions on canvas with a blend of classical techniques and modern expressionism.',
      instagram: 'https://www.instagram.com/yash_._100/',
      email: 't.yashraj.singh.710@gmail.com',
    };
    try {
      await mkdir(path.dirname(profileDataPath), { recursive: true });
      await writeFile(profileDataPath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    } catch (writeError) {
       console.error("Could not write initial profile.json", writeError);
       return defaultData; // return default data even if write fails
    }
  }
}

export async function updateProfileData(data: ProfileData) {
  try {
    const validation = profileDataSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.flatten().fieldErrors };
    }

    await writeFile(profileDataPath, JSON.stringify(validation.data, null, 2));
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update profile data:', error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}
