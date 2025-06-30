import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    <div className="w-full max-w-full overflow-x-auto horizontal-scrollbar mt-8 pb-8">
      <div className="flex items-start gap-6 md:gap-10 px-6 md:px-10 py-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative shrink-0 transition-all duration-300 ease-in-out hover:scale-105 hover:z-10"
            style={{
              height: '55vh',
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-full w-auto rounded-xl bg-muted object-cover shadow-xl"
              data-ai-hint={image.aiHint}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
