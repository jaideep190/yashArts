'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { ImageType } from '@/components/art-collage';
import { uploadArtwork } from '@/app/actions';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (image: ImageType) => void;
}

export default function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setTitle('');
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'Error', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }
    if (!title.trim()) {
      toast({ title: 'Error', description: 'Please enter a title for the artwork.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    try {
      const result = await uploadArtwork(formData);

      if (result.success) {
        onUploadComplete({
          src: result.path!,
          width: result.width!,
          height: result.height!,
          alt: title,
          aiHint: 'uploaded art',
        });
        toast({ title: 'Success', description: 'Your artwork has been uploaded.' });
        onOpenChange(false);
      } else {
        toast({ title: 'Upload Failed', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Upload failed on client:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
        setIsUploading(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetDialog();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Artwork</DialogTitle>
          <DialogDescription>
            Choose a file and give it a title to add to your gallery.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              type="text" 
              placeholder="e.g., Sunset Over the Lake"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading} 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Picture</Label>
            <Input ref={fileInputRef} id="picture" type="file" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={isUploading || !file || !title.trim()}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
