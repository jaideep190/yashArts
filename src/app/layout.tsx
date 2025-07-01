import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { ImageKitProvider } from '@/components/imagekit-provider';
import ParticleBackground from '@/components/particle-background';

const siteUrl = 'https://yasharts-portfolio.vercel.app';

export const metadata: Metadata = {
  title: 'YashArts',
  description: 'An elegant portfolio for artists, showcasing a blend of classical techniques and modern expressionism.',
  openGraph: {
    title: 'YashArts',
    description: 'An elegant portfolio for artists, showcasing a blend of classical techniques and modern expressionism.',
    url: siteUrl,
    siteName: 'YashArts',
    images: [
      {
        url: `${siteUrl}/profile/preview.png`,
        width: 1200,
        height: 630,
        alt: 'A preview of the YashArts portfolio website.',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YashArts',
    description: 'An elegant portfolio for artists, showcasing a blend of classical techniques and modern expressionism.',
    images: [`${siteUrl}/profile/preview.png`],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ParticleBackground />
        <AuthProvider>
          <ImageKitProvider>
            {children}
          </ImageKitProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
