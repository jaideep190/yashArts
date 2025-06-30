import { promises as fs } from 'fs';
import path from 'path';
import Gallery from '@/components/gallery';
import EditableHeader from '@/components/editable-header';
import { getProfileData, getArtworks } from '@/app/actions';

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
