'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function ProfileSettings({ profile, isLoading }: { profile: any; isLoading: boolean }) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    companyRole: '',
  });

  const [initialData, setInitialData] = useState({
    fullName: '',
    companyName: '',
    companyRole: '',
  });

  useEffect(() => {
    if (profile) {
      const data = {
        fullName: profile.full_name || '',
        companyName: profile.company_name || '',
        companyRole: profile.company_role || '',
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [profile]);

  const hasUnsavedChanges = 
    formData.fullName !== initialData.fullName ||
    formData.companyName !== initialData.companyName ||
    formData.companyRole !== initialData.companyRole;

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return updateUserProfile(data, getToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setInitialData(formData);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasUnsavedChanges) return;
    
    updateMutation.mutate({
      full_name: formData.fullName,
      company_name: formData.companyName,
      company_role: formData.companyRole,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-muted w-1/3 rounded"></div>
        <div className="h-10 bg-muted rounded-lg w-full"></div>
        <div className="h-10 bg-muted rounded-lg w-full"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and how it is displayed.
        </p>
      </div>
      
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-border/50">
          
          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground/80">Full Name</label>
              <input 
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="max-w-md flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-[13px] text-muted-foreground">
                This is the name that will be displayed on reports and audit logs.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <label htmlFor="companyName" className="text-sm font-medium text-foreground/80">Company</label>
              <input 
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Mining Corp Inc."
                className="max-w-md flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2 pt-2">
              <label htmlFor="companyRole" className="text-sm font-medium text-foreground/80">Role</label>
              <input 
                id="companyRole"
                name="companyRole"
                value={formData.companyRole}
                onChange={handleChange}
                placeholder="Safety Inspector"
                className="max-w-md flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-muted/20 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Please use 32 characters at maximum.
            </p>
            <Button 
              type="submit" 
              disabled={!hasUnsavedChanges || updateMutation.isPending}
              className="relative overflow-hidden transition-all duration-200"
            >
              <span className={updateMutation.isPending ? 'opacity-0' : 'opacity-100'}>
                Save Changes
              </span>
              {updateMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
