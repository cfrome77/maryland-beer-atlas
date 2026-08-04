import React from 'react';
import { Beer } from 'lucide-react';
import { cn } from '@/lib/utils';

// Basic customizable Skeleton block
type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded bg-zinc-200 dark:bg-zinc-800', className)}
      {...props}
    />
  );
}

// Reusable Brewery Card Skeleton
export function BreweryCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm flex flex-col h-full">
      {/* Image slot */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Content wrapper */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* Footer info skeleton */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between mt-auto">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
}

// Reusable Trail Card Skeleton
export function TrailCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm flex flex-col h-full">
      {/* Image slot */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Body content */}
      <div className="p-8 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-7 w-2/3" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex gap-3">
            <Skeleton className="h-5 w-5 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        </div>

        {/* Action bar skeleton */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between mt-auto">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Skeleton Grid for list loaders
interface LoadingGridProps {
  count?: number;
  type?: 'brewery' | 'trail';
  className?: string;
}

export function LoadingGrid({ count = 3, type = 'brewery', className }: LoadingGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-8', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>
          {type === 'trail' ? <TrailCardSkeleton /> : <BreweryCardSkeleton />}
        </React.Fragment>
      ))}
    </div>
  );
}

// Full page spinner loader
interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Loading atlas details...' }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[50vh]">
      <div className="relative mb-6">
        {/* Decorative background pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" />
        <div className="relative bg-zinc-100 dark:bg-zinc-800 text-amber-500 p-4 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center">
          <Beer className="w-8 h-8 animate-bounce" />
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Please Wait</h4>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
