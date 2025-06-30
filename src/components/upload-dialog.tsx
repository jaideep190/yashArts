'use client';

import { useState } from 'react';
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
  const [secretKey, setSecretKey] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetState = () => {
      setSecretKey('');
      setFile(null);
      setIsUploading(false);
      onOpenChange(false);
  }

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'Error', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      // 1. Get image dimensions on the client
      const { width, height } = await new Promise<{width: number, height: number}>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
          };
          img.onerror = reject;
          if (e.target?.result) {
            img.src = e.target.result as string;
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.readAsDataURL(file);
      });

      // 2. Prepare form data for Server Action
      const formData = new FormData();
      formData.append('file', file);
      formData.append('secretKey', secretKey);

      // 3. Call server action
      const result = await uploadArtwork(formData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 4. Call parent handler with the new image details
      onUploadComplete({
        src: result.downloadURL,
        width,
        height,
        alt: file.name.split('.').slice(0, -1).join('.'), // Use filename as alt text
        aiHint: 'uploaded art',
      });

      toast({ title: 'Success', description: 'Your artwork has been uploaded.' });
      resetState();

    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({ title: 'Upload Failed', description: error.message || 'Something went wrong. Please try again.', variant: 'destructive' });
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Artwork</DialogTitle>
          <DialogDescription>
            Enter your secret key and choose a file to add to your gallery.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="secret-key">Secret Key</Label>
            <Input
              id="secret-key"
              type="password"
              placeholder="Your secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Picture</Label>
            <Input id="picture" type="file" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={isUploading || !file || !secretKey}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
