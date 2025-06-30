'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArtCollage from '@/components/art-collage';
import type { ImageType } from '@/components/art-collage';
import UploadDialog from '@/components/upload-dialog';
import { Button } from '@/components/ui/button';
import { FilePlus2, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface GalleryProps {
  initialImages: ImageType[];
}

export default function Gallery({ initialImages }: GalleryProps) {
  const [images, setImages] = useState<ImageType[]>(initialImages);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleUploadComplete = (newImage: ImageType) => {
    setImages(prevImages => [newImage, ...prevImages]);
  };

  const handleDeleteComplete = (src: string) => {
    setImages(prevImages => prevImages.filter(image => image.src !== src));
  };

  return (
    <>
      <ArtCollage images={images} onDelete={handleDeleteComplete} />

      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        {user ? (
          <>
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              className="h-14 w-14 rounded-full shadow-lg"
              size="icon"
              aria-label="Upload Artwork"
            >
              <FilePlus2 className="h-6 w-6" />
            </Button>
            <Button
              onClick={logout}
              variant="secondary"
              className="h-14 w-14 rounded-full shadow-lg"
              size="icon"
              aria-label="Log Out"
            >
              <LogOut className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <Link href="/login" passHref>
            <Button
              className="h-14 w-14 rounded-full shadow-lg"
              size="icon"
              aria-label="Log In"
            >
              <LogIn className="h-6 w-6" />
            </Button>
          </Link>
        )}
      </div>

      {user && (
        <UploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
}
