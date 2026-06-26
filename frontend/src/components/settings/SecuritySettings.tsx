'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { KeyRound, Smartphone } from 'lucide-react';

export function SecuritySettings() {
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
          Manage your password and secure your account.
        </p>
      </div>
      
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden divide-y divide-border/50">
        
        {/* Password Section */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Password</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0 bg-background">
            Update Password
          </Button>
        </div>

        {/* 2FA Section */}
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Two-factor Authentication</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-muted-foreground font-medium">Off</span>
            <Switch />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
