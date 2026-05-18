'use client';

import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export interface DocumentCardProps {
  id: string;
  title: string;
  file_type: string;
  file_size: number;
  status: 'processed' | 'processing' | 'failed' | 'pending';
  uploaded_at: string;
  file_url?: string;
  file_name?: string;
  category?: string;
  onView?: () => void;
  onDelete?: () => void;
}

function getStatusConfig(status: DocumentCardProps['status']) {
  switch (status) {
    case 'processed':
      return { 
        icon: <CheckCircle className="w-4 h-4" />, 
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
        label: 'Processed'
      };
    case 'processing':
      return { 
        icon: <Clock className="w-4 h-4 animate-spin" />, 
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        label: 'Processing'
      };
    case 'failed':
      return { 
        icon: <AlertTriangle className="w-4 h-4" />, 
        color: 'bg-red-500/10 text-red-500 border-red-500/20',
        label: 'Failed'
      };
    default:
      return { 
        icon: <Clock className="w-4 h-4" />, 
        color: 'bg-muted text-muted-foreground',
        label: 'Pending'
      };
  }
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📄';
  if (type.includes('doc')) return '📝';
  if (type.includes('txt')) return '📃';
  if (type.includes('xls') || type.includes('csv')) return '📊';
  return '📁';
}

export default function DocumentCard({
  title,
  file_type,
  file_size,
  status,
  uploaded_at,
  file_url,
  file_name,
  category,
  onView,
  onDelete,
}: DocumentCardProps) {
  const statusConfig = getStatusConfig(status);
  const fileIcon = getFileIcon(file_type);
  const sizeInMB = (file_size / (1024 * 1024)).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        status === 'processed' ? 'bg-green-500' :
        status === 'processing' ? 'bg-amber-500' :
        status === 'failed' ? 'bg-red-500' : 'bg-muted'
      }`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{fileIcon}</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(uploaded_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView} disabled={status !== 'processed'}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              {file_url && (
                <DropdownMenuItem asChild>
                  <a href={file_url} download={file_name}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={onDelete} 
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {file_type.split('/')[1]?.toUpperCase() || 'FILE'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {sizeInMB} MB
          </Badge>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
        </div>

        {/* Status footer */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className={`flex items-center gap-2 px-2 py-1 rounded-full border ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="text-xs font-medium">{statusConfig.label}</span>
          </div>
          
          {status === 'processed' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Bot className="w-3 h-3" />
              <span>AI Analyzed</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
