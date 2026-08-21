'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeHeader() {
  const { user } = useUser();
  const firstName = user?.firstName || 'there';

  // The greeting was hard-coded to "Good morning" at every hour of the day.
  // It is resolved after mount rather than during render because the server
  // renders in its own timezone, and a greeting that differs between the SSR
  // output and the client is a hydration mismatch.
  const [greeting, setGreeting] = useState('Welcome back');
  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);
  
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}, {firstName}
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
