'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { User, Shield, Bell } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';

type TabId = 'profile' | 'security' | 'notifications';

export default function SettingsPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserProfile(getToken),
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-8 animate-fade-in-up">
      <div className="relative z-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 items-start">
        {/* Navigation Sidebar */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-1 sticky top-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                  isActive 
                    ? "bg-accent text-accent-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <tab.icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-9 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <ProfileSettings key="profile" profile={profile} isLoading={isLoading} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings key="security" />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings key="notifications" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
