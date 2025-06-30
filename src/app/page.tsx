import Gallery from '@/components/gallery';
import EditableHeader from '@/components/editable-header';
import { getProfileData, getArtworks } from '@/app/actions';

export default async function Home() {
  const uploadedImages = await getArtworks();
  const profileData = await getProfileData();
  const profilePictureSrc = profileData.profilePictureUrl || 'https://placehold.co/128x128.png';

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
