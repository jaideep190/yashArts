import Image from 'next/image';

type ImageType = {
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
      <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-auto w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              data-ai-hint={image.aiHint}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
