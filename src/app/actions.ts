'use server';

import { Storage } from '@google-cloud/storage';
import { Buffer } from 'buffer';

const storage = new Storage({
  projectId: 'yasharts-50805',
});

const bucket = storage.bucket('yasharts-50805.appspot.com');

// In a real production app, this should be stored securely as an environment variable.
const SECRET_KEY = 'yasharts-secret';

export async function uploadArtwork(formData: FormData) {
  const file = formData.get('file') as File | null;
  const secretKey = formData.get('secretKey') as string | null;

  if (secretKey !== SECRET_KEY) {
    return { success: false, error: 'Invalid secret key.' };
  }

  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const destFileName = `artworks/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const gcsFile = bucket.file(destFileName);

    await gcsFile.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    await gcsFile.makePublic();
    
    const downloadURL = gcsFile.publicUrl();

    return { success: true, downloadURL };
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    return { success: false, error: 'Upload failed. Please try again.' };
  }
}
