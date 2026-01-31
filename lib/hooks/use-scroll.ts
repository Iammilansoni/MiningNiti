'use client';

import { useState, useEffect } from 'react';

export function useScroll(threshold = 10) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setScrollY(currentScrollY);
            setIsScrolled(currentScrollY > threshold);
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return { isScrolled, scrollY, scrollDirection };
}

export function useScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = (window.scrollY / scrollHeight) * 100;
            setProgress(Math.min(100, Math.max(0, scrollProgress)));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return progress;
}
