import Image from 'next/image';
import { FileQuestion } from 'lucide-react';

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
  return (
    <div className="container mx-auto px-4 py-8">
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.src + index}
              className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl"
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
  );
}
