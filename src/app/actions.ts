'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ImageType } from '@/components/art-collage';
import { imagekit } from '@/lib/imagekit';

// Firestore collection references
const artworksCollection = collection(db, 'artworks');
const profileCollection = collection(db, 'profile');

// Artwork Data Management
export async function getArtworks(): Promise<ImageType[]> {
  try {
    const q = query(artworksCollection, orderBy('order', 'desc'));
    const artworksSnapshot = await getDocs(q);
    const artworksList = artworksSnapshot.docs.map(doc => doc.data() as ImageType);
    return artworksList;
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

    const artworkRef = doc(artworksCollection, uploadResponse.fileId);

    const newArtwork: ImageType & { order: number } = {
        src: uploadResponse.url,
        fileId: uploadResponse.fileId,
        width: uploadResponse.width ?? 500,
        height: uploadResponse.height ?? 500,
        alt: title,
        title: title,
        aiHint: 'uploaded art',
        order: Date.now(),
    };
    
    await setDoc(artworkRef, newArtwork);

    revalidatePath('/');

    // Return only ImageType fields
    const { order, ...returnedArtwork } = newArtwork;

    return { 
      success: true, 
      artwork: returnedArtwork,
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
    // Explicitly promisify the ImageKit delete operation to ensure it completes.
    await new Promise((resolve, reject) => {
      imagekit.deleteFile(fileId, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
    });

    // Then, remove the record from Firestore
    await deleteDoc(doc(artworksCollection, fileId));

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
    const batch = writeBatch(db);
    const newOrderBase = Date.now();
    
    artworks.forEach((artwork, index) => {
      const artworkRef = doc(artworksCollection, artwork.fileId);
      // Decrementing index from a base timestamp to maintain descending order
      batch.update(artworkRef, { order: newOrderBase - index });
    });
    
    await batch.commit();
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update artwork order:', error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}

export async function updateArtworkTitle(fileId: string, newTitle: string) {
  if (!fileId || !newTitle || !newTitle.trim()) {
    return { success: false, error: 'Invalid file ID or title.' };
  }
  
  try {
    const artworkRef = doc(artworksCollection, fileId);
    const trimmedTitle = newTitle.trim();
    await updateDoc(artworkRef, { title: trimmedTitle, alt: trimmedTitle });
    
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update artwork title:', error);
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

const defaultProfileData: ProfileData = {
    name: 'Thakur Yashraj Singh',
    description: 'An artist exploring the dance between light and shadow, capturing fleeting moments and emotions on canvas with a blend of classical techniques and modern expressionism.',
    instagram: 'https://www.instagram.com/yash_._100/',
    email: 't.yashraj.singh.710@gmail.com',
    profilePictureUrl: null,
    profilePictureFileId: null,
};

export async function getProfileData(): Promise<ProfileData> {
  const profileDocRef = doc(profileCollection, 'main');
  try {
    const docSnap = await getDoc(profileDocRef);
    if (docSnap.exists()) {
      // Basic validation to ensure data shape is correct
      const data = docSnap.data();
      const parsed = profileDataSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      }
    }
    // If doc doesn't exist or is malformed, create it with default data
    await setDoc(profileDocRef, defaultProfileData);
    return defaultProfileData;
  } catch (error) {
    console.error("Error fetching/creating profile data, returning defaults:", error);
    return defaultProfileData; // Return default data on error to prevent app crash
  }
}

export async function uploadProfilePicture(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  const profileDocRef = doc(profileCollection, 'main');

  try {
    // Delete the old profile picture if it exists
    const currentProfileData = await getProfileData();
    if (currentProfileData.profilePictureFileId) {
      await new Promise<void>((resolve) => {
        imagekit.deleteFile(currentProfileData.profilePictureFileId!, (error, result) => {
          if (error) {
            // Log the error but don't block the upload of the new picture
            console.error("Could not delete old profile picture:", error);
          }
          resolve(); // Always resolve to continue the process
        });
      });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `profile-${Date.now()}`,
      folder: '/artifolio/profile',
      useUniqueFileName: true,
      isPrivateFile: false,
    });

    await updateDoc(profileDocRef, {
        profilePictureUrl: uploadResponse.url,
        profilePictureFileId: uploadResponse.fileId,
    });

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

export async function updateProfileData(data: Omit<ProfileData, 'profilePictureUrl' | 'profilePictureFileId'>) {
  const profileDocRef = doc(profileCollection, 'main');
  try {
    const currentData = await getProfileData();
    const newData = { ...currentData, ...data };
    
    const validation = profileDataSchema.safeParse(newData);
    if (!validation.success) {
      return { success: false, error: validation.error.flatten().fieldErrors };
    }

    // Use setDoc to overwrite the document with the new validated data,
    // which mimics the behavior of the previous file-based storage.
    await setDoc(profileDocRef, validation.data);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update profile data:', error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}
