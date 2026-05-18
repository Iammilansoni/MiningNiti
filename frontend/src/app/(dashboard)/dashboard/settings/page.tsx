// src/app/(dashboard)/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useApi';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollReveal, SpotlightCard, ShinyText } from '@/components/reactbits';
import { User, Building2, Bell, Shield, Zap, Save } from 'lucide-react';

export default function SettingsPage() {
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [industryFocus, setIndustryFocus] = useState('');

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setCompanyName(profile.company_name ?? '');
      setCompanyRole(profile.company_role ?? '');
      setIndustryFocus(profile.industry_focus?.[0] ?? '');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(
      {
        full_name: fullName || undefined,
        company_name: companyName || undefined,
        company_role: companyRole || undefined,
        industry_focus: industryFocus ? [industryFocus] : undefined,
      },
      {
        onSuccess: () => toast.success('Profile updated successfully'),
        onError: (e) => toast.error('Update failed', { description: e.message }),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div>
          <h1 className="text-2xl font-bold">
            <ShinyText>Settings</ShinyText>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your account and application preferences</p>
        </div>
      </ScrollReveal>

      {/* Profile Settings */}
      <ScrollReveal delay={0.1}>
        <SpotlightCard className="p-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-cyan-600" />
              Profile Settings
            </CardTitle>
            <CardDescription>Your personal information as stored in MiningNiti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="clerk-id">Clerk User ID</Label>
                  <Input
                    id="clerk-id"
                    value={profile?.clerk_user_id ?? ''}
                    disabled
                    className="font-mono text-xs bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email ?? ''}
                    disabled
                    className="bg-muted"
                    placeholder="Managed by Clerk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="Mining Engineer"
                    value={companyRole}
                    onChange={(e) => setCompanyRole(e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </SpotlightCard>
      </ScrollReveal>

      {/* Company Settings */}
      <ScrollReveal delay={0.2}>
        <SpotlightCard className="p-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-purple-600" />
              Company Settings
            </CardTitle>
            <CardDescription>Configure your company information for AI context</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Acme Mining Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry-focus">Industry Focus</Label>
                  <Select value={industryFocus} onValueChange={setIndustryFocus}>
                    <SelectTrigger id="industry-focus">
                      <SelectValue placeholder="Select your mining focus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coal">Coal Mining</SelectItem>
                      <SelectItem value="gold">Gold Mining</SelectItem>
                      <SelectItem value="copper">Copper Mining</SelectItem>
                      <SelectItem value="iron">Iron Ore Mining</SelectItem>
                      <SelectItem value="quarry">Quarrying</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </SpotlightCard>
      </ScrollReveal>

      {/* AI Preferences */}
      <ScrollReveal delay={0.3}>
        <SpotlightCard className="p-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-600" />
              AI Preferences
            </CardTitle>
            <CardDescription>Customize AI behavior and response settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-prompt">Default AI Persona</Label>
              <Select defaultValue="safety">
                <SelectTrigger id="default-prompt">
                  <SelectValue placeholder="Choose default AI behavior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety Expert</SelectItem>
                  <SelectItem value="equipment">Equipment Specialist</SelectItem>
                  <SelectItem value="compliance">Compliance Officer</SelectItem>
                  <SelectItem value="general">General Mining Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="response-length">Response Length</Label>
              <Select defaultValue="detailed">
                <SelectTrigger id="response-length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Source References</Label>
                <p className="text-sm text-muted-foreground">Show document sources in AI responses</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-suggest Follow-up Questions</Label>
                <p className="text-sm text-muted-foreground">AI suggests related questions after responses</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </SpotlightCard>
      </ScrollReveal>

      {/* Notifications */}
      <ScrollReveal delay={0.4}>
        <SpotlightCard className="p-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-orange-600" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: 'Document Processing Complete', desc: 'Get notified when documents finish processing' },
              { label: 'Weekly Usage Summary', desc: 'Receive weekly reports on AI usage and insights' },
              { label: 'System Updates', desc: 'Notifications about new features and updates' },
              { label: 'Security Alerts', desc: 'Important security and compliance notifications' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{label}</Label>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </SpotlightCard>
      </ScrollReveal>

      {/* Data & Privacy */}
      <ScrollReveal delay={0.5}>
        <SpotlightCard className="p-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-green-600" />
              Data &amp; Privacy
            </CardTitle>
            <CardDescription>Manage your data and privacy preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Retention</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically delete old conversations and documents
                </p>
              </div>
              <Select defaultValue="1year">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="2years">2 years</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics &amp; Insights</Label>
                <p className="text-sm text-muted-foreground">Help improve our service by sharing usage analytics</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">Download all your data in a portable format</p>
                </div>
                <Button variant="outline">Export</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </div>
          </CardContent>
        </SpotlightCard>
      </ScrollReveal>

      {/* Save */}
      <ScrollReveal delay={0.6}>
        <div className="flex justify-end">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="btn-premium min-w-32"
              onClick={handleSave}
              disabled={updateProfile.isPending || isLoading}
            >
              {updateProfile.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <Save className="h-4 w-4" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </ScrollReveal>
    </div>
  );
}