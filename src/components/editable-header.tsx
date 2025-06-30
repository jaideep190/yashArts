'use client';

import * as React from 'react';
import Image from 'next/image';
import { IKImage } from 'imagekitio-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Pencil, Instagram, Mail, Edit } from 'lucide-react';
import UploadProfileDialog from './upload-profile-dialog';
import EditProfileDialog from './edit-profile-dialog';
import type { ImageType } from './art-collage';
import type { ProfileData } from '@/app/actions';

interface EditableHeaderProps {
    initialProfilePictureSrc: string;
    initialProfileData: ProfileData;
}

export default function EditableHeader({ initialProfilePictureSrc, initialProfileData }: EditableHeaderProps) {
    const [profilePic, setProfilePic] = React.useState(initialProfilePictureSrc);
    const [profileData, setProfileData] = React.useState(initialProfileData);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const { user } = useAuth();

    const handleUploadComplete = (newImage: ImageType) => {
        // Add a timestamp to break cache
        setProfilePic(`${newImage.src}?t=${new Date().getTime()}`);
    };

    React.useEffect(() => {
        setProfilePic(initialProfilePictureSrc);
    }, [initialProfilePictureSrc]);

    React.useEffect(() => {
        setProfileData(initialProfileData);
    }, [initialProfileData]);

    const isPlaceholder = profilePic.includes('placehold.co');

    return (
        <>
            <header className="relative w-full flex flex-col items-center gap-4 pt-12 md:pt-20 text-center px-4">
                 {user && (
                    <div className="absolute top-4 right-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(true)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                )}
                <div className="relative group">
                    {isPlaceholder ? (
                        <Image
                            src={profilePic}
                            alt={`Profile picture of ${profileData.name}`}
                            width={128}
                            height={128}
                            priority
                            key={profilePic}
                            className="rounded-full object-cover border-4 border-card shadow-lg"
                            data-ai-hint="artist portrait"
                        />
                    ) : (
                        <IKImage
                            src={profilePic}
                            alt={`Profile picture of ${profileData.name}`}
                            width={128}
                            height={128}
                            key={profilePic}
                            className="rounded-full object-cover border-4 border-card shadow-lg"
                            lqip={{ active: true }}
                        />
                    )}
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

                <h1 className="font-headline text-4xl md:text-6xl tracking-wider">{profileData.name}</h1>
                <p className="font-body text-base md:text-lg max-w-xl text-muted-foreground">
                    {profileData.description}
                </p>

                <div className="flex items-center justify-center gap-4 pt-2">
                    {profileData.instagram && (
                        <Button asChild variant="outline" className="rounded-full px-4 transition-all hover:shadow-md hover:-translate-y-1">
                            <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram profile">
                                <Instagram />
                                <span>Instagram</span>
                            </a>
                        </Button>
                    )}
                    {profileData.email && (
                         <Button asChild variant="outline" className="rounded-full px-4 transition-all hover:shadow-md hover:-translate-y-1">
                            <a href={`mailto:${profileData.email}`} aria-label="Send an email">
                                <Mail />
                                <span>Email</span>
                            </a>
                        </Button>
                    )}
                </div>
            </header>

            {user && (
                <>
                    <UploadProfileDialog
                        open={isUploadDialogOpen}
                        onOpenChange={setIsUploadDialogOpen}
                        onUploadComplete={handleUploadComplete}
                    />
                     <EditProfileDialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                        profileData={profileData}
                    />
                </>
            )}
        </>
    );
}
