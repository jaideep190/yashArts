'use client';

import { IKContext } from 'imagekitio-react';

export function ImageKitProvider({ children }: { children: React.ReactNode }) {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !urlEndpoint) {
    console.error("ImageKit public key or URL endpoint is not defined in client environment variables.");
    // Render children without context, so it doesn't break the whole app
    return <>{children}</>;
  }

  return (
    <IKContext urlEndpoint={urlEndpoint} publicKey={publicKey} transformationPosition="path">
      {children}
    </IKContext>
  );
}
