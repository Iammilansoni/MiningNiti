'use client';

import Link from 'next/link';
import { MiningNitiMark } from '@/components/product/brand';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#05030A] py-12 sm:py-16">
      <div className="mx-auto max-w-[var(--landing-max-width)] px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <MiningNitiMark className="size-6 text-white/40" />
              <span className="font-semibold text-white">MiningNiti</span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs mb-6">
              The AI-native intelligence layer for modern mining operations. Automate compliance, parse complex documents, and operate with absolute certainty.
            </p>
            <div className="text-sm text-white/25">
              © {new Date().getFullYear()} MiningNiti Inc. All rights reserved.
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-white/40">
                <li><Link href="#architecture" className="hover:text-white transition-colors">Architecture</Link></li>
               <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
               <li><Link href="#trust" className="hover:text-white transition-colors">Security</Link></li>
               <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-white/40">
                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
               <li><Link href="/dashboard/chat" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-white/40">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
               <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
               <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
