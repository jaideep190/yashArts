import Image from 'next/image';
import ArtCollage from '@/components/art-collage';

const images = [
  { src: 'https://placehold.co/400x600.png', width: 400, height: 600, alt: 'Abstract painting in vibrant colors', aiHint: 'abstract painting' },
  { src: 'https://placehold.co/600x450.png', width: 600, height: 450, alt: 'Serene landscape with a lake', aiHint: 'landscape painting' },
  { src: 'https://placehold.co/500x500.png', width: 500, height: 500, alt: 'Still life of fruits on a table', aiHint: 'still life' },
  { src: 'https://placehold.co/400x700.png', width: 400, height: 700, alt: 'Portrait of a woman in contemplation', aiHint: 'portrait painting' },
  { src: 'https://placehold.co/800x500.png', width: 800, height: 500, alt: 'Impressionist depiction of a city street', aiHint: 'impressionist art' },
  { src: 'https://placehold.co/550x750.png', width: 550, height: 750, alt: 'Surreal dreamscape with floating objects', aiHint: 'surreal painting' },
  { src: 'https://placehold.co/650x500.png', width: 650, height: 500, alt: 'A charcoal sketch of a dancer', aiHint: 'charcoal sketch' },
];

export default function Home() {
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
        <h1 className="font-headline text-4xl md:text-6xl tracking-wider">Amelia Sinclair</h1>
        <p className="font-body text-base md:text-lg max-w-xl text-muted-foreground">
          An artist exploring the dance between light and shadow, capturing fleeting moments and emotions on canvas with a blend of classical techniques and modern expressionism.
        </p>
      </header>
      <main className="w-full">
         <ArtCollage images={images} />
      </main>
    </div>
  );
}
