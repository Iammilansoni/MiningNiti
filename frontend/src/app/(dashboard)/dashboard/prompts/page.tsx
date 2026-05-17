// src/app/(dashboard)/dashboard/prompts/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Plus, Edit, Trash2, Star, Copy
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getPrompts, createPrompt, updatePrompt, deletePrompt, CustomPrompt as ApiPrompt } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function PromptsPage() {
  const { getToken } = useAuth();
  const [prompts, setPrompts] = useState<ApiPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ApiPrompt | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrompts = useCallback(async () => {
    if (!getToken) return;
    setLoading(true);
    try {
      const data = await getPrompts(getToken);
      setPrompts(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Failed to fetch prompts.", { description: message });
    } finally {
      setLoading(false);
    }
  }, [getToken]);


  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleCreatePrompt = async () => {
    if (!newPromptName.trim() || !newPromptContent.trim() || !getToken) {
      toast.error("Prompt name and content cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createPrompt({ name: newPromptName, prompt: newPromptContent }, getToken);
      toast.success("Prompt created successfully!");
      setIsCreateDialogOpen(false);
      setNewPromptName('');
      setNewPromptContent('');
      await fetchPrompts(); // Refresh the list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Failed to create prompt.", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPrompt = (prompt: ApiPrompt) => {
    setEditingPrompt(prompt);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.prompt);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt || !newPromptName.trim() || !newPromptContent.trim() || !getToken) {
      toast.error("Prompt name and content cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePrompt(editingPrompt.id, { name: newPromptName, prompt: newPromptContent }, getToken);
      toast.success("Prompt updated successfully!");
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      setNewPromptName('');
      setNewPromptContent('');
      await fetchPrompts(); // Refresh the list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Failed to update prompt.", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    if (!getToken) return;
    
    try {
      await deletePrompt(promptId, getToken);
      toast.success("Prompt deleted successfully!");
      await fetchPrompts(); // Refresh the list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Failed to delete prompt.", { description: message });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Prompt copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Prompts</h1>
          <p className="text-muted-foreground">Customize AI behavior for specific mining tasks</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Prompt</DialogTitle>
              <DialogDescription>
                Design a custom AI prompt for your specific needs.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-name">Prompt Name</Label>
                <Input id="prompt-name" placeholder="e.g., Safety Checklist Generator" value={newPromptName} onChange={e => setNewPromptName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt-content">Prompt Content</Label>
                <Textarea id="prompt-content" placeholder="You are a mining safety expert. Your role is to..." className="min-h-[120px]" value={newPromptContent} onChange={e => setNewPromptContent(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewPromptName('');
                  setNewPromptContent('');
                }}>Cancel</Button>
                <Button onClick={handleCreatePrompt} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Prompt'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Prompt</DialogTitle>
              <DialogDescription>
                Modify your custom AI prompt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prompt-name">Prompt Name</Label>
                <Input id="edit-prompt-name" placeholder="e.g., Safety Checklist Generator" value={newPromptName} onChange={e => setNewPromptName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prompt-content">Prompt Content</Label>
                <Textarea id="edit-prompt-content" placeholder="You are a mining safety expert. Your role is to..." className="min-h-[120px]" value={newPromptContent} onChange={e => setNewPromptContent(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingPrompt(null);
                  setNewPromptName('');
                  setNewPromptContent('');
                }}>Cancel</Button>
                <Button onClick={handleUpdatePrompt} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Prompt'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Prompts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prompts.length > 0 ? prompts.map((prompt) => (
            <Card key={prompt.id} className="group flex flex-col hover:shadow-md transition-shadow border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                        <Brain className="h-5 w-5 text-primary"/>
                        {prompt.name}
                        {prompt.is_default && (<Star className="h-4 w-4 text-yellow-500 fill-current" />)}
                    </CardTitle>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(prompt.prompt)} className="hover:bg-accent">
                            <Copy className="h-4 w-4" />
                        </Button>
                  </div>
                </div>
                <Badge variant={prompt.is_default ? "secondary" : "outline"} className='w-fit'>
                  {prompt.is_default ? "System Default" : "Custom"}
                </Badge>
              </CardHeader>
              <CardContent className='flex-1 flex flex-col justify-between'>
                <div className="bg-muted/50 p-3 rounded-lg flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-4">{prompt.prompt}</p>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditPrompt(prompt)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  {!prompt.is_default && (
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeletePrompt(prompt.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )) : 
          <div className="col-span-full">
            <div className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4"/>
              <h3 className="text-lg font-medium text-foreground mb-2">No prompts found</h3>
              <p className="text-muted-foreground">Create your first custom prompt to get started!</p>
            </div>
          </div>
        }
      </div>
    </div>
  );
}