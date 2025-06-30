'use client';

import * as React from 'react';
import Image from 'next/image';
import { FileQuestion } from 'lucide-react';
import ImageModal from './image-modal';

export type ImageType = {
  src: string;
  alt: string;
  width: number;
  height: number;
  aiHint?: string;
};

interface ArtCollageProps {
  images: ImageType[];
}

export default function ArtCollage({ images }: ArtCollageProps) {
  const [selectedImage, setSelectedImage] = React.useState<ImageType | null>(null);

  const openModal = (image: ImageType) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {images.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
            {images.map((image, index) => (
              <div
                key={image.src + index}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl cursor-pointer"
                onClick={() => openModal(image)}
                role="button"
                aria-label={`View larger image for ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="w-full h-auto transition-transform duration-300 ease-in-out group-hover:scale-105"
                  data-ai-hint={image.aiHint}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
              <FileQuestion className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Gallery is Empty</h3>
              <p>Click the upload button to add your first piece of art.</p>
          </div>
        )}
      </div>
      {selectedImage && <ImageModal image={selectedImage} onClose={closeModal} />}
    </>
  );
}
