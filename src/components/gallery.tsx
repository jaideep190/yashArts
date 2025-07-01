'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArtCollage from '@/components/art-collage';
import type { ImageType } from '@/components/art-collage';
import UploadDialog from '@/components/upload-dialog';
import { Button } from '@/components/ui/button';
import { FilePlus2, LogIn, LogOut, Edit, Check } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { updateArtworkOrder } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ImageModal from '@/components/image-modal';
import { Separator } from '@/components/ui/separator';
import { IKImage } from 'imagekitio-react';

interface GalleryProps {
  initialImages: ImageType[];
}

export default function Gallery({ initialImages }: GalleryProps) {
  const [images, setImages] = useState<ImageType[]>(initialImages);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const pinnedImages = images.filter(image => image.pinned);
  const regularImages = images.filter(image => !image.pinned);

  const handleUploadComplete = (newImage: ImageType) => {
    setImages(prevImages => [newImage, ...prevImages]);
  };

  const handleDeleteComplete = (fileId: string) => {
    setImages(prevImages => prevImages.filter(image => image.fileId !== fileId));
    if (selectedImage?.fileId === fileId) {
      setSelectedImage(null);
    }
  };

  const handleUpdateComplete = (updatedImage: ImageType) => {
    setImages(prevImages => {
      const newImages = prevImages.map(image =>
        image.fileId === updatedImage.fileId ? updatedImage : image
      );
      
      newImages.sort((a, b) => {
        const aIsPinned = a.pinned ?? false;
        const bIsPinned = b.pinned ?? false;
        if (aIsPinned !== bIsPinned) {
          return aIsPinned ? -1 : 1;
        }
        return (b.order ?? 0) - (a.order ?? 0);
      });
      
      return newImages;
    });

    if (selectedImage?.fileId === updatedImage.fileId) {
      setSelectedImage(updatedImage);
    }
  };

  const handleOrderChange = async (newRegularImages: ImageType[]) => {
    const originalImagesState = images;
    // Optimistically update the UI
    const updatedFullList = [...pinnedImages, ...newRegularImages];
    setImages(updatedFullList);

    // Persist the changes to the server
    const result = await updateArtworkOrder(updatedFullList);
    if (!result.success) {
      toast({
        title: 'Error Saving Order',
        description: result.error,
        variant: 'destructive',
      });
      // Revert to the original order if save fails
      setImages(originalImagesState); 
    }
  };
  
  const openModal = (image: ImageType) => {
    if (isEditMode && !image.pinned) return;
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {pinnedImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-headline tracking-wider mb-6">Pinned Artwork</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pinnedImages.map((image) => (
                <div
                  key={image.fileId}
                  className="group relative break-inside-avoid overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl cursor-pointer will-change-transform"
                  onClick={() => openModal(image)}
                  role="button"
                  aria-label={`View larger image for ${image.alt}`}
                >
                  <IKImage
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="w-full h-auto object-cover aspect-square transition-transform duration-300 ease-in-out group-hover:scale-105"
                    lqip={{ active: true }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <Separator className="mt-12" />
          </div>
        )}
        
        <ArtCollage 
          images={regularImages} 
          onOrderChange={handleOrderChange}
          isEditMode={isEditMode}
          onImageClick={openModal}
        />
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        {user ? (
          <>
            <Button
              onClick={() => setIsEditMode(prev => !prev)}
              variant={isEditMode ? 'default' : 'secondary'}
              className="h-14 w-14 rounded-full shadow-lg"
              size="icon"
              aria-label={isEditMode ? 'Finish editing order' : 'Edit order'}
            >
              {isEditMode ? <Check className="h-6 w-6" /> : <Edit className="h-6 w-6" />}
            </Button>
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
      
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={closeModal}
          onDelete={handleDeleteComplete}
          onUpdate={handleUpdateComplete}
        />
      )}
    </>
  );
}
