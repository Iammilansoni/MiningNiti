import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';

export default function BlogPage() {
  const posts = [
    {
      title: 'Building a RAG Pipeline for Complex Geological Tables',
      excerpt: 'Standard Retrieval-Augmented Generation breaks down when faced with complex, multi-span tables spanning several pages. Here is how we engineered our parsing engine to maintain structural context.',
      category: 'Engineering',
      date: 'May 28, 2026',
      readTime: '8 min read',
      image: 'bg-linear-to-br from-blue-900 to-[#05030A]'
    },
    {
      title: 'Announcing MiningNiti OS 2.0: Automated DGMS Compliance',
      excerpt: 'Today we are releasing our biggest update yet: a continuous compliance engine that automatically cross-references your daily shift reports against the latest DGMS 2024 regulations.',
      category: 'Product Updates',
      date: 'May 15, 2026',
      readTime: '4 min read',
      image: 'bg-linear-to-br from-[#947AFC]/40 to-[#05030A]'
    },
    {
      title: 'Why Cloud Security Matters for Mining Operators',
      excerpt: 'Mining data is highly sensitive. We break down the differences between managed SaaS, private VPC deployments, and true air-gapped on-premise installations for AI workloads.',
      category: 'Security',
      date: 'April 22, 2026',
      readTime: '6 min read',
      image: 'bg-linear-to-br from-emerald-900 to-[#05030A]'
    },
    {
      title: 'The Hidden Cost of Paper in Modern Mining',
      excerpt: 'Digitization isn\'t just about saving trees; it is about preventing multi-million dollar regulatory fines caused by missing signatures hidden in massive physical archives.',
      category: 'Industry',
      date: 'April 05, 2026',
      readTime: '5 min read',
      image: 'bg-linear-to-br from-amber-900 to-[#05030A]'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        
        {/* Header */}
        <div className="max-w-[1200px] mx-auto px-6 mb-16">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-white mb-4 leading-none">Engineering & Updates</h1>
          <p className="text-lg text-white/50 max-w-2xl">
            Thoughts, technical deep dives, and product announcements from the team building the intelligence layer for heavy industry.
          </p>
        </div>

        {/* Featured Post (First one) */}
        <div className="max-w-[1200px] mx-auto px-6 mb-16">
          <Link href="#" className="group block bg-white/2 border border-white/8 rounded-3xl overflow-hidden hover:bg-white/4 transition-all shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className={`h-[300px] md:h-auto ${posts[0].image} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs font-mono mb-4">
                  <span className="text-purple-400 px-2 py-1 rounded bg-purple-400/10">{posts[0].category}</span>
                  <span className="text-white/40">{posts[0].date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">{posts[0].title}</h2>
                <p className="text-white/50 leading-relaxed mb-6">{posts[0].excerpt}</p>
                <span className="text-sm font-semibold text-white mt-auto">Read Article →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Grid of remaining posts */}
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-3 gap-6">
          {posts.slice(1).map((post, i) => (
            <Link key={i} href="#" className="group bg-white/2 border border-white/8 rounded-2xl overflow-hidden hover:bg-white/4 transition-all flex flex-col shadow-lg">
              <div className={`h-[180px] ${post.image} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs font-mono mb-4">
                  <span className="text-white/70">{post.category}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/40">{post.date}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-purple-400 transition-colors">{post.title}</h3>
                <p className="text-[14px] text-white/50 leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  );
}
