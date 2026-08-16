import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle2, Shield, FileText, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function Page() {
  const features = [
    { icon: FileText, text: 'Upload and analyze mining documents with AI' },
    { icon: MessageSquare, text: 'RAG chat with source-grounded citations' },
    { icon: Shield, text: 'Compliance auditing against DGMS/MSHA standards' },
  ];

  return (
    <main className="grid min-h-screen bg-[#05030A] lg:grid-cols-[1fr_480px]">

      {/* ── LEFT: Brand panel ── */}
      <section className="relative hidden lg:flex lg:flex-col overflow-hidden">
        <Image
          src="/auth-signin-bg.png"
          alt="Mining operation"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-[#05030A]/90 via-[#0d0520]/60 to-[#05030A]/40" />
        <div className="absolute inset-0 bg-linear-to-t from-[#05030A] via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col h-full p-10">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="size-8 rounded-lg bg-purple-400 flex items-center justify-center text-[13px] font-bold text-white shadow-[0_0_20px_rgba(148,122,252,0.5)]">
              M
            </div>
            <span className="text-[16px] font-semibold text-white tracking-tight">MiningNiti</span>
          </Link>

          <div className="mt-auto">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#947AFC]/30 bg-purple-400/10 backdrop-blur-sm px-3.5 py-1.5 text-sm text-white/70">
              <Shield className="size-4 text-purple-400" />
              Smart India Hackathon 2023 Winner
            </div>

            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-[-0.03em] text-white mb-4">
              AI-powered document intelligence for mining.
            </h1>

            <p className="text-[15px] leading-[1.7] text-white/50 mb-8 max-w-md">
              Sign in to search documents, review compliance signals,
              and work with source-grounded AI answers.
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

      {/* ── RIGHT: Sign-in form ── */}
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
            <h2 className="text-[28px] font-bold text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-[14px] text-white/45">
              Sign in to your workspace.
            </p>
          </div>

          {/*
            Theme via `variables`, not by restyling internals.

            The previous config set elements.card to 'bg-transparent p-0' and
            elements.header to 'hidden'. Against Clerk 6.39's DOM that collapsed
            the card to roughly nothing: the email and password fields were in
            the accessibility tree but the form was invisible on the page.

            Variables are a supported, version-stable API — they map to Clerk's
            own CSS custom properties — so prefer them over class overrides on
            internal elements. Use the current names: colorText,
            colorTextSecondary and colorInputText are deprecated in favour of
            colorForeground, colorMutedForeground and colorInputForeground.
          */}
          <SignIn
            appearance={{
              variables: {
                colorPrimary: '#947AFC',
                colorPrimaryForeground: '#ffffff',
                colorBackground: '#0A0A0B',
                colorForeground: '#ffffff',
                colorMutedForeground: 'rgba(255,255,255,0.55)',
                colorInput: '#111113',
                colorInputForeground: '#ffffff',
                colorNeutral: '#ffffff',
                colorBorder: 'rgba(255,255,255,0.14)',
                colorMuted: 'rgba(255,255,255,0.06)',
                borderRadius: '10px',
              },
              elements: {
                cardBox: 'border border-white/10 shadow-none',
                footerActionLink: 'text-purple-400 hover:text-[#c4a0f0]',
                // Social buttons default to a light surface, which leaves their
                // labels near-invisible on this dark card.
                socialButtonsBlockButton:
                  'bg-white/[0.06] border-white/15 hover:bg-white/[0.12]',
                socialButtonsBlockButtonText: 'text-white',
              },
            }}
          />

          <p className="mt-6 text-center text-[13px] text-white/35">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-purple-400 hover:text-[#c4a0f0] font-medium transition-colors">
              Create workspace
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
