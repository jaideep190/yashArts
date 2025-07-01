import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { ImageKitProvider } from '@/components/imagekit-provider';
import ParticleBackground from '@/components/particle-background';

const siteUrl = 'https://yasharts-portfolio.vercel.app';
const previewImageUrl = 'https://ik.imagekit.io/jaideep190/uploads/preview.png';

export const metadata: Metadata = {
  title: 'YashArts',
  description: 'Blend of classical techniques and modern expressionism.',
  openGraph: {
    title: 'YashArts',
    description: 'Blend of classical techniques and modern expressionism.',
    url: siteUrl,
    siteName: 'YashArts',
    images: [
      {
        url: previewImageUrl,
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
    description: 'Blend of classical techniques and modern expressionism.',
    images: [previewImageUrl],
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
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya&family=Belleza&display=swap"
          rel="stylesheet"
        />
        {/* OG & Twitter meta tags */}
        <meta property="og:title" content="YashArts" />
        <meta property="og:description" content="Blend of classical techniques and modern expressionism." />
        <meta property="og:image" content="https://ik.imagekit.io/jaideep190/uploads/preview.png" />
        <meta property="og:url" content="https://yasharts-portfolio.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="YashArts" />
        <meta name="twitter:description" content="Blend of classical techniques and modern expressionism." />
        <meta name="twitter:image" content="https://ik.imagekit.io/jaideep190/uploads/preview.png" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ParticleBackground />
        <AuthProvider>
          <ImageKitProvider>{children}</ImageKitProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
