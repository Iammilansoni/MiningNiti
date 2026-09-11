'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPrompt, updatePrompt, CustomPrompt } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface PromptFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the modal edits this prompt instead of creating a new one. */
  prompt?: CustomPrompt | null;
}

const EMPTY_FORM = { name: '', description: '', category: 'General', prompt: '' };

export function PromptFormModal({ open, onOpenChange, prompt }: PromptFormModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = Boolean(prompt);

  const [form, setForm] = useState(EMPTY_FORM);

  // Re-seed the form whenever a different prompt is opened for editing,
  // and reset to blank when opening in create mode.
  useEffect(() => {
    if (open) {
      setForm(
        prompt
          ? {
              name: prompt.name,
              description: prompt.description || '',
              category: prompt.category || 'General',
              prompt: prompt.prompt,
            }
          : EMPTY_FORM
      );
    }
  }, [open, prompt]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.prompt.trim()) {
        throw new Error('Name and Prompt are required');
      }
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        prompt: form.prompt,
      };
      return isEditing && prompt
        ? updatePrompt(prompt.id, payload, getToken)
        : createPrompt(payload, getToken);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Prompt updated' : 'Prompt created successfully');
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save prompt');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Prompt' : 'Create Custom Prompt'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update this saved prompt template.'
              : 'Save a complex query to easily reuse it later during document analysis.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Prompt Name</Label>
            <Input
              id="name"
              placeholder="e.g., Check DGMS Electrical Regulations"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Geological">Geological</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="What does this prompt do?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt Instructions</Label>
            <Textarea
              id="prompt"
              placeholder="Analyze the document against..."
              className="min-h-[120px] resize-none"
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !form.name.trim() || !form.prompt.trim()}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Save Prompt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
