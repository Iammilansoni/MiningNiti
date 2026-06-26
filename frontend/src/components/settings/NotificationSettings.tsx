'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    newDocuments: true,
    complianceWarnings: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how and when you want to be notified.
        </p>
      </div>
      
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden divide-y divide-border/50">
        
        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground">Email Alerts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Receive immediate email notifications for critical violations.
            </p>
          </div>
          <Switch 
            checked={settings.emailAlerts} 
            onCheckedChange={() => toggleSetting('emailAlerts')} 
          />
        </div>

        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground">Weekly Digest</h3>
            <p className="text-sm text-muted-foreground mt-1">
              A weekly summary of processed documents and safety trends.
            </p>
          </div>
          <Switch 
            checked={settings.weeklyDigest} 
            onCheckedChange={() => toggleSetting('weeklyDigest')} 
          />
        </div>

        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground">Document Processing</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get notified when a document finishes analyzing.
            </p>
          </div>
          <Switch 
            checked={settings.newDocuments} 
            onCheckedChange={() => toggleSetting('newDocuments')} 
          />
        </div>

        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground">Compliance Warnings</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Alerts for non-critical compliance warnings in documents.
            </p>
          </div>
          <Switch 
            checked={settings.complianceWarnings} 
            onCheckedChange={() => toggleSetting('complianceWarnings')} 
          />
        </div>

      </div>
    </motion.div>
  );
}
