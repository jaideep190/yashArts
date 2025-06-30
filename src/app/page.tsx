import { promises as fs } from 'fs';
import path from 'path';
import Gallery from '@/components/gallery';
import type { ImageType } from '@/components/art-collage';
import EditableHeader from '@/components/editable-header';
import { getProfileData } from '@/app/actions';
import type { ProfileData } from '@/app/actions';


// Helper function to capitalize a string
function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}


async function getArtworks(): Promise<ImageType[]> {
  const sizeOf = require('image-size');
  const artDirectory = path.join(process.cwd(), 'public', 'artworks');
  try {
    const filenames = await fs.readdir(artDirectory);
    const imagePromises = filenames
      .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
      .map(async (name) => {
        const filePath = path.join(artDirectory, name);
        const dimensions = sizeOf(filePath);
        // Extract title from filename (e.g., '1678886400000-my-masterpiece.jpg' -> 'My masterpiece')
        const titleFromName = capitalize(
          name.replace(/^\d+-/, '').split('.').slice(0, -1).join('.').replace(/[-_]/g, ' ')
        );
        return {
          src: `/artworks/${name}`,
          width: dimensions.width ?? 500,
          height: dimensions.height ?? 500,
          alt: titleFromName,
          aiHint: 'uploaded art',
        };
      });
    const images = await Promise.all(imagePromises);
    // Sort by filename which includes timestamp, newest first
    return images.sort((a, b) => b.src.localeCompare(a.src));
  } catch (error) {
    // If the directory doesn't exist, it's not an error, just return empty.
    console.log("Artworks directory not found, returning empty array.");
    return [];
  }
}

async function getProfilePicture(): Promise<string> {
  const profilePicPath = path.join(process.cwd(), 'public', 'profile', 'profile.png');
  try {
    await fs.stat(profilePicPath);
    // Add a timestamp to bust server-side cache if any
    return `/profile/profile.png?t=${Date.now()}`;
  } catch (error) {
    // File doesn't exist, return placeholder
    return 'https://placehold.co/128x128.png';
  }
}


export default async function Home() {
  const uploadedImages = await getArtworks();
  const profilePictureSrc = await getProfilePicture();
  const profileData = await getProfileData();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <EditableHeader 
        initialProfilePictureSrc={profilePictureSrc}
        initialProfileData={profileData}
      />
      <main className="w-full">
         <Gallery initialImages={uploadedImages} />
      </main>
    </div>
  );
}
