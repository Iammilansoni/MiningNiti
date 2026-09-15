import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { POSTS } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on mining document AI, compliance automation, and building for Smart India Hackathon — from the team behind MiningNiti.',
};

export default function BlogIndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-[720px] px-6">
          <header className="mb-12">
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-5">
              Blog
            </p>
            <h1 className="text-[clamp(2.1rem,5vw,3rem)] font-bold tracking-tight text-white leading-[1.08]">
              Notes from building MiningNiti
            </h1>
          </header>

          <div className="divide-y divide-white/8 border-t border-white/8">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block py-7 group"
              >
                <p className="text-[12px] font-mono uppercase tracking-wider text-white/35 mb-2">
                  {post.displayDate}
                </p>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-[15px] text-white/50 leading-relaxed max-w-[62ch]">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
