import { NavLink, Feature, FAQ, TechItem, SiteConfig } from '@/types';

export const siteConfig: SiteConfig = {
    name: 'MiningNiti',
    description: 'AI-Powered Mining Compliance Platform - SIH 2023 Winner',
    url: 'https://miningniti.vercel.app',
    ogImage: '/og-image.png',
    links: {
        github: 'https://github.com/iammilansoni',
        linkedin: 'https://linkedin.com/in/iammilansoni',
    },
};

export const navLinks: NavLink[] = [
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Resources', href: '/resources' },
    { label: 'Docs', href: '/docs' },
    { label: 'Contact', href: '/contact' },
];

export const features: Feature[] = [
    {
        title: 'AI-Powered Chatbot',
        description: 'Get instant answers to mining compliance queries 24/7 using advanced RAG technology.',
        icon: 'Bot',
    },
    {
        title: 'Mining Rule Database',
        description: 'Comprehensive database of mining rules, acts, and circulars from CMPDI.',
        icon: 'Database',
    },
    {
        title: 'Compliance Tracking',
        description: 'Stay updated with the latest regulatory changes and compliance requirements.',
        icon: 'Shield',
    },
    {
        title: 'Real-time Updates',
        description: 'Receive instant notifications about new circulars and regulatory updates.',
        icon: 'Bell',
    },
    {
        title: 'Document Analysis',
        description: 'Upload PDFs and get AI-powered analysis of compliance documents.',
        icon: 'FileSearch',
    },
    {
        title: 'Multi-source Search',
        description: 'Search across database, internet, or both for comprehensive answers.',
        icon: 'Search',
    },
];

export const techStack: TechItem[] = [
    {
        name: 'Next.js',
        description: 'React framework for production-grade web applications',
        icon: 'nextjs',
    },
    {
        name: 'FAISS',
        description: 'Facebook AI Similarity Search for efficient vector storage',
        icon: 'faiss',
    },
    {
        name: 'RAG',
        description: 'Retrieval Augmented Generation for accurate responses',
        icon: 'rag',
    },
    {
        name: 'LangChain',
        description: 'Framework for developing LLM-powered applications',
        icon: 'langchain',
    },
    {
        name: 'DPO',
        description: 'Direct Preference Optimization for response quality',
        icon: 'dpo',
    },
];

export const faqs: FAQ[] = [
    {
        question: 'What is MiningNiti?',
        answer: 'MiningNiti is a dedicated platform designed to assist stakeholders and customers in the mining industry. It provides 24/7 support through an AI-powered chatbot that can answer queries related to mining rules, acts, and circulars.',
    },
    {
        question: 'How can I access MiningNiti services?',
        answer: "You can access our services directly through our website. Simply click on the 'Start Chatting' button to begin interacting with our chatbot, which is available round the clock to assist you.",
    },
    {
        question: 'Is my data secure with MiningNiti?',
        answer: 'Yes, at MiningNiti, we prioritize data security. All personal information and query details are handled with strict confidentiality and in compliance with data protection regulations.',
    },
    {
        question: 'Can MiningNiti help with compliance issues?',
        answer: 'Absolutely! MiningNiti is specifically designed to help with mining compliance. Our AI chatbot is trained on comprehensive mining regulations and can provide guidance on compliance requirements.',
    },
    {
        question: 'What makes MiningNiti different from other solutions?',
        answer: 'MiningNiti is an SIH 2023 winning solution developed for CMPDI. It uses advanced AI technologies like RAG, FAISS, and DPO to provide accurate, context-aware responses specific to Indian mining regulations.',
    },
];

export const stats = [
    { label: 'Queries Answered', value: 1000, suffix: '+' },
    { label: 'Uptime', value: 99.9, suffix: '%' },
    { label: 'Response Time', value: 2, suffix: 's' },
    { label: 'User Satisfaction', value: 98, suffix: '%' },
];
