'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  CircuitBoard, 
  Cpu, 
  Shield, 
  Zap, 
  FileSearch,
  MessageSquare,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  size?: 'small' | 'medium' | 'large';
  delay: number;
}

function FeatureCard({ icon, title, description, gradient, size = 'small', delay }: FeatureCardProps) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 row-span-2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`${sizeClasses[size]} group`}
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500">
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative p-6 h-full flex flex-col">
          <motion.div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} w-fit mb-4`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-muted-foreground flex-grow">
            {description}
          </p>
          
          <motion.div
            className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ x: -10 }}
            whileHover={{ x: 0 }}
          >
            <span className="text-sm font-medium">Learn more</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturesBentoGrid() {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      title: 'Neural Document Intelligence',
      description: 'Advanced AI comprehends mining documents with 99.7% accuracy. Automatically extracts safety protocols, operational procedures, and compliance requirements.',
      gradient: 'from-emerald-500 to-teal-600',
      size: 'large' as const,
      delay: 0.1,
    },
    {
      icon: <CircuitBoard className="w-6 h-6 text-white" />,
      title: 'Quantum-Speed Search',
      description: 'Lightning-fast semantic search across millions of documents using vector embeddings.',
      gradient: 'from-blue-500 to-cyan-500',
      size: 'small' as const,
      delay: 0.2,
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: 'Autonomous Compliance',
      description: 'Proactive regulatory tracking and automated safety audits.',
      gradient: 'from-rose-500 to-pink-600',
      size: 'small' as const,
      delay: 0.3,
    },
    {
      icon: <Cpu className="w-6 h-6 text-white" />,
      title: 'Mining Intelligence Assistant',
      description: 'Expert-level AI trained on 50+ years of mining knowledge, safety standards, and industry best practices.',
      gradient: 'from-violet-500 to-purple-600',
      size: 'medium' as const,
      delay: 0.4,
    },
    {
      icon: <FileSearch className="w-6 h-6 text-white" />,
      title: 'Smart Document Classification',
      description: 'Automatic categorization of safety protocols, equipment manuals, and regulatory documents.',
      gradient: 'from-amber-500 to-orange-600',
      size: 'small' as const,
      delay: 0.5,
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: 'RAG-Powered Chat',
      description: 'Context-aware conversations with document citations.',
      gradient: 'from-indigo-500 to-blue-600',
      size: 'small' as const,
      delay: 0.6,
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards for safety metrics, compliance scores, and operational insights.',
      gradient: 'from-teal-500 to-emerald-600',
      size: 'medium' as const,
      delay: 0.7,
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-chart-3/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Powerful Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-chart-3 to-primary bg-clip-text text-transparent">
              Mining Intelligence
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform is specifically designed for the unique challenges 
            and requirements of the mining industry.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
