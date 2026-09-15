import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { POSTS } from '@/lib/posts';

const post = POSTS.find((p) => p.slug === 'ministry-of-coal-sih-2026')!;

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  keywords: [
    'SIH 2026',
    'SIH26023',
    'SIH26024',
    'SIH26025',
    'Smart India Hackathon 2026',
    'Ministry of Coal problem statement',
    'CMPDI',
    'Coal India Limited',
  ],
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    publishedTime: post.date,
  },
  twitter: {
    card: 'summary_large_image',
    title: post.title,
    description: post.description,
  },
};

type Verdict = 'strong' | 'partial' | 'none';

const VERDICT_STYLES: Record<Verdict, string> = {
  strong: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  partial: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
  none: 'bg-orange-400/10 text-orange-300 border-orange-400/20',
};

const VERDICT_LABEL: Record<Verdict, string> = {
  strong: 'Strong analog',
  partial: 'Partial overlap',
  none: 'Different domain',
};

function Verdict({ v }: { v: Verdict }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-wider ${VERDICT_STYLES[v]}`}
    >
      {VERDICT_LABEL[v]}
    </span>
  );
}

function Category({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-white/50">
      {children}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 mb-2 text-[11px] font-mono uppercase tracking-[0.12em] text-white/35">
      {children}
    </p>
  );
}

const CASE_FILES: Array<{
  code: string;
  title: string;
  category: string;
  verdict: Verdict;
  background: string;
  components: string[];
  tech: string[];
  approach: string[];
}> = [
  {
    code: 'SIH26023',
    title: 'AI-Powered Geological & Mining Reporting Solution',
    category: 'Software',
    verdict: 'strong',
    background:
      "CMPDI and CIL's subsidiaries have to compile geological and production data for the Ministry and for parliamentary inquiries. Today that means someone manually working through scanned PDFs, spreadsheets, and historical archives — slow, expert-dependent, and error-prone at the data-entry stage.",
    components: [
      'Automated report generation over the document pile',
      'A word-cloud / topic-identification module surfacing key themes',
      'An AI query-response system for fast lookups',
    ],
    tech: ['Document AI', 'OCR', 'RAG', 'Topic modeling'],
    approach: [
      'Judged on stated metrics: reduction in preparation time, extraction accuracy, and automation of repetitive workflows — build to those numbers, not a longer feature list.',
      "Two of the three components — automated reporting and an AI query system — are a fairly direct RAG-over-documents build. The one piece most teams skip is the word-cloud/topic-identification module: it's called out by name, so a chunk-embedding cluster with top-term extraction per cluster is worth the afternoon it costs, since it's an explicit scoring line, not a nice-to-have.",
    ],
  },
  {
    code: 'SIH26024',
    title: 'AI-Based Smart Governance & Compliance Monitoring',
    category: 'Software',
    verdict: 'partial',
    background:
      'Coal mining runs across many subsidiaries and sites, and governance — compliance tracking, inspections, safety, production and environmental reporting — is still manual documentation and spreadsheets. The result is inconsistent data and no real-time view for decision-makers.',
    components: [
      'Real-time statutory compliance tracking across safety, environment, production, labor',
      'Live inspection and violation monitoring with corrective-action workflows',
      'An analytics layer flagging high-risk zones and recurring failures',
      'Mobile apps with geo-tagged, time-stamped field reporting',
      'Dashboards for mine officials, corporate leadership, and regulators',
      'Automated alerts and a digital audit trail, deployed across multiple mines',
    ],
    tech: ['AI/ML', 'Mobile + GIS', 'OCR', 'Workflow automation', 'Blockchain audit trail', 'Multilingual UI'],
    approach: [
      'This is a bigger system than SIH26023, not a bigger version of it. The compliance-auditing half — cross-referencing operational documents against regulations — is a document-AI problem you can build the same way. The geo-tagged mobile field reporting and multi-site contractor oversight half is a separate product surface: a mobile app, a workflow engine, GIS.',
      'For a hackathon window, pick a spine and demo it end to end — full compliance-audit pipeline plus one thin mobile-reporting flow — over building six shallow modules. Judges consistently reward one thing that visibly works over a slide describing seven.',
    ],
  },
  {
    code: 'SIH26025',
    title: 'AI-Enabled Mine Subsidence Monitoring',
    category: 'Hardware',
    verdict: 'none',
    background:
      "Underground mining causes surface subsidence that threatens nearby structures and people. India's current answer is periodic field surveys and after-the-fact damage assessment — no advance warning. The PS asks for an indigenous, low-cost, real-time alternative.",
    components: [
      'A wireless mesh of low-cost sensor nodes — tilt, vibration, displacement, crack initiation',
      'LoRa / Zigbee / Wi-Fi mesh communication over the mining area',
      'ML-driven anomaly detection and subsidence forecasting',
      'GIS risk mapping with automated SMS/email/app alerts',
      'Offline-capable nodes with cloud sync, scalable across mines',
    ],
    tech: ['IoT sensors', 'Mesh networking', 'Arduino / ESP32', 'GIS', 'Edge ML'],
    approach: [
      'This one names its own innovation hook — "wireless surface mesh network for real-time subsidence detection" — so a demo needs actual nodes talking to each other, not a simulated dashboard. If your team doesn\'t already have embedded/IoT depth and a few weeks of lead time to source sensors, this is the PS to sit out this cycle rather than retrofit with a software team.',
    ],
  },
];

const LESSONS = [
  {
    title: 'Build to the stated metrics, not a wishlist',
    body: "Every PS above lists what it measures success by — accuracy percentage, time reduction, automation rate. Judges score against that list. A feature the PS never asked for doesn't move the score, however impressive the demo looks.",
  },
  {
    title: 'A working demo on real documents beats a deck',
    body: "By the internal rounds, everyone has a slide with boxes and arrows. What's rare is a system a judge can actually drive — upload a document, ask it something, watch it answer with a citation. That gap is where rounds get decided.",
  },
  {
    title: "Citations aren't a nice-to-have in this domain",
    body: "An AI answer about a safety regulation or a compliance clause with no traceable source is a liability, not a feature, for a government reporting use case. Cite the document and page for every claim — it's also the easiest credibility signal to show live.",
  },
  {
    title: 'Keep the stack something you can run in the room',
    body: "Free-tier infrastructure that a judge can hit from their own laptop beats an architecture diagram of services nobody can reach during judging. If it can't be demoed live, budget time to make it demoable, not just described.",
  },
  {
    title: "Fully build the PS's named components before reaching for adjacent ones",
    body: 'SIH26023 names a word-cloud module explicitly; SIH26024 names mobile geo-tagging explicitly. Half-building three extra ideas reads worse than fully building what was actually asked for, named component by named component.',
  },
];

const FAQS = [
  {
    q: 'Is SIH26023 basically a repeat of the 2023 Ministry of Coal PS?',
    a: 'Close, not identical. 2023 was a single RAG chatbot problem; SIH26023 explicitly asks for three named components — automated report generation, a word-cloud/topic-identification module, and an AI query system — plus stated accuracy and automation metrics to hit. Same department, same document-heavy pain point, a more specific brief this time.',
  },
  {
    q: 'Should I pick SIH26023 or SIH26024 if my team is strong on AI but has no mobile/GIS experience?',
    a: "SIH26023. SIH26024's expected solution leans on mobile apps with geo-tagging and multi-site GIS dashboards alongside the AI/analytics layer — without that half, you're demoing a partial system against a PS that asks for a full one.",
  },
  {
    q: 'Does SIH26025 need hardware to even prototype?',
    a: 'Yes. The PS names its own innovation hook as a wireless sensor mesh, and the expected solution lists specific sensor types and mesh protocols. A purely simulated dashboard without physical nodes talking to each other is answering a different, easier problem than the one written.',
  },
  {
    q: "What's the deadline for SIH 2026 idea submission?",
    a: '30 September 2026 for all three problem statements above, as listed on the official portal at the time this was checked. Deadlines and listings can change — confirm on sih.gov.in before you finalize scope.',
  },
];

export default function MinistryOfCoalPost() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0B]">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-32 pb-24">
        <article className="mx-auto max-w-[720px] px-6">

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/40 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="size-3.5" />
            Blog
          </Link>

          {/* Masthead */}
          <header>
            <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-400 mb-5">
              SIH 2026 · Smart Automation Theme · Ministry of Coal
            </p>
            <h1 className="text-[clamp(2.1rem,5vw,3rem)] font-bold tracking-tight text-white leading-[1.08] mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-[62ch]">
              Three new problem statements from the department that handed us a national win
              in 2023 — SIH26023, SIH26024, and SIH26025, read the way you&apos;d actually read
              a PS before scoping a build.
            </p>

            <div className="mt-7 pt-6 border-t border-white/8">
              <p className="text-[15px] text-white/60 leading-relaxed mb-4 max-w-[62ch]">
                I&apos;m Milan Soni. In SIH 2023 I was on the team that won nationally against
                this department&apos;s Ministry of Coal problem statement, recognized by Coal
                India Limited and CMPDI. Since June 2025 I&apos;ve been rebuilding that system
                from scratch, solo, as{' '}
                <Link href="/" className="text-purple-300 hover:text-purple-200 transition-colors">
                  MiningNiti
                </Link>{' '}
                — production RAG and document AI for mining safety and compliance, not a
                hackathon prototype. Source is on{' '}
                <a
                  href="https://github.com/Iammilansoni/MiningNiti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 transition-colors"
                >
                  GitHub
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] font-mono uppercase tracking-wider text-white/35">
                <span>Deadline 30 Sep 2026</span>
                <span>3 problem statements covered</span>
                <span>Last checked 15 Sep 2026</span>
              </div>
            </div>
          </header>

          {/* Intro */}
          <section className="mt-14">
            <div className="space-y-4 text-[15px] text-white/60 leading-relaxed max-w-[65ch]">
              <p>
                A handful of teams who cleared their internal rounds against this year&apos;s
                Ministry of Coal problem statements have asked me the same questions I once had
                to answer for the 2023 one — what the judges are actually scoring, where the
                scope traps are, whether a given PS is realistically a software build in a
                hackathon window. Rather than repeat it thread by thread, here&apos;s the
                analysis for all three, in one place.
              </p>
              <p>
                This is an independent read of the public problem statement text, not an
                official interpretation — check{' '}
                <a
                  href="https://www.sih.gov.in/sih2026PS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 transition-colors"
                >
                  the SIH portal
                </a>{' '}
                for the current listing before you scope anything.
              </p>
            </div>
          </section>

          {/* At a glance */}
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-white mb-5">At a glance</h2>
            <div className="overflow-x-auto rounded-2xl border border-white/8">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/8">
                    {['PS', 'Category', 'Read', 'One line'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-wider text-white/40"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {CASE_FILES.map((c) => (
                    <tr key={c.code}>
                      <td className="px-4 py-3.5 font-mono text-[13px] text-purple-300 whitespace-nowrap">{c.code}</td>
                      <td className="px-4 py-3.5 text-white/60 align-top">{c.category}</td>
                      <td className="px-4 py-3.5 text-white/60 align-top whitespace-nowrap">{VERDICT_LABEL[c.verdict]}</td>
                      <td className="px-4 py-3.5 text-white/50 align-top">
                        {c.code === 'SIH26023' && 'Document AI reporting platform for CMPDI/CIL — the closest thing to a repeat PS this department has run.'}
                        {c.code === 'SIH26024' && 'Governance and compliance platform across mines and contractors — document AI is one slice of a bigger system.'}
                        {c.code === 'SIH26025' && 'Wireless sensor mesh for subsidence early warning — IoT and firmware, not document AI.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Case files */}
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-white mb-6">The three problem statements</h2>
            <div className="space-y-5">
              {CASE_FILES.map((c) => (
                <div key={c.code} className="rounded-2xl border border-white/8 bg-white/[0.02] p-7">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <span className="font-mono text-[13px] text-purple-300">{c.code}</span>
                    <h3 className="text-xl font-bold text-white flex-1 min-w-[200px]">{c.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Category>{c.category}</Category>
                    <Verdict v={c.verdict} />
                  </div>

                  <FieldLabel>Background</FieldLabel>
                  <p className="text-[15px] text-white/60 leading-relaxed">{c.background}</p>

                  <FieldLabel>Expected solution</FieldLabel>
                  <ul className="space-y-1.5 pl-5 list-disc text-[15px] text-white/60 leading-relaxed">
                    {c.components.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <FieldLabel>Tech bucket</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {c.tech.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[11.5px] rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-white/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 rounded-lg border-l-2 border-purple-400 bg-purple-400/[0.06] px-4 py-3.5 space-y-2.5">
                    <p className="text-[13.5px] text-white/70 leading-relaxed">
                      <strong className="text-white">Approach notes.</strong>
                    </p>
                    {c.approach.map((p) => (
                      <p key={p} className="text-[13.5px] text-white/55 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Lessons */}
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-white mb-2">What actually mattered in 2023</h2>
            <p className="text-[15px] text-white/50 max-w-[65ch]">
              Five things, in the order they&apos;d have saved the most time if someone had
              told us on day one.
            </p>
            <ol className="mt-6 divide-y divide-white/8 border-t border-white/8">
              {LESSONS.map((l, i) => (
                <li key={l.title} className="grid grid-cols-[2.4em_1fr] gap-4 py-5">
                  <span className="font-mono text-xl text-purple-300 leading-tight">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-[16px] font-semibold text-white mb-1">{l.title}</h4>
                    <p className="text-[14.5px] text-white/50 leading-relaxed">{l.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section className="mt-14">
            <h2 className="text-2xl font-bold text-white mb-2">Questions I keep getting asked</h2>
            <div className="mt-4 divide-y divide-white/8 border-t border-white/8">
              {FAQS.map((f) => (
                <div key={f.q} className="py-5">
                  <h4 className="text-[16px] font-semibold text-white mb-1.5">{f.q}</h4>
                  <p className="text-[14.5px] text-white/50 leading-relaxed max-w-[65ch]">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer / links */}
          <footer className="mt-16 pt-6 border-t border-white/8">
            <p className="text-[13px] text-white/35 leading-relaxed max-w-[65ch] mb-3">
              Independent, unofficial analysis based on the public SIH26023 / SIH26024 /
              SIH26025 listings as checked on 15 September 2026. Not affiliated with,
              endorsed by, or speaking for the Ministry of Coal, CMPDI, Coal India Limited,
              or the SIH organizing committee.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
              <a
                href="https://github.com/Iammilansoni/MiningNiti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 transition-colors"
              >
                Source on GitHub
              </a>
              <a
                href="https://www.sih.gov.in/sih2026PS"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 transition-colors"
              >
                Official SIH 2026 problem statements
              </a>
            </div>
          </footer>

        </article>
      </main>
      <Footer />
    </div>
  );
}
