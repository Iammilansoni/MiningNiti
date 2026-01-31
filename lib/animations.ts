// Framer Motion Animation Variants

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export const fadeInLeft = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export const fadeInRight = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

export const slideInFromLeft = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: {
        x: '-100%',
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeIn' },
    },
};

export const slideInFromRight = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: {
        x: '100%',
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeIn' },
    },
};

export const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeInOut' },
};

export const hoverLift = {
    y: -4,
    transition: { duration: 0.2, ease: 'easeInOut' },
};

export const tapScale = {
    scale: 0.98,
};

export const glowPulse = {
    boxShadow: [
        '0 0 20px rgba(10, 132, 255, 0.3)',
        '0 0 40px rgba(10, 132, 255, 0.5)',
        '0 0 20px rgba(10, 132, 255, 0.3)',
    ],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
    },
};

export const textReveal = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: 'easeOut',
        },
    }),
};

export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3, ease: 'easeIn' },
    },
};

export const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

export const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: 'easeOut',
        },
    }),
};
