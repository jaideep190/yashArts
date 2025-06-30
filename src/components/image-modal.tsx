'use client';

import * as React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { ImageType } from './art-collage';

interface ImageModalProps {
  image: ImageType;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300 animate-in fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div className="relative w-auto h-auto max-w-full max-h-full">
        <h2 id="image-modal-title" className="sr-only">{image.alt}</h2>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="object-contain block rounded-lg shadow-2xl"
          style={{ maxHeight: '90vh', maxWidth: '90vw' }}
        />
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close image view"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}
