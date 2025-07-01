'use client';

import * as React from 'react';
import { IKImage } from 'imagekitio-react';
import { X, Trash2, Loader2, Pencil, Check } from 'lucide-react';
import type { ImageType } from './art-collage';
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteArtwork, updateArtworkTitle } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
  image: ImageType;
  onClose: () => void;
  onDelete: (fileId: string) => void;
  onUpdate: (image: ImageType) => void;
}

export default function ImageModal({ image, onClose, onDelete, onUpdate }: ImageModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(image?.title || '');
  const [isSavingTitle, setIsSavingTitle] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditingTitle) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, isEditingTitle]);

  React.useEffect(() => {
    if (image) {
      setNewTitle(image.title || '');
      setIsEditingTitle(false);
    }
  }, [image]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const result = await deleteArtwork(image.fileId);
      if (result.success) {
        toast({ title: 'Success', description: 'Artwork has been deleted.' });
        onDelete(image.fileId);
        onClose();
      } else {
        toast({ title: 'Deletion Failed', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsAlertOpen(false);
      setIsDeleting(false);
    }
  };

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast({ title: 'Error', description: 'Title cannot be empty.', variant: 'destructive' });
      return;
    }
    if (newTitle.trim() === image.title) {
        setIsEditingTitle(false);
        return;
    }

    setIsSavingTitle(true);
    const result = await updateArtworkTitle(image.fileId, newTitle.trim());
    if (result.success) {
      toast({ title: 'Success', description: 'Artwork title has been updated.' });
      onUpdate({ ...image, title: newTitle.trim(), alt: newTitle.trim() });
      setIsEditingTitle(false);
    } else {
      toast({ title: 'Update Failed', description: result.error, variant: 'destructive' });
    }
    setIsSavingTitle(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-300 animate-in fade-in"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-modal-title"
      >
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative text-center text-white drop-shadow-lg w-full max-w-sm md:max-w-md lg:max-w-xl">
                {user && isEditingTitle ? (
                    <form onSubmit={handleSaveTitle} className="flex w-full items-center justify-center gap-2">
                        <Input
                            id="image-modal-title-input"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="h-auto flex-grow bg-black/50 p-2 text-3xl font-headline text-white ring-offset-black/50 focus-visible:ring-white md:text-4xl"
                            autoFocus
                            disabled={isSavingTitle}
                        />
                        <Button type="submit" size="icon" disabled={isSavingTitle} className="shrink-0">
                            {isSavingTitle ? <Loader2 className="animate-spin" /> : <Check />}
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setIsEditingTitle(false)} disabled={isSavingTitle} className="shrink-0">
                            <X className="h-6 w-6" />
                        </Button>
                    </form>
                ) : (
                    <div className="group flex items-center justify-center gap-3 py-4">
                        <h2 id="image-modal-title" className="font-headline text-3xl md:text-4xl">
                            {image?.title || image?.alt}
                        </h2>
                        {user && (
                        <button
                            onClick={() => setIsEditingTitle(true)}
                            className="rounded-full p-2 opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100"
                            aria-label="Edit title"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                        )}
                    </div>
                )}
            </div>
            <div className="relative">
                <IKImage
                    src={image.src}
                    alt={image.alt}
                    className="object-contain block rounded-lg shadow-2xl"
                    style={{ maxHeight: '75vh', maxWidth: '90vw' }}
                    lqip={{ active: true }}
                />
            </div>
        </div>
        
        {user && (
          <button
            onClick={() => setIsAlertOpen(true)}
            disabled={isDeleting}
            className="absolute top-4 right-16 text-white bg-black/50 rounded-full p-2 hover:bg-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete image"
          >
            <Trash2 className="h-6 w-6" />
          </button>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close image view"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this artwork from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
