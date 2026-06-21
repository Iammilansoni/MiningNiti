'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  MessageSquare, 
  Upload, 
  Trash2, 
  Edit, 
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Bot
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'upload' | 'chat' | 'analysis' | 'delete' | 'edit' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'pending' | 'error';
  user?: string;
}

// Mock activities for demo
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'upload',
    title: 'Safety Protocol v2.3.pdf',
    description: 'Document uploaded and queued for analysis',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'success',
    user: 'You',
  },
  {
    id: '2',
    type: 'analysis',
    title: 'Equipment Manual - Excavator XL500',
    description: 'AI analysis completed with 3 safety recommendations',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'success',
  },
  {
    id: '3',
    type: 'chat',
    title: 'New AI Chat Session',
    description: 'Asked about ventilation requirements',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    user: 'You',
  },
  {
    id: '4',
    type: 'alert',
    title: 'Compliance Update',
    description: 'MSHA regulation 30 CFR 75.380 updated',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: '5',
    type: 'upload',
    title: 'Incident Report - March 2024',
    description: 'Document processed successfully',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'success',
    user: 'John D.',
  },
];

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'upload':
      return <Upload className="w-4 h-4" />;
    case 'chat':
      return <MessageSquare className="w-4 h-4" />;
    case 'analysis':
      return <Bot className="w-4 h-4" />;
    case 'delete':
      return <Trash2 className="w-4 h-4" />;
    case 'edit':
      return <Edit className="w-4 h-4" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

function getStatusIcon(status?: Activity['status']) {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    case 'pending':
      return <Clock className="w-3 h-3 text-amber-500" />;
    case 'error':
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    default:
      return null;
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'upload':
      return 'bg-blue-500/10 text-blue-500';
    case 'chat':
      return 'bg-purple-500/10 text-purple-500';
    case 'analysis':
      return 'bg-primary/10 text-primary';
    case 'delete':
      return 'bg-red-500/10 text-red-500';
    case 'alert':
      return 'bg-amber-500/10 text-amber-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [isLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Add a new random activity occasionally
      if (Math.random() > 0.7) {
        const newActivity: Activity = {
          id: Date.now().toString(),
          type: ['upload', 'chat', 'analysis'][Math.floor(Math.random() * 3)] as Activity['type'],
          title: 'New activity',
          description: 'Something happened',
          timestamp: new Date(),
          status: 'success',
        };
        setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
          <span className="text-xs text-muted-foreground">{isLive ? 'Live' : 'Paused'}</span>
        </div>
      </div>

      {/* Activity list */}
      <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{activity.title}</p>
                    {getStatusIcon(activity.status)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    {activity.user && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.user}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 text-center">
        <button className="text-sm text-primary hover:underline">
          View all activity →
        </button>
      </div>
    </div>
  );
}
