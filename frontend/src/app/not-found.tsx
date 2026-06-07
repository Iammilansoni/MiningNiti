import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { SectionCard } from '@/components/product/section-card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SectionCard className="max-w-md w-full p-8 text-center flex flex-col items-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
          <Search className="size-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
