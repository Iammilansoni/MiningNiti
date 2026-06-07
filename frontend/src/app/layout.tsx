import './globals.css';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { QueryProvider } from '@/providers/QueryProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0c10' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'MiningNiti — AI Document Intelligence for Mining Operations',
    template: '%s | MiningNiti',
  },
  description:
    'Enterprise AI document intelligence platform for mining operations, compliance teams, and industrial knowledge workflows. Parse permits, audit safety SOPs, and query regulatory documents with AI-powered citations.',
  keywords: [
    'mining',
    'document intelligence',
    'AI',
    'compliance',
    'industrial analytics',
    'enterprise search',
    'DGMS',
    'mining safety',
    'RAG',
    'regulatory',
  ],
  authors: [{ name: 'MiningNiti' }],
  openGraph: {
    type: 'website',
    siteName: 'MiningNiti',
    title: 'MiningNiti — AI Document Intelligence for Mining Operations',
    description:
      'Enterprise AI platform for mining document intelligence, compliance automation, and regulatory workflows.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiningNiti — AI Document Intelligence for Mining Operations',
    description:
      'Enterprise AI platform for mining document intelligence, compliance automation, and regulatory workflows.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  },
                }}
              />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
