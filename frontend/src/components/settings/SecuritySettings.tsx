'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Link2 } from 'lucide-react';

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
          Manage your password and authentication through Clerk.
        </p>
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden divide-y divide-border/50">

        {/* Password */}
        <div className="p-6 flex items-start gap-4">
          <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Password</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Change your password from the sign-in page. Use &quot;Forgot password&quot; to reset.
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="p-6 flex items-start gap-4">
          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Email Address</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your email is managed by Clerk authentication. Update it from your account settings.
            </p>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="p-6 flex items-start gap-4">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Connected Accounts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Link social accounts for easier sign-in. Manage from Clerk&apos;s authentication portal.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
