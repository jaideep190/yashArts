import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import Gallery from '@/components/gallery';
import type { ImageType } from '@/components/art-collage';

async function getArtworks(): Promise<ImageType[]> {
  const sizeOf = require('image-size');
  const artDirectory = path.join(process.cwd(), 'public', 'artworks');
  try {
    const filenames = await fs.readdir(artDirectory);
    const imagePromises = filenames
      .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
      .map(async (name) => {
        const filePath = path.join(artDirectory, name);
        const dimensions = sizeOf(filePath);
        return {
          src: `/artworks/${name}`,
          width: dimensions.width ?? 500,
          height: dimensions.height ?? 500,
          alt: name.split('.').slice(0, -1).join(' ').replace(/[-_]/g, ' '),
          aiHint: 'uploaded art',
        };
      });
    const images = await Promise.all(imagePromises);
    // Sort by filename which includes timestamp, newest first
    return images.sort((a, b) => b.src.localeCompare(a.src));
  } catch (error) {
    // If the directory doesn't exist, it's not an error, just return empty.
    console.log("Artworks directory not found, returning empty array.");
    return [];
  }
}

const placeholderImages: ImageType[] = [
  { src: 'https://placehold.co/500x750.png', width: 500, height: 750, alt: 'A painting of a woman in a red dress', aiHint: 'woman painting' },
  { src: 'https://placehold.co/600x400.png', width: 600, height: 400, alt: 'A coastal scene with a lighthouse', aiHint: 'coast lighthouse' },
  { src: 'https://placehold.co/400x500.png', width: 400, height: 500, alt: 'Still life of a vase with flowers', aiHint: 'flower vase' },
  { src: 'https://placehold.co/500x600.png', width: 500, height: 600, alt: 'Abstract cityscape at night', aiHint: 'abstract cityscape' },
  { src: 'https://placehold.co/450x650.png', width: 450, height: 650, alt: 'A portrait of an old man with a beard', aiHint: 'man portrait' },
  { src: 'https://placehold.co/800x500.png', width: 800, height: 500, alt: 'A wide landscape of a mountain range', aiHint: 'mountain landscape' },
  { src: 'https://placehold.co/500x500.png', width: 500, height: 500, alt: 'A close-up of a tiger\'s face', aiHint: 'tiger face' },
  { src: 'https://placehold.co/400x700.png', width: 400, height: 700, alt: 'A surreal image of a floating island', aiHint: 'surreal island' },
  { src: 'https://placehold.co/650x450.png', width: 650, height: 450, alt: 'A busy market scene in Morocco', aiHint: 'morocco market' },
  { src: 'https://placehold.co/500x800.png', width: 500, height: 800, alt: 'A tall, slender sculpture', aiHint: 'slender sculpture' },
  { src: 'https://placehold.co/600x600.png', width: 600, height: 600, alt: 'A geometric pattern in black and white', aiHint: 'geometric pattern' },
  { src: 'https://placehold.co/700x400.png', width: 700, height: 400, alt: 'A panoramic view of a forest in autumn', aiHint: 'autumn forest' },
  { src: 'https://placehold.co/400x600.png', width: 400, height: 600, alt: 'A dancer in mid-motion', aiHint: 'dancer motion' },
  { src: 'https://placehold.co/550x450.png', width: 550, height: 450, alt: 'A peaceful zen garden', aiHint: 'zen garden' },
  { src: 'https://placehold.co/500x700.png', width: 500, height: 700, alt: 'A study of a horse in charcoal', aiHint: 'horse charcoal' },
  { src: 'https://placehold.co/800x600.png', width: 800, height: 600, alt: 'A dramatic sky with storm clouds', aiHint: 'storm clouds' },
  { src: 'https://placehold.co/450x550.png', width: 450, height: 550, alt: 'A whimsical illustration of a cat reading a book', aiHint: 'cat reading' },
  { src: 'https://placehold.co/600x500.png', width: 600, height: 500, alt: 'An impressionist painting of a cafe', aiHint: 'impressionist cafe' },
  { src: 'https://placehold.co/500x900.png', width: 500, height: 900, alt: 'A very tall, narrow abstract painting', aiHint: 'narrow abstract' },
  { src: 'https://placehold.co/700x500.png', width: 700, height: 500, alt: 'A photorealistic drawing of an eye', aiHint: 'eye drawing' },
];

export default async function Home() {
  const uploadedImages = await getArtworks();
  const allImages = [...uploadedImages, ...placeholderImages];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <header className="flex w-full flex-col items-center gap-4 pt-12 md:pt-20 text-center px-4">
        <Image
          src="https://placehold.co/128x128.png"
          alt="A stylized portrait of the artist, Amelia Sinclair"
          width={128}
          height={128}
          priority
          className="rounded-full object-cover border-4 border-card shadow-lg"
          data-ai-hint="artist portrait"
        />
        <h1 className="font-headline text-4xl md:text-6xl tracking-wider">Thakur Yashraj Singh</h1>
        <p className="font-body text-base md:text-lg max-w-xl text-muted-foreground">
          An artist exploring the dance between light and shadow, capturing fleeting moments and emotions on canvas with a blend of classical techniques and modern expressionism.
        </p>
      </header>
      <main className="w-full">
         <Gallery initialImages={allImages} />
      </main>
    </div>
  );
}
