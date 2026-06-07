'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { SectionCard } from '@/components/product/section-card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app, log to Sentry or similar here
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-background flex items-center justify-center p-4">
        <SectionCard className="max-w-md w-full p-8 text-center flex flex-col items-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            System Error
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            The application encountered a critical error. Our team has been notified.
            <br className="hidden sm:block" />
            Please try reloading the page.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return Home
            </Button>
            <Button onClick={() => reset()}>
              Try Again
            </Button>
          </div>
        </SectionCard>
      </body>
    </html>
  );
}
