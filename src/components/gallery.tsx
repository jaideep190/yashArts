'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IKImage } from 'imagekitio-react';
import ArtCollage from '@/components/art-collage';
import type { ImageType } from '@/components/art-collage';
import UploadDialog from '@/components/upload-dialog';
import { Button } from '@/components/ui/button';
import { FilePlus2, LogIn, LogOut, Edit, Check, Pin, FileQuestion } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { updateArtworkOrder } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ImageModal from '@/components/image-modal';
import { cn } from '@/lib/utils';

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
    const pinnedImages = originalImagesState.filter(img => img.pinned);
    
    const updatedFullList = [...pinnedImages, ...newRegularImages];
    setImages(updatedFullList);

    const result = await updateArtworkOrder(updatedFullList);
    if (!result.success) {
      toast({
        title: 'Error Saving Order',
        description: result.error,
        variant: 'destructive',
      });
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

  const pinnedImages = images.filter(img => img.pinned);
  const regularImages = images.filter(img => !img.pinned);

  const galleryContent = () => {
    if (images.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <FileQuestion className="h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Gallery is Empty</h3>
            <p>Click the upload button to add your first piece of art.</p>
        </div>
      );
    }

    return (
      <>
        {pinnedImages.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {pinnedImages.map(image => (
                <div
                  key={image.fileId}
                  onClick={() => openModal(image)}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background transition-all duration-300 ease-in-out hover:shadow-2xl will-change-transform"
                  role="button"
                  aria-label={image.alt}
                >
                  <IKImage
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    lqip={{ active: true }}
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 rounded-full bg-primary/80 p-1.5 text-primary-foreground shadow-md backdrop-blur-sm">
                    <Pin className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
            {regularImages.length > 0 && <div className="my-8 h-px w-full bg-border" />}
          </div>
        )}
        <ArtCollage 
          images={regularImages} 
          onOrderChange={handleOrderChange}
          isEditMode={isEditMode}
          onImageClick={openModal}
        />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {galleryContent()}
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
