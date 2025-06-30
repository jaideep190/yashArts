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

const SECRET_KEY = 'yasharts-secret';

export default function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const [secretKey, setSecretKey] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const resetDialog = () => {
    setSecretKey('');
    setFile(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (secretKey !== SECRET_KEY) {
      toast({ title: 'Error', description: 'Invalid secret key.', variant: 'destructive' });
      return;
    }
    
    if (!file) {
      toast({ title: 'Error', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadArtwork(formData);

    setIsUploading(false);

    if (result.success) {
      onUploadComplete({
        src: result.path!,
        width: result.width!,
        height: result.height!,
        alt: file.name.split('.').slice(0, -1).join('.'),
        aiHint: 'uploaded art',
      });
      toast({ title: 'Success', description: 'Your artwork has been uploaded.' });
      onOpenChange(false); // Close the dialog on success
    } else {
      toast({ title: 'Upload Failed', description: result.error, variant: 'destructive' });
    }
  };
  
  // This function ensures the dialog state is reset whenever it's closed.
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
            Enter your secret key and choose a file to add to your gallery. Note: Uploads only persist in local development.
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
            <Input ref={fileInputRef} id="picture" type="file" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
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
