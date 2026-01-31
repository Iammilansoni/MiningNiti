'use client';

import { motion } from 'framer-motion';
import { 
  Bot, 
  Database, 
  Shield, 
  Bell, 
  FileSearch, 
  Search,
  ArrowRight
} from 'lucide-react';
import { Container, SectionHeader } from '@/components/ui/container';
import { Card, CardContent, CardGradientOverlay } from '@/components/ui/card';
import { features } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  Bot,
  Database,
  Shield,
  Bell,
  FileSearch,
  Search,
};

export function Features() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-50" />
      
      <Container className="relative z-10">
        <SectionHeader
          badge="Features"
          title="Everything You Need for Mining Compliance"
          subtitle="Powered by advanced AI technology to provide accurate, instant answers to your compliance queries."
        />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Bot;
            const isLarge = index === 0;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={isLarge ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''}
              >
                <Card
                  variant="feature"
                  hover="glow"
                  className="group h-full"
                >
                  <CardGradientOverlay />
                  <CardContent className={`relative z-10 flex flex-col h-full ${isLarge ? 'p-8' : 'p-6'}`}>
                    {/* Icon */}
                    <div 
                      className={`
                        rounded-xl bg-primary/10 flex items-center justify-center mb-4
                        group-hover:bg-primary/20 transition-colors duration-300
                        ${isLarge ? 'h-16 w-16' : 'h-12 w-12'}
                      `}
                    >
                      <Icon className={`text-primary ${isLarge ? 'h-8 w-8' : 'h-6 w-6'}`} />
                    </div>

                    {/* Content */}
                    <h3 className={`font-display font-semibold mb-2 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-muted-foreground flex-1 ${isLarge ? 'text-base' : 'text-sm'}`}>
                      {feature.description}
                    </p>

                    {/* Learn More Link */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <span className="text-sm text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                        Learn more 
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
