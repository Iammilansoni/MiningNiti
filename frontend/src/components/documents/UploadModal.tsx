'use client';

import { useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { createDocument } from '@/lib/api';
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

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { startUpload } = useUploadThing('miningDocsUploader');

  const handleUpload = async (files: File[]) => {
    try {
      // 1. Upload files to UploadThing
      const uploadedFiles = await startUpload(files);
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('No files were returned from UploadThing');
      }

      // 2. For each uploaded file, create a document in the backend database
      for (const file of uploadedFiles) {
        const originalFile = files.find(f => f.name === file.name);
        if (!originalFile) continue;

        await createDocument({
          file_url: file.url,
          file_name: file.name,
          file_size: file.size,
          file_type: originalFile.type || 'application/octet-stream',
          title: file.name.split('.').slice(0, -1).join('.') || file.name,
          tags: ['Upload'],
        }, getToken);
      }

      toast.success(`${files.length} document(s) uploaded successfully!`);
      
      // 3. Invalidate React Query to refresh lists
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-analytics'] });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
      throw error; // Re-throw so DragDropUpload knows it failed
    }
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
