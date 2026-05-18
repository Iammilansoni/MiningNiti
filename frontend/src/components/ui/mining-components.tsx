'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Wrench,
  BarChart3,
  Activity,
  MapPin,
  Calendar,
  Target
} from 'lucide-react';

// Safety Status Indicator Component
interface SafetyStatusProps {
  level: 'critical' | 'warning' | 'good' | 'excellent';
  score: number;
  incidents: number;
  lastUpdate?: Date;
}

export function SafetyStatus({ level, score, incidents, lastUpdate }: SafetyStatusProps) {
  const getStatusConfig = () => {
    switch (level) {
      case 'critical':
        return {
          color: 'text-safety-critical bg-safety-critical/10 border-safety-critical/20',
          icon: AlertTriangle,
          label: 'Critical',
          description: 'Immediate attention required'
        };
      case 'warning':
        return {
          color: 'text-safety-warning bg-safety-warning/10 border-safety-warning/20',
          icon: Clock,
          label: 'Warning',
          description: 'Monitor closely'
        };
      case 'good':
        return {
          color: 'text-mining-primary bg-mining-primary/10 border-mining-primary/20',
          icon: CheckCircle,
          label: 'Good',
          description: 'Performing well'
        };
      case 'excellent':
        return {
          color: 'text-safety-ok bg-safety-ok/10 border-safety-ok/20',
          icon: Shield,
          label: 'Excellent',
          description: 'Exceeding standards'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl border ${config.color}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-5 w-5" />
          <span className="font-semibold">{config.label}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          Safety
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">{score}%</span>
          <span className="text-xs text-muted-foreground">
            {incidents} incidents
          </span>
        </div>
        <Progress value={score} className="h-2" />
        <p className="text-xs text-muted-foreground">{config.description}</p>
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Updated {lastUpdate.toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Equipment Status Component
interface EquipmentStatusProps {
  name: string;
  status: 'online' | 'maintenance' | 'offline' | 'error';
  utilization: number;
  nextMaintenance?: Date;
  location?: string;
}

export function EquipmentStatus({ 
  name, 
  status, 
  utilization, 
  nextMaintenance, 
  location 
}: EquipmentStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'text-safety-ok bg-safety-ok/10',
          label: 'Online',
          icon: CheckCircle
        };
      case 'maintenance':
        return {
          color: 'text-safety-warning bg-safety-warning/10',
          label: 'Maintenance',
          icon: Wrench
        };
      case 'offline':
        return {
          color: 'text-muted-foreground bg-muted',
          label: 'Offline',
          icon: Clock
        };
      case 'error':
        return {
          color: 'text-safety-critical bg-safety-critical/10',
          label: 'Error',
          icon: AlertTriangle
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
            <StatusIcon className="h-3 w-3" />
            <span>{config.label}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Utilization</span>
              <span className="font-medium">{utilization}%</span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>
          
          {location && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {location}
            </div>
          )}
          
          {nextMaintenance && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Next: {nextMaintenance.toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Production Metrics Component
interface ProductionMetricsProps {
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  period: string;
}

export function ProductionMetrics({ 
  current, 
  target, 
  unit, 
  trend, 
  change, 
  period 
}: ProductionMetricsProps) {
  const percentage = (current / target) * 100;
  const isOnTarget = percentage >= 90;

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl border bg-gradient-to-br ${
        isOnTarget 
          ? 'from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800' 
          : 'from-orange-50 to-amber-50 border-orange-200 dark:from-orange-950 dark:to-amber-950 dark:border-orange-800'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className={`h-5 w-5 ${isOnTarget ? 'text-green-600' : 'text-orange-600'}`} />
          <span className="font-semibold text-foreground">Production</span>
        </div>
        <Badge variant={isOnTarget ? 'default' : 'secondary'}>
          {Math.round(percentage)}% of target
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-foreground">
            {current.toLocaleString()}
          </span>
          <span className="text-lg text-muted-foreground">{unit}</span>
        </div>
        
        <Progress 
          value={percentage} 
          className={`h-3 ${isOnTarget ? 'text-green-600' : 'text-orange-600'}`} 
        />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Target: {target.toLocaleString()} {unit}
          </span>
          <div className="flex items-center space-x-1 text-muted-foreground">
            {getTrendIcon()}
            <span>
              {change > 0 ? '+' : ''}{change}% {period}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// AI Insight Card Component
interface AIInsightProps {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'safety' | 'efficiency' | 'maintenance' | 'compliance';
  confidence: number;
  actionRequired?: boolean;
  onAction?: () => void;
}

export function AIInsight({ 
  title, 
  description, 
  priority, 
  category, 
  confidence, 
  actionRequired,
  onAction 
}: AIInsightProps) {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'critical':
        return {
          color: 'border-l-safety-critical bg-safety-critical/5',
          badge: 'destructive' as const,
          label: 'Critical'
        };
      case 'high':
        return {
          color: 'border-l-safety-warning bg-safety-warning/5',
          badge: 'secondary' as const,
          label: 'High'
        };
      case 'medium':
        return {
          color: 'border-l-mining-primary bg-mining-primary/5',
          badge: 'outline' as const,
          label: 'Medium'
        };
      case 'low':
        return {
          color: 'border-l-muted bg-muted/20',
          badge: 'outline' as const,
          label: 'Low'
        };
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'safety':
        return <Shield className="h-4 w-4" />;
      case 'efficiency':
        return <TrendingUp className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'compliance':
        return <Target className="h-4 w-4" />;
    }
  };

  const config = getPriorityConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border-l-4 ${config.color}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getCategoryIcon()}
          <h4 className="font-semibold text-foreground">{title}</h4>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={config.badge} className="text-xs">
            {config.label}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {confidence}% confidence
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        {description}
      </p>
      
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs capitalize">
          {category}
        </Badge>
        
        {actionRequired && onAction && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onAction}
            className="text-xs"
          >
            Take Action
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Operational KPI Component
interface OperationalKPIProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    period: string;
  };
  status?: 'good' | 'warning' | 'critical';
  icon: React.ElementType<{ className?: string }>;
}

export function OperationalKPI({ 
  title, 
  value, 
  unit, 
  target, 
  trend, 
  status = 'good', 
  icon: Icon 
}: OperationalKPIProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'text-safety-critical';
      case 'warning':
        return 'text-safety-warning';
      default:
        return 'text-safety-ok';
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    switch (trend.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`h-8 w-8 ${getStatusColor()}`} />
        {status === 'critical' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertTriangle className="h-5 w-5 text-safety-critical" />
          </motion.div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
        </div>
        
        {target && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Target: {target.toLocaleString()}</span>
              <span>{Math.round((Number(value) / target) * 100)}%</span>
            </div>
            <Progress value={(Number(value) / target) * 100} className="h-1" />
          </div>
        )}
        
        {trend && (
          <div className={`flex items-center text-xs ${getTrendColor()}`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="h-3 w-3 mr-1" />
            ) : (
              <Activity className="h-3 w-3 mr-1" />
            )}
            <span>
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.period}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Alert Banner Component
interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AlertBanner({ 
  type, 
  title, 
  message, 
  action, 
  dismissible, 
  onDismiss 
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-safety-critical/10 border-safety-critical/20',
          icon: AlertTriangle,
          iconColor: 'text-safety-critical'
        };
      case 'warning':
        return {
          bg: 'bg-safety-warning/10 border-safety-warning/20',
          icon: Clock,
          iconColor: 'text-safety-warning'
        };
      case 'success':
        return {
          bg: 'bg-safety-ok/10 border-safety-ok/20',
          icon: CheckCircle,
          iconColor: 'text-safety-ok'
        };
      case 'info':
        return {
          bg: 'bg-mining-primary/10 border-mining-primary/20',
          icon: Zap,
          iconColor: 'text-mining-primary'
        };
    }
  };

  const config = getTypeConfig();
  const TypeIcon = config.icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`p-4 rounded-lg border ${config.bg}`}
      >
        <div className="flex items-start space-x-3">
          <TypeIcon className={`h-5 w-5 mt-0.5 ${config.iconColor}`} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="flex items-center space-x-2">
            {action && (
              <Button size="sm" variant="outline" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {dismissible && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Real-time Status Indicator
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-green-500',
          animation: 'animate-pulse'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          animation: 'animate-bounce'
        };
      case 'maintenance':
        return {
          color: 'bg-blue-500',
          animation: 'animate-pulse'
        };
      case 'offline':
        return {
          color: 'bg-gray-500',
          animation: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center space-x-2">
      <div className={`${getSizeClass()} rounded-full ${config.color} ${config.animation}`} />
      {label && (
        <span className="text-sm text-muted-foreground capitalize">
          {label || status}
        </span>
      )}
    </div>
  );
}
