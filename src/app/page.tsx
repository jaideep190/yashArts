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

export default async function Home() {
  const uploadedImages = await getArtworks();

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
         <Gallery initialImages={uploadedImages} />
      </main>
    </div>
  );
}
