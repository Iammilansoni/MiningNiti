import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShinyText } from '@/components/reactbits';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="text-[150px] font-black tracking-tighter text-emerald-500 blur-sm">404</span>
          </div>
          
          <div className="relative flex justify-center pb-6">
            <div className="w-24 h-24 bg-card border border-border shadow-2xl rounded-2xl flex items-center justify-center -rotate-6 transition-transform hover:rotate-0 duration-300">
              <FileQuestion className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight">
            <ShinyText>Page not found</ShinyText>
          </h1>
          <p className="text-muted-foreground text-lg max-w-[300px] mx-auto">
            We searched deep in the mines, but couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 relative z-10">
          <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
