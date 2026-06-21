'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { SectionCard } from '@/components/product/section-card';
import { User, Shield, Bell, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserProfile(getToken),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return updateUserProfile(data, getToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    companyRole: '',
    notifications: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        companyName: profile.company_name || '',
        companyRole: profile.company_role || '',
        notifications: true, // Mocking notifications as it's not in UserProfile
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      full_name: formData.fullName,
      company_name: formData.companyName,
      company_role: formData.companyRole,
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto space-y-8 animate-fade-in-up">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {/* Navigation Sidebar */}
        <div className="col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm transition-colors">
            <User className="w-4 h-4" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg font-medium text-sm transition-colors">
            <Shield className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-lg font-medium text-sm transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <SectionCard className="p-6 border border-border bg-card shadow-sm">
            <div className="mb-6 border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
              <p className="text-sm text-muted-foreground">Update your personal details and public profile.</p>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-muted rounded-lg w-full"></div>
                <div className="h-10 bg-muted rounded-lg w-full"></div>
                <div className="h-10 bg-muted rounded-lg w-full"></div>
              </div>
            ) : isError ? (
              <div className="w-full p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive font-medium">
                Failed to load profile. Please try refreshing the page.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Company</label>
                    <input 
                      type="text" 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <input 
                      type="text" 
                      name="companyRole"
                      value={formData.companyRole}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {saved && (
                      <span className="flex items-center text-sm text-emerald-500 font-medium animate-in fade-in slide-in-from-right-4">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Saved successfully
                      </span>
                    )}
                  </div>
                  <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                    {updateMutation.isPending ? 'Saving...' : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
