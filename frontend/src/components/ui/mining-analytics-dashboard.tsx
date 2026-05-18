'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  TrendingDown, 
  Activity,
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Gauge,
  Users,
  Truck,
  Wrench,
  FileText,
  Brain
} from 'lucide-react';

// Mining-specific color schemes
const MINING_COLORS = {
  primary: 'hsl(var(--mining-primary))',
  secondary: 'hsl(var(--mining-secondary))',
  accent: 'hsl(var(--mining-accent))',
  safety: 'hsl(var(--safety-ok))',
  warning: 'hsl(var(--safety-warning))',
  critical: 'hsl(var(--safety-critical))',
  production: '#06b6d4',
  efficiency: '#f59e0b',
  compliance: '#10b981',
  maintenance: '#f97316'
};

// Sample data generators
const generateProductionData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toISOString().substr(11, 5),
      production: 85 + Math.random() * 30,
      efficiency: 78 + Math.random() * 25,
      safety: 92 + Math.random() * 8,
      compliance: 88 + Math.random() * 12
    });
  }
  return data;
};

const generateSafetyMetrics = () => [
  { name: 'Incidents', value: 0, target: 0, status: 'excellent' as const },
  { name: 'Near Misses', value: 2, target: 5, status: 'good' as const },
  { name: 'Compliance Score', value: 94, target: 90, status: 'excellent' as const },
  { name: 'Training Hours', value: 847, target: 800, status: 'excellent' as const },
  { name: 'Equipment Checks', value: 156, target: 150, status: 'good' as const }
];

const generateEquipmentStatus = () => [
  { name: 'Excavators', active: 12, maintenance: 2, offline: 1, total: 15 },
  { name: 'Dump Trucks', active: 25, maintenance: 3, offline: 0, total: 28 },
  { name: 'Drilling Rigs', active: 8, maintenance: 1, offline: 2, total: 11 },
  { name: 'Conveyor Systems', active: 15, maintenance: 2, offline: 0, total: 17 },
  { name: 'Processing Units', active: 6, maintenance: 1, offline: 0, total: 7 }
];

const generateComplianceData = () => [
  { category: 'Environmental', score: 92, items: 45, compliant: 41 },
  { category: 'Safety', score: 96, items: 68, compliant: 65 },
  { category: 'Operational', score: 88, items: 32, compliant: 28 },
  { category: 'Financial', score: 94, items: 24, compliant: 23 },
  { category: 'Legal', score: 98, items: 15, compliant: 15 }
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType<{ className?: string }>;
  iconColor?: string;
  description?: string;
  target?: number;
}

