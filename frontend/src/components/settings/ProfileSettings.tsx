'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile, UserProfile } from '@/lib/api';
import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, X } from 'lucide-react';

const INDUSTRY_FOCUS_OPTIONS = [
  'Coal',
  'Underground',
  'Surface',
  'Opencast',
  'Quarrying',
  'Mineral Processing',
];

interface FormState {
  fullName: string;
  companyName: string;
  companyRole: string;
  industryFocus: string[];
  mineSites: string[];
}

function toFormState(profile?: UserProfile | null): FormState {
  return {
    fullName: profile?.full_name || '',
    companyName: profile?.company_name || '',
    companyRole: profile?.company_role || '',
    industryFocus: profile?.industry_focus || [],
    mineSites: profile?.mine_sites || [],
  };
}

export function ProfileSettings({ profile, isLoading }: { profile: UserProfile | undefined; isLoading: boolean }) {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormState>(toFormState());
  const [initialData, setInitialData] = useState<FormState>(toFormState());
  const [mineSiteInput, setMineSiteInput] = useState('');

  useEffect(() => {
    if (profile) {
      const data = toFormState(profile);
      setFormData(data);
      setInitialData(data);
    }
  }, [profile]);

  const hasUnsavedChanges =
    formData.fullName !== initialData.fullName ||
    formData.companyName !== initialData.companyName ||
    formData.companyRole !== initialData.companyRole ||
    JSON.stringify(formData.industryFocus) !== JSON.stringify(initialData.industryFocus) ||
    JSON.stringify(formData.mineSites) !== JSON.stringify(initialData.mineSites);

  const updateMutation = useMutation({
    mutationFn: async (data: Parameters<typeof updateUserProfile>[0]) => {
      return updateUserProfile(data, getToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setInitialData(formData);
      toast.success('Profile updated');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleIndustryFocus = (option: string) => {
    setFormData(prev => ({
      ...prev,
      industryFocus: prev.industryFocus.includes(option)
        ? prev.industryFocus.filter(o => o !== option)
        : [...prev.industryFocus, option],
    }));
  };

  const addMineSite = () => {
    const value = mineSiteInput.trim();
    if (!value || formData.mineSites.includes(value)) {
      setMineSiteInput('');
      return;
    }
    setFormData(prev => ({ ...prev, mineSites: [...prev.mineSites, value] }));
    setMineSiteInput('');
  };

  const removeMineSite = (site: string) => {
    setFormData(prev => ({ ...prev, mineSites: prev.mineSites.filter(s => s !== site) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasUnsavedChanges) return;

    updateMutation.mutate({
      full_name: formData.fullName,
      company_name: formData.companyName,
      company_role: formData.companyRole,
      industry_focus: formData.industryFocus,
      mine_sites: formData.mineSites,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 bg-muted w-1/3 rounded" />
        <div className="h-10 bg-muted rounded-lg w-full" />
        <div className="h-10 bg-muted rounded-lg w-full" />
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
          Your personal information and display preferences.
        </p>
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Avatar - pulled from your Clerk account, managed there */}
            <div className="flex items-center gap-4">
              {clerkUser?.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formData.fullName || 'Your Name'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.companyRole || 'Set your role below'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 max-w-md">
              <div className="grid gap-2">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground/80">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="companyName" className="text-sm font-medium text-foreground/80">
                  Company
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Organization name (optional)"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="companyRole" className="text-sm font-medium text-foreground/80">
                  Role
                </label>
                <input
                  id="companyRole"
                  name="companyRole"
                  value={formData.companyRole}
                  onChange={handleChange}
                  placeholder="e.g. Safety Inspector, Engineer"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 grid gap-4 max-w-md">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-foreground/80">Industry Focus</label>
                <p className="text-xs text-muted-foreground -mt-1 mb-1">
                  Used to tailor compliance guidance to your operations.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {INDUSTRY_FOCUS_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm text-foreground/90 cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={formData.industryFocus.includes(option)}
                        onCheckedChange={() => toggleIndustryFocus(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="mineSite" className="text-sm font-medium text-foreground/80">
                  Mine Sites
                </label>
                <div className="flex gap-2">
                  <Input
                    id="mineSite"
                    value={mineSiteInput}
                    onChange={(e) => setMineSiteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMineSite();
                      }
                    }}
                    placeholder="Add a site name and press Enter"
                    className="h-10"
                  />
                  <Button type="button" variant="outline" onClick={addMineSite}>
                    Add
                  </Button>
                </div>
                {formData.mineSites.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {formData.mineSites.map((site) => (
                      <Badge key={site} variant="secondary" className="gap-1 pr-1">
                        {site}
                        <button
                          type="button"
                          onClick={() => removeMineSite(site)}
                          className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                          aria-label={`Remove ${site}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-muted/30 flex items-center justify-end border-t border-border/50">
            <Button
              type="submit"
              disabled={!hasUnsavedChanges || updateMutation.isPending}
              className="relative transition-all duration-200"
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
