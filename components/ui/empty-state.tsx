import React from 'react';
import { Beer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'search' | 'beer' | React.ReactNode;
}

export function EmptyState({
  title = 'No Results Found',
  description = "We couldn't find anything matching your filters or search criteria. Try modifying your filters or search terms.",
  actionLabel,
  onAction,
  icon = 'search',
  ...props
}: EmptyStateProps) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (icon === 'beer') {
      return <Beer className="w-8 h-8 text-amber-500" />;
    }
    return <Search className="w-8 h-8 text-amber-500" />;
  };

  return (
    <div
      className="text-center py-16 px-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850 max-w-lg mx-auto space-y-5 shadow-sm"
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
        {renderIcon()}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            onClick={onAction}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all h-auto cursor-pointer"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
