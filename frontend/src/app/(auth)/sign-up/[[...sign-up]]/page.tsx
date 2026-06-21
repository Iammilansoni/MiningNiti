import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle2, Building2, Zap, Users } from 'lucide-react';
import Image from 'next/image';

export default function Page() {
  const bullets = [
    'Fast document onboarding in minutes',
    'AI workflows for safety and compliance',
    'Dashboard views for operations leadership',
  ];

  return (
    <main className="grid min-h-screen bg-[#05030A] lg:grid-cols-[1fr_500px]">

      {/* ── LEFT: Full-bleed image panel ── */}
      <section className="relative hidden lg:flex lg:flex-col overflow-hidden">

        {/* Background image */}
        <Image
          src="/auth-signup-bg.png"
          alt="Open-pit mine aerial view at golden hour"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-linear-to-br from-[#05030A]/90 via-[#0d0520]/60 to-[#05030A]/30" />
        <div className="absolute inset-0 bg-linear-to-t from-[#05030A] via-[#05030A]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#05030A]/70" />

        {/* Content on top of image */}
        <div className="relative z-10 flex flex-col h-full p-10">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="size-8 rounded-lg bg-purple-400 flex items-center justify-center text-[13px] font-bold text-white shadow-[0_0_20px_rgba(148,122,252,0.5)]">
              M
            </div>
            <span className="text-[16px] font-semibold text-white tracking-tight">MiningNiti</span>
          </Link>

          {/* Bottom content */}
          <div className="mt-auto">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#947AFC]/30 bg-purple-400/10 backdrop-blur-sm px-3.5 py-1.5 text-sm text-white/70">
              <Building2 className="size-4 text-purple-400" />
              Enterprise onboarding
            </div>

            {/* Headline */}
            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] text-white mb-4">
              Create a workspace for mining compliance and operational knowledge.
            </h1>

            {/* Sub-copy */}
            <p className="text-[15px] leading-[1.7] text-white/50 mb-8 max-w-md">
              Start with document ingestion, source-grounded chat, compliance dashboards,
              and team-ready settings — live in 48 hours.
            </p>

            {/* Bullets */}
            <div className="flex flex-col gap-3 mb-10">
              {bullets.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-purple-400 shrink-0" />
                  <span className="text-[13px] text-white/60">{item}</span>
                </div>
              ))}
            </div>

            {/* Stat pills */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
                <Zap className="size-3.5 text-amber-400" />
                <div>
                  <div className="text-[15px] font-bold text-white leading-none">48 hrs</div>
                  <div className="text-[10px] text-white/40 mt-0.5">Avg. Deployment</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
                <Users className="size-3.5 text-purple-400" />
                <div>
                  <div className="text-[15px] font-bold text-white leading-none">500+</div>
                  <div className="text-[10px] text-white/40 mt-0.5">Teams Onboarded</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RIGHT: Sign-up form ── */}
      <section className="flex items-center justify-center px-6 py-10 bg-[#05030A] border-l border-white/6">
        <div className="w-full max-w-[400px]">

          {/* Mobile back link */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 lg:hidden transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to MiningNiti
          </Link>

          {/* Mobile brand */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="size-7 rounded-md bg-purple-400 flex items-center justify-center text-[12px] font-bold text-white">M</div>
            <span className="text-[15px] font-semibold text-white">MiningNiti</span>
          </Link>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[26px] font-bold text-white tracking-tight">Create workspace</h2>
            <p className="mt-1.5 text-[14px] text-white/45">
              Set up your MiningNiti intelligence workspace in minutes.
            </p>
          </div>

          {/* Clerk widget */}
          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#947AFC',
                colorBackground: '#0A0A0A',
                colorText: '#ffffff',
                colorTextSecondary: 'rgba(255,255,255,0.5)',
                colorInputBackground: '#141414',
                colorInputText: '#ffffff',
                borderRadius: '10px',
              },
              elements: {
                rootBox: 'w-full',
                cardBox: 'shadow-none w-full',
                card: 'shadow-none bg-transparent p-0 gap-4',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                header: 'hidden',
                formButtonPrimary:
                  'bg-purple-400 hover:bg-[#a88ffc] text-white font-semibold shadow-[0_0_20px_rgba(148,122,252,0.3)] hover:shadow-[0_0_28px_rgba(148,122,252,0.45)] transition-all',
                formFieldInput:
                  'bg-[#141414] border-white/10 text-white placeholder:text-white/30 focus:border-[#947AFC]/60 focus:ring-[#947AFC]/20',
                formFieldLabel: 'text-white/60 text-sm',
                identityPreviewText: 'text-white/70',
                identityPreviewEditButton: 'text-purple-400',
                footerActionLink: 'text-purple-400 hover:text-[#c4a0f0]',
                dividerLine: 'bg-white/10',
                dividerText: 'text-white/30',
                socialButtonsBlockButton:
                  'bg-white/[0.05] border-white/10 text-white hover:bg-white/10 transition-colors',
                socialButtonsBlockButtonText: 'text-white/80',
              },
            }}
          />

          {/* Sign-in link */}
          <p className="mt-6 text-center text-[13px] text-white/40">
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
