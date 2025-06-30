'use client';

import * as React from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import UploadProfileDialog from './upload-profile-dialog';
import type { ImageType } from './art-collage';

interface EditableHeaderProps {
    initialProfilePictureSrc: string;
}

export default function EditableHeader({ initialProfilePictureSrc }: EditableHeaderProps) {
    const [profilePic, setProfilePic] = React.useState(initialProfilePictureSrc);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
    const { user } = useAuth();

    const handleUploadComplete = (newImage: ImageType) => {
        // Add a timestamp to the new image src to bust the browser cache
        setProfilePic(`${newImage.src}?t=${new Date().getTime()}`);
    };

    // This effect ensures that if the server-provided prop changes (e.g., on revalidation), the state updates.
    React.useEffect(() => {
        setProfilePic(initialProfilePictureSrc);
    }, [initialProfilePictureSrc]);

    return (
        <>
            <header className="flex w-full flex-col items-center gap-4 pt-12 md:pt-20 text-center px-4">
                <div className="relative group">
                    <Image
                        src={profilePic}
                        alt="Profile picture of Thakur Yashraj Singh"
                        width={128}
                        height={128}
                        priority
                        key={profilePic} // Use a key to force re-render when src changes
                        className="rounded-full object-cover border-4 border-card shadow-lg"
                        data-ai-hint="artist portrait"
                    />
                    {user && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                            onClick={() => setIsUploadDialogOpen(true)}
                            aria-label="Edit profile picture"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <h1 className="font-headline text-4xl md:text-6xl tracking-wider">Thakur Yashraj Singh</h1>
                <p className="font-body text-base md:text-lg max-w-xl text-muted-foreground">
                    An artist exploring the dance between light and shadow, capturing fleeting moments and emotions on canvas with a blend of classical techniques and modern expressionism.
                </p>
            </header>

            {user && (
                <UploadProfileDialog
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                    onUploadComplete={handleUploadComplete}
                />
            )}
        </>
    );
}
