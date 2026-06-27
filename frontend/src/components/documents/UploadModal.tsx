'use client';

import { useState } from 'react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const token = await getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.detail || err.error || `Upload failed (${response.status})`);
        }

        toast.success(`${file.name} uploaded successfully!`);
      } catch (error: any) {
        console.error('Upload failed:', error);
        toast.error(error.message || 'Upload failed. Please try again.');
      }
    }

    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
    queryClient.invalidateQueries({ queryKey: ['document-analytics'] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload compliance or safety documents. They will be automatically parsed and analyzed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <DragDropUpload 
            onFilesSelected={() => {}} 
            onUpload={handleUpload}
            maxFiles={5}
            accept={{
              'application/pdf': ['.pdf'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'text/plain': ['.txt'],
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