function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  iconColor = 'text-mining-primary',
  description,
  target 
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-safety-ok';
      case 'down': return 'text-safety-critical';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change !== undefined && (
            <div className={`flex items-center text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">
                {change > 0 ? '+' : ''}{change}% from yesterday
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {target && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress to target</span>
                <span>{Math.round((Number(value) / target) * 100)}%</span>
              </div>
              <Progress value={(Number(value) / target) * 100} className="h-1" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface SafetyIndicatorProps {
  metric: {
    name: string;
    value: number;
    target: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

function SafetyIndicator({ metric }: SafetyIndicatorProps) {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'excellent': return 'text-safety-ok bg-safety-ok/10';
      case 'good': return 'text-mining-primary bg-mining-primary/10';
      case 'warning': return 'text-safety-warning bg-safety-warning/10';
      case 'critical': return 'text-safety-critical bg-safety-critical/10';
    }
  };

  const getStatusIcon = () => {
    switch (metric.status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div>
          <p className="font-medium text-foreground">{metric.name}</p>
          <p className="text-sm text-muted-foreground">
            Target: {metric.target.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-foreground">
          {metric.value.toLocaleString()}
        </p>
        <Badge variant="secondary" className="capitalize">
          {metric.status}
        </Badge>
      </div>
    </div>
  );
}

interface EquipmentStatusChartProps {
  data: Array<{
    name: string;
    active: number;
    maintenance: number;
    offline: number;
    total: number;
  }>;
}

function EquipmentStatusChart({ data }: EquipmentStatusChartProps) {
  return (
    <div className="space-y-4">
      {data.map((equipment) => (
        <div key={equipment.name} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{equipment.name}</span>
            <span className="text-muted-foreground">
              {equipment.total} units
            </span>
          </div>
          <div className="flex space-x-1 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-safety-ok"
              style={{ width: `${(equipment.active / equipment.total) * 100}%` }}
            />
            <div 
              className="bg-safety-warning"
              style={{ width: `${(equipment.maintenance / equipment.total) * 100}%` }}
            />
            <div 
              className="bg-safety-critical"
              style={{ width: `${(equipment.offline / equipment.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Active: {equipment.active}</span>
            <span>Maintenance: {equipment.maintenance}</span>
            <span>Offline: {equipment.offline}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MiningAnalyticsDashboard() {
  const [productionData, setProductionData] = useState(generateProductionData);
  const [safetyMetrics] = useState(generateSafetyMetrics);
  const [equipmentData] = useState(generateEquipmentStatus);
  const [complianceData] = useState(generateComplianceData);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProductionData(generateProductionData);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const kpiMetrics = useMemo(() => [
    {
      title: 'Daily Production',
      value: '2,847',
      change: 12,
      trend: 'up' as const,
      icon: Truck,
      iconColor: 'text-chart-production',
      description: 'Tons extracted today',
      target: 3000
    },
    {
      title: 'Safety Score',
      value: '96%',
      change: 2,
      trend: 'up' as const,
      icon: Shield,
      iconColor: 'text-chart-safety',
      description: 'Overall safety rating'
    },
    {
      title: 'Equipment Efficiency',
      value: '84%',
      change: -3,
      trend: 'down' as const,
      icon: Gauge,
      iconColor: 'text-chart-efficiency',
      description: 'Operational efficiency'
    },
    {
      title: 'Active Personnel',
      value: '247',
      change: 5,
      trend: 'up' as const,
      icon: Users,
      iconColor: 'text-mining-primary',
      description: 'On-site workers'
    },
    {
      title: 'Compliance Rate',
      value: '92%',
      change: 1,
      trend: 'up' as const,
      icon: CheckCircle,
      iconColor: 'text-chart-compliance',
      description: 'Regulatory compliance'
    },
    {
      title: 'AI Insights',
      value: '15',
      change: 8,
      trend: 'up' as const,
      icon: Brain,
      iconColor: 'text-mining-secondary',
      description: 'New recommendations'
    }
  ], []);

  return (
    <div className="space-y-6">
      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="production" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="production" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Production</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Safety</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Compliance</span>
            </TabsTrigger>
          </TabsList>

          {/* Time range selector */}
          <div className="flex space-x-2">
            {['1h', '24h', '7d', '30d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </div>

        <TabsContent value="production" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Production Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-chart-production" />
                  <span>Production Trends</span>
                </CardTitle>
                <CardDescription>
                  Real-time production metrics over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="production"
                      stackId="1"
                      stroke={MINING_COLORS.production}
                      fill={MINING_COLORS.production}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-chart-efficiency" />
                  <span>Operational Efficiency</span>
                </CardTitle>
                <CardDescription>
                  Multi-factor efficiency analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke={MINING_COLORS.efficiency}
                      strokeWidth={2}
                      dot={{ fill: MINING_COLORS.efficiency, strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="compliance"
                      stroke={MINING_COLORS.compliance}
                      strokeWidth={2}
                      dot={{ fill: MINING_COLORS.compliance, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Safety Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-chart-safety" />
                  <span>Safety Performance</span>
                </CardTitle>
                <CardDescription>
                  Current safety metrics and targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {safetyMetrics.map((metric) => (
                  <SafetyIndicator key={metric.name} metric={metric} />
                ))}
              </CardContent>
            </Card>

            {/* Safety Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-chart-safety" />
                  <span>Safety Trends</span>
                </CardTitle>
                <CardDescription>
                  Safety score over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="safety"
                      stroke={MINING_COLORS.safety}
                      fill={MINING_COLORS.safety}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Equipment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-mining-primary" />
                  <span>Equipment Status</span>
                </CardTitle>
                <CardDescription>
                  Current operational status of all equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EquipmentStatusChart data={equipmentData} />
              </CardContent>
            </Card>

            {/* Equipment Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-chart-efficiency" />
                  <span>Equipment Utilization</span>
                </CardTitle>
                <CardDescription>
                  Utilization rates by equipment type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={equipmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="active" stackId="a" fill={MINING_COLORS.safety} />
                    <Bar dataKey="maintenance" stackId="a" fill={MINING_COLORS.warning} />
                    <Bar dataKey="offline" stackId="a" fill={MINING_COLORS.critical} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Compliance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-chart-compliance" />
                  <span>Compliance Overview</span>
                </CardTitle>
                <CardDescription>
                  Regulatory compliance by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={complianceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Compliance Score"
                      dataKey="score"
                      stroke={MINING_COLORS.compliance}
                      fill={MINING_COLORS.compliance}
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-mining-secondary" />
                  <span>Compliance Details</span>
                </CardTitle>
                <CardDescription>
                  Detailed compliance metrics by category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceData.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.category}</span>
                      <Badge variant={item.score >= 95 ? 'default' : item.score >= 85 ? 'secondary' : 'destructive'}>
                        {item.score}%
                      </Badge>
                    </div>
                    <Progress value={item.score} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.compliant} of {item.items} compliant</span>
                      <span>{item.items - item.compliant} pending</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
