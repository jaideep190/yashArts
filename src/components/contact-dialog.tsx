'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Instagram, Mail, Phone, Copy } from 'lucide-react';
import type { ProfileData } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: ProfileData;
}

export default function ContactDialog({
  open,
  onOpenChange,
  profileData,
}: ContactDialogProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: `${label} copied.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Me</DialogTitle>
          <DialogDescription>
            Feel free to reach out for projects or inquiries.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {profileData.instagram && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Instagram</span>
              </div>
              <Button asChild variant="outline" size="sm">
                <a
                  href={profileData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Profile
                </a>
              </Button>
            </div>
          )}
          {profileData.email && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <Mail className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium">
                  {profileData.email}
                </span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`mailto:${profileData.email}`}>Send Email</a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => copyToClipboard(profileData.email, 'Email')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {profileData.phoneNumber && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {profileData.phoneNumber}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  copyToClipboard(profileData.phoneNumber!, 'Phone Number')
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
