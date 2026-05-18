'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categoryColors: Record<string, string> = {
  'All': 'from-slate-500 to-slate-600',
  'Safety': 'from-red-500 to-rose-600',
  'Equipment': 'from-blue-500 to-cyan-600',
  'Regulatory': 'from-green-500 to-emerald-600',
  'Training': 'from-purple-500 to-violet-600',
  'Incident': 'from-amber-500 to-orange-600',
  'Environmental': 'from-teal-500 to-green-600',
  'Maintenance': 'from-indigo-500 to-blue-600',
};

export default function CategoryChips({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  const allCategories = ['All', ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category, index) => {
        const isSelected = selectedCategory === category || (category === 'All' && !selectedCategory);
        const gradient = categoryColors[category] || 'from-gray-500 to-gray-600';
        
        return (
          <motion.button
            key={category}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category === 'All' ? null : category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              isSelected
                ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
            )}
          >
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}
