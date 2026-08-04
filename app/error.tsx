'use client';

import React, { useEffect } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="py-20 bg-zinc-50 dark:bg-zinc-900 min-h-[70vh] flex flex-col justify-center items-center text-center">
      <PageContainer size="default" className="flex flex-col items-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Something went wrong
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mt-2 mb-8">
          An unexpected error occurred while loading this page. Our team has been notified.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => reset()}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Try Again
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-bold transition-colors border border-zinc-300 dark:border-zinc-700"
          >
            Go Home
          </a>
        </div>
      </PageContainer>
    </div>
  );
}
