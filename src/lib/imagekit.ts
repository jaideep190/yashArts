import ImageKit from "imagekit";

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    // In a real app, you'd want to handle this more gracefully.
    // For this context, we'll log an error. In a deployed environment, this might cause a crash
    // which is often desirable for unrecoverable configuration errors.
    console.error("ImageKit environment variables are not fully set.");
}

export const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});
