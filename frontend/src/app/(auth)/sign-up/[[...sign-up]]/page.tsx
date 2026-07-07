import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle2, Building2, Zap, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default function Page() {
  const features = [
    { icon: BookOpen, text: 'Multi-agent AI pipeline across 4 LLM providers' },
    { icon: Zap, text: 'Hybrid search with vector + keyword retrieval' },
    { icon: Building2, text: 'Audit logging and compliance tracking' },
  ];

  return (
    <main className="grid min-h-screen bg-[#05030A] lg:grid-cols-[1fr_480px]">

      {/* ── LEFT: Brand panel ── */}
      <section className="relative hidden lg:flex lg:flex-col overflow-hidden">
        <Image
          src="/auth-signup-bg.png"
          alt="Mining operation"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#05030A]/90 via-[#0d0520]/60 to-[#05030A]/30" />
        <div className="absolute inset-0 bg-linear-to-t from-[#05030A] via-[#05030A]/20 to-transparent" />

        <div className="relative z-10 flex flex-col h-full p-10">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="size-8 rounded-lg bg-purple-400 flex items-center justify-center text-[13px] font-bold text-white shadow-[0_0_20px_rgba(148,122,252,0.5)]">
              M
            </div>
            <span className="text-[16px] font-semibold text-white tracking-tight">MiningNiti</span>
          </Link>

          <div className="mt-auto">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#947AFC]/30 bg-purple-400/10 backdrop-blur-sm px-3.5 py-1.5 text-sm text-white/70">
              <Building2 className="size-4 text-purple-400" />
              Open Source &middot; MIT License
            </div>

            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] text-white mb-4">
              Build your mining intelligence workspace.
            </h1>

            <p className="text-[15px] leading-[1.7] text-white/50 mb-8 max-w-md">
              Upload documents, run multi-agent AI analysis, chat with
              source-grounded answers, and track compliance — all in one place.
            </p>

            <div className="flex flex-col gap-3">
              {features.map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <item.icon className="size-4 text-purple-400 shrink-0" />
                  <span className="text-[13px] text-white/60">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RIGHT: Sign-up form ── */}
      <section className="flex items-center justify-center px-6 py-10 bg-[#05030A] border-l border-white/6">
        <div className="w-full max-w-[380px]">

          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 lg:hidden transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to MiningNiti
          </Link>

          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="size-7 rounded-md bg-purple-400 flex items-center justify-center text-[12px] font-bold text-white">M</div>
            <span className="text-[15px] font-semibold text-white">MiningNiti</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white tracking-tight">Create workspace</h2>
            <p className="mt-2 text-[14px] text-white/45">
              Get started with MiningNiti in minutes.
            </p>
          </div>

          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#947AFC',
                colorBackground: '#0A0A0A',
                colorText: '#ffffff',
                colorTextSecondary: 'rgba(255,255,255,0.5)',
                colorInputBackground: '#111113',
                colorInputText: '#ffffff',
                borderRadius: '10px',
              },
              elements: {
                rootBox: 'w-full',
                cardBox: 'shadow-none w-full',
                card: 'shadow-none bg-transparent p-0 gap-5',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                header: 'hidden',
                formButtonPrimary:
                  'bg-purple-400 hover:bg-[#a88ffc] text-white font-semibold h-11 shadow-[0_0_20px_rgba(148,122,252,0.25)] hover:shadow-[0_0_28px_rgba(148,122,252,0.4)] transition-all',
                formFieldInput:
                  'bg-[#111113] border-white/10 text-white placeholder:text-white/30 focus:border-[#947AFC]/60 focus:ring-[#947AFC]/20 h-11',
                formFieldLabel: 'text-white/60 text-[13px] font-medium',
                identityPreviewText: 'text-white/70',
                identityPreviewEditButton: 'text-purple-400',
                footerActionLink: 'text-purple-400 hover:text-[#c4a0f0] text-[13px]',
                dividerLine: 'bg-white/8',
                dividerText: 'text-white/25 text-[12px]',
                socialButtonsBlockButton:
                  'bg-white/[0.04] border-white/8 text-white hover:bg-white/8 transition-colors h-11',
                socialButtonsBlockButtonText: 'text-white/70 text-[13px] font-medium',
                formFieldActionLink: 'text-purple-400 hover:text-[#c4a0f0]',
                footer: 'mt-2',
              },
            }}
          />

          <p className="mt-6 text-center text-[13px] text-white/35">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-purple-400 hover:text-[#c4a0f0] font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
