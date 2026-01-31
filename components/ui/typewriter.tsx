'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  cursorChar?: string;
}

export function Typewriter({
  words,
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  cursorChar = '|',
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const typeNextChar = useCallback(() => {
    const currentWord = words[currentWordIndex];
    
    if (isPaused) {
      return;
    }

    if (!isDeleting) {
      // Typing
      if (currentText.length < currentWord.length) {
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting
      if (currentText.length > 0) {
        setCurrentText(currentText.slice(0, -1));
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [currentText, currentWordIndex, isDeleting, isPaused, pauseDuration, words]);

  useEffect(() => {
    if (!isMounted) return;
    
    const timer = setTimeout(
      typeNextChar,
      isDeleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timer);
  }, [typeNextChar, isDeleting, deletingSpeed, typingSpeed, isMounted]);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <span className={`relative inline-flex ${className}`}>
        <span className="text-gradient">{words[0]}</span>
        <span className="ml-1 text-primary font-light opacity-0">{cursorChar}</span>
      </span>
    );
  }

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* Text container with gradient */}
      <span 
        className="text-gradient font-bold"
        style={{ 
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {currentText || '\u00A0'}
      </span>
      
      {/* Animated cursor */}
      <motion.span
        animate={{ 
          opacity: [1, 1, 0, 0, 1],
        }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="ml-1 text-primary font-light text-[0.8em]"
      >
        {cursorChar}
      </motion.span>
    </span>
  );
}

// Alternative: Full line typewriter with letter-by-letter animation
export function TypewriterLine({
  text,
  className = '',
  delay = 0,
  speed = 50,
  onComplete,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const startTyping = () => {
      let currentIndex = 0;
      
      const typeChar = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeoutId = setTimeout(typeChar, speed);
        } else {
          setIsComplete(true);
          onComplete?.();
        }
      };
      
      timeoutId = setTimeout(typeChar, delay);
    };
    
    startTyping();
    
    return () => clearTimeout(timeoutId);
  }, [text, delay, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-primary"
        >
          |
        </motion.span>
      )}
    </span>
  );
}
