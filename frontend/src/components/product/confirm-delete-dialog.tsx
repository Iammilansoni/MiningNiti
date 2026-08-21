'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface ConfirmDeleteDialogProps {
  /** The name of the thing being deleted; `null` keeps the dialog closed. */
  target: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

/**
 * Destructive-action confirmation.
 *
 * Deletes across the app used the browser's native `confirm()`, which is
 * unstyled, blocks the main thread, is suppressible by the browser, and cannot
 * be tested or themed. This wraps the existing shadcn AlertDialog (Radix), so
 * confirmation is focus-trapped, Escape-dismissible and consistent everywhere.
 */
export function ConfirmDeleteDialog({
  target,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={target !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? `Delete "${target}"?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? 'This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }))}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
