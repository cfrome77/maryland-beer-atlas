import React from 'react';
import { LoadingPage } from '@/components/ui/loading-state';

export default function RootLoading() {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-[80vh] flex flex-col justify-center items-center">
      <LoadingPage message="Loading Maryland Beer Atlas..." />
    </div>
  );
}
