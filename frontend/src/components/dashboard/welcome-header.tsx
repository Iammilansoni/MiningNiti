import { PageHeader } from '@/components/product/page-header';

export function WelcomeHeader() {
  // In a real app, this would get the user's name from Clerk
  const firstName = 'Alex';
  
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Good morning, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in your workspace today.
        </p>
      </div>
      <div className="text-sm font-medium text-muted-foreground">
        {today}
      </div>
    </div>
  );
}
