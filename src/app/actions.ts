'use server';

import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ImageType } from '@/components/art-collage';
import { imagekit } from '@/lib/imagekit';

const artworksDataPath = path.join(process.cwd(), 'src', 'data', 'artworks.json');

async function readArtworksData(): Promise<ImageType[]> {
  try {
    const fileContent = await readFile(artworksDataPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

async function writeArtworksData(data: ImageType[]) {
  await mkdir(path.dirname(artworksDataPath), { recursive: true });
  await writeFile(artworksDataPath, JSON.stringify(data, null, 2));
}

export async function getArtworks(): Promise<ImageType[]> {
  try {
    const artworks = await readArtworksData();
    return artworks;
  } catch (error) {
    console.error("Failed to get artworks:", error);
    return [];
  }
}

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
    const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const filename = `${Date.now()}-${safeTitle}`;

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: filename,
      folder: '/artifolio',
      useUniqueFileName: true,
    });

    const newArtwork: ImageType = {
        src: uploadResponse.url,
        fileId: uploadResponse.fileId,
        width: uploadResponse.width ?? 500,
        height: uploadResponse.height ?? 500,
        alt: title,
        title: title,
        aiHint: 'uploaded art',
    };

    const allArtworks = await readArtworksData();
    allArtworks.unshift(newArtwork);
    await writeArtworksData(allArtworks);

    revalidatePath('/');

    return { 
      success: true, 
      artwork: newArtwork,
    };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return { success: false, error: error.message || 'Failed to upload file to ImageKit.' };
  }
}

export async function deleteArtwork(fileId: string) {
  if (!fileId) {
    return { success: false, error: 'Invalid file ID.' };
  }

  try {
    // First, delete from ImageKit
    await imagekit.deleteFile(fileId);

    // Then, remove from our JSON data
    const allArtworks = await readArtworksData();
    const updatedArtworks = allArtworks.filter(art => art.fileId !== fileId);
    
    await writeArtworksData(updatedArtworks);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Deletion failed:', error);
    return { success: false, error: error.message || 'Failed to delete the file.' };
  }
}

export async function updateArtworkOrder(artworks: ImageType[]) {
  if (!Array.isArray(artworks)) {
    return { success: false, error: 'Invalid data format.' };
  }
  
  try {
    await writeArtworksData(artworks);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update artwork order:', error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}


// Profile Data Management

const profileDataSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().min(1, 'Description is required.'),
  instagram: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address.'),
  profilePictureUrl: z.string().url().nullable(),
  profilePictureFileId: z.string().nullable(),
});

export type ProfileData = z.infer<typeof profileDataSchema>;

const profileDataPath = path.join(process.cwd(), 'public', 'profile', 'profile.json');


export async function uploadProfilePicture(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  try {
    // Delete the old profile picture if it exists
    const currentProfileData = await getProfileData();
    if (currentProfileData.profilePictureFileId) {
      await imagekit.deleteFile(currentProfileData.profilePictureFileId);
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `profile-${Date.now()}`,
      folder: '/artifolio/profile',
      useUniqueFileName: true,
      isPrivateFile: false,
    });

    const updatedProfileData: ProfileData = {
        ...currentProfileData,
        profilePictureUrl: uploadResponse.url,
        profilePictureFileId: uploadResponse.fileId,
    }

    await writeProfileData(updatedProfileData);

    revalidatePath('/');

    return { 
      success: true, 
      path: uploadResponse.url,
      width: uploadResponse.width,
      height: uploadResponse.height,
      fileId: uploadResponse.fileId,
    };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return { success: false, error: error.message || 'Failed to save the file.' };
  }
}


export async function getProfileData(): Promise<ProfileData> {
  try {
    const fileContent = await readFile(profileDataPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    const defaultData: ProfileData = {
      name: 'Thakur Yashraj Singh',
      description: 'An artist exploring the dance between light and shadow, capturing fleeting moments and emotions on canvas with a blend of classical techniques and modern expressionism.',
      instagram: 'https://www.instagram.com/yash_._100/',
      email: 't.yashraj.singh.710@gmail.com',
      profilePictureUrl: null,
      profilePictureFileId: null,
    };
    try {
      await writeProfileData(defaultData);
      return defaultData;
    } catch (writeError) {
       console.error("Could not write initial profile.json", writeError);
       return defaultData;
    }
  }
}

async function writeProfileData(data: ProfileData) {
    await mkdir(path.dirname(profileDataPath), { recursive: true });
    await writeFile(profileDataPath, JSON.stringify(data, null, 2));
}


export async function updateProfileData(data: Omit<ProfileData, 'profilePictureUrl' | 'profilePictureFileId'>) {
  try {
    const currentData = await getProfileData();
    const newData = { ...currentData, ...data };
    
    const validation = profileDataSchema.safeParse(newData);
    if (!validation.success) {
      return { success: false, error: validation.error.flatten().fieldErrors };
    }

    await writeProfileData(validation.data);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update profile data:', error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}
