'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/components/product/format';
import { cn } from '@/lib/utils';

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void;
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
}

export function DragDropUpload({
  onFilesSelected,
  onUpload,
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'text/plain': ['.txt'],
  },
  maxFiles = 10,
  maxSize = 16 * 1024 * 1024,
  disabled = false,
}: DragDropUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          toast.error(`Could not add ${file.name}`, {
            description:
              error.code === 'file-too-large'
                ? `Maximum file size is ${formatFileSize(maxSize)}.`
                : error.message,
          });
        });
      });

      if (acceptedFiles.length === 0) return;

      const nextFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
      setSelectedFiles(nextFiles);
      onFilesSelected(nextFiles);
    },
    [maxFiles, maxSize, onFilesSelected, selectedFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled: disabled || uploading,
    multiple: true,
  });

  const removeFile = (index: number) => {
    const nextFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    setSelectedFiles(nextFiles);
    onFilesSelected(nextFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      onFilesSelected([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border border-dashed bg-muted/25 p-8 text-center transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'hover:bg-muted/45',
          (disabled || uploading) && 'cursor-not-allowed opacity-60'
        )}
      >
        <input {...getInputProps()} />
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="flex size-11 items-center justify-center rounded-lg border bg-background text-primary">
            <UploadCloud className="size-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-foreground">
            {isDragActive ? 'Drop documents to upload' : 'Upload mining documents'}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Drag files here or browse from your device. Supports PDF, DOC, DOCX, and TXT up to {formatFileSize(maxSize)} each.
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="rounded-lg border bg-background">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Selected files</p>
              <p className="text-xs text-muted-foreground">{selectedFiles.length} document{selectedFiles.length === 1 ? '' : 's'} ready</p>
            </div>
            <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
              {uploading ? 'Uploading' : 'Upload all'}
            </Button>
          </div>
          <div className="divide-y">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-4">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Badge variant="secondary" className="uppercase">
                  {file.name.split('.').pop() || 'file'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
