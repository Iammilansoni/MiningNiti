'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useClerk, useUser } from '@clerk/nextjs';
import { KeyRound, Mail, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SecuritySettings() {
  const { openUserProfile } = useClerk();
  const { user } = useUser();

  const rows = [
    {
      icon: KeyRound,
      iconClass: 'bg-primary/10 text-primary',
      title: 'Password',
      description: 'Change your password or enable two-factor authentication.',
    },
    {
      icon: Mail,
      iconClass: 'bg-blue-500/10 text-blue-600',
      title: 'Email Address',
      description: user?.primaryEmailAddress?.emailAddress
        ? `Signed in as ${user.primaryEmailAddress.emailAddress}. Add or change addresses here.`
        : 'Add or change the email address linked to your account.',
    },
    {
      icon: Link2,
      iconClass: 'bg-emerald-500/10 text-emerald-600',
      title: 'Connected Accounts',
      description: 'Link social accounts (Google, etc.) for faster sign-in.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your password, email, and connected accounts are managed by Clerk, our authentication provider.
        </p>
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden divide-y divide-border/50">
        {rows.map((row) => (
          <div key={row.title} className="p-6 flex items-start gap-4">
            <div className={`p-2 rounded-lg shrink-0 ${row.iconClass}`}>
              <row.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{row.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{row.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => openUserProfile()}
            >
              Manage <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
