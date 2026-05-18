'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  companyLogo?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    role: 'Chief Safety Officer',
    company: 'Titan Mining Corporation',
    content: 'MiningNiti has transformed our safety protocols. We\'ve reduced incident response time by 75% and achieved zero safety violations for 18 consecutive months. The AI understands our documentation better than any system we\'ve used.',
    rating: 5,
    avatar: 'SM',
  },
  {
    id: 2,
    name: 'Marcus Rodriguez',
    role: 'Operations Director',
    company: 'Global Copper Resources',
    content: 'The AI\'s understanding of our equipment manuals is phenomenal. It\'s like having a senior engineer available 24/7 for instant technical support. Our maintenance costs dropped 40% in the first quarter.',
    rating: 5,
    avatar: 'MR',
  },
  {
    id: 3,
    name: 'Dr. Emily Zhang',
    role: 'Compliance Manager',
    company: 'Mountain Peak Mining',
    content: 'Regulatory compliance used to be our biggest challenge. Now, MiningNiti keeps us ahead of every regulation change and automatically flags potential issues before they become problems.',
    rating: 5,
    avatar: 'EZ',
  },
  {
    id: 4,
    name: 'James Whitfield',
    role: 'CEO',
    company: 'DeepCore Mining Ltd',
    content: 'We processed over 2 million pages of legacy documentation in just 3 weeks. The ROI was visible from day one. This is the future of mining operations.',
    rating: 5,
    avatar: 'JW',
  },
];

function TestimonialCard({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.9 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className={`relative ${isActive ? 'z-10' : 'z-0'}`}
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 md:p-10">
        {/* Quote icon */}
        <div className="absolute top-6 right-6 text-primary/20">
          <Quote className="w-16 h-16" />
        </div>
        
        {/* Rating */}
        <div className="flex gap-1 mb-6">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        
        {/* Content */}
        <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8">
          &quot;{testimonial.content}&quot;
        </blockquote>
        
        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-white font-bold text-lg">
            {testimonial.avatar}
          </div>
          <div>
            <p className="font-semibold text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            <div className="flex items-center gap-1 text-sm text-primary">
              <Building2 className="w-3 h-3" />
              {testimonial.company}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const next = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-amber-500" />
            Customer Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Industry Leaders
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how mining companies worldwide are transforming their operations 
            with AI-powered document intelligence.
          </p>
        </motion.div>

        {/* Testimonial carousel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <TestimonialCard
              key={testimonials[activeIndex].id}
              testimonial={testimonials[activeIndex]}
              isActive={true}
            />
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setActiveIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-8 bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Company logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            TRUSTED BY LEADING MINING COMPANIES WORLDWIDE
          </p>
          <div className="flex flex-wrap justify-center gap-12 items-center opacity-60">
            {['Titan Mining', 'Global Copper', 'Mountain Peak', 'DeepCore', 'Atlas Minerals', 'Zenith Coal'].map((company) => (
              <div key={company} className="text-lg font-semibold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
