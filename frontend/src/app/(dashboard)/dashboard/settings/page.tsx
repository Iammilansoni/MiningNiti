'use client';

import { PageHeader } from '@/components/product/page-header';
import { SectionCard } from '@/components/product/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Building2, Bell } from 'lucide-react';
import { useUser, UserProfile } from '@clerk/nextjs';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <PageHeader
        title="Settings"
        description="Manage your account, workspace, and security preferences."
        className="mb-6"
      />

      <Tabs defaultValue="profile" className="flex-1 flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto bg-transparent p-0 gap-2 w-full md:w-48 overflow-x-auto md:overflow-visible shrink-0 justify-start">
          <TabsTrigger value="profile" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground justify-start gap-2 w-full text-left">
            <User className="size-4 shrink-0" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="workspace" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground justify-start gap-2 w-full text-left">
            <Building2 className="size-4 shrink-0" />
            <span className="hidden md:inline">Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground justify-start gap-2 w-full text-left">
            <Shield className="size-4 shrink-0" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground justify-start gap-2 w-full text-left">
            <Bell className="size-4 shrink-0" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 max-w-3xl">
          <TabsContent value="profile" className="mt-0 outline-none">
            <SectionCard className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your personal information and preferences.</p>
              </div>

              {/* Native Clerk UI if loaded, else fallback skeleton/simple form */}
              {user ? (
                <div className="clerk-profile-wrapper">
                  <UserProfile 
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none border-0 bg-transparent p-0 w-full",
                        navbar: "hidden",
                        pageScrollBox: "p-0",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Loading..." disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="Loading..." disabled />
                  </div>
                  <Button disabled>Save Changes</Button>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="workspace" className="mt-0 outline-none">
            <SectionCard className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground">Workspace Settings</h3>
                <p className="text-sm text-muted-foreground">Configure your mining operation details.</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue="Mining Corp Inc." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Workspace Domain</Label>
                  <div className="flex items-center gap-2">
                    <Input id="domain" defaultValue="miningcorp" className="flex-1" />
                    <span className="text-muted-foreground text-sm">.miningniti.com</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button>Save Workspace</Button>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="security" className="mt-0 outline-none">
            <SectionCard className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground">Security & Access</h3>
                <p className="text-sm text-muted-foreground">Manage authentication and API keys.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account.</p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium mb-2">API Keys</h4>
                  <p className="text-sm text-muted-foreground mb-4">Use these keys to authenticate API requests.</p>
                  <div className="flex items-center gap-2">
                    <Input value="sk_test_••••••••••••••••••••" readOnly className="font-mono text-sm" />
                    <Button variant="secondary">Copy</Button>
                    <Button variant="outline">Rotate</Button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 outline-none">
            <SectionCard className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">Choose what alerts you want to receive.</p>
              </div>
              <div className="space-y-4">
                 {['Compliance Alerts', 'Document Processing complete', 'Weekly Digest', 'Security Alerts'].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 rounded-md border border-border/50">
                      <div>
                        <p className="font-medium text-sm text-foreground">{item}</p>
                        <p className="text-xs text-muted-foreground">Receive emails for this event type.</p>
                      </div>
                      {/* Simplified toggle visual */}
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                         <div className="absolute right-1 top-1 bottom-1 w-3 bg-background rounded-full" />
                      </div>
                    </div>
                 ))}
              </div>
            </SectionCard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}