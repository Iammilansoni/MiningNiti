'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, FileText, AlertTriangle } from 'lucide-react';

interface NotificationOption {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  defaultEnabled: boolean;
}

const NOTIFICATIONS: NotificationOption[] = [
  {
    key: 'documentProcessed',
    label: 'Document Processing',
    description: 'Get notified when a document finishes AI analysis.',
    icon: FileText,
    iconColor: 'text-blue-500 bg-blue-500/10',
    defaultEnabled: true,
  },
  {
    key: 'complianceAlerts',
    label: 'Compliance Alerts',
    description: 'Receive alerts when compliance issues are detected.',
    icon: AlertTriangle,
    iconColor: 'text-amber-500 bg-amber-500/10',
    defaultEnabled: true,
  },
  {
    key: 'emailDigest',
    label: 'Email Digest',
    description: 'Weekly summary of activity and processed documents.',
    icon: Mail,
    iconColor: 'text-purple-500 bg-purple-500/10',
    defaultEnabled: false,
  },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.key, n.defaultEnabled]))
  );

  const toggleSetting = (key: string) => {
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
          Choose which notifications you want to receive.
        </p>
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden divide-y divide-border/50">
        {NOTIFICATIONS.map((item) => (
          <div key={item.key} className="p-6 flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg shrink-0 ${item.iconColor}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </div>
            <Switch
              checked={settings[item.key]}
              onCheckedChange={() => toggleSetting(item.key)}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Notification preferences are stored locally in your browser.
      </p>
    </motion.div>
  );
}
