import React from 'react';
import { ShieldCheck, AlertTriangle, Users, Clock, AlertCircle, HelpCircle } from 'lucide-react';
import { Brewery } from '@/lib/types';
import { isBreweryOpenNow, OpenNowStatus } from '@/lib/utils/hours';
import { getDataFreshnessInfo, DataFreshnessInfo } from '@/lib/utils/freshness';

interface BreweryStatusBadgeProps {
  brewery: Brewery;
  targetDate?: Date;
  showDetail?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BreweryStatusBadge({
  brewery,
  targetDate,
  showDetail = false,
  size = 'md',
  className = '',
}: BreweryStatusBadgeProps) {
  const openStatus: OpenNowStatus = isBreweryOpenNow(brewery, targetDate);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  // 1. Open Now
  if (openStatus.category === 'open' && openStatus.isOpen) {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-full border bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 backdrop-blur-xs ${sizeClasses} ${className}`}
        aria-label={`Status: Open Now. ${openStatus.nextChange || ''}`}
      >
        <span className={`rounded-full bg-emerald-500 animate-pulse shrink-0 ${dotSizes}`} aria-hidden="true" />
        <span>Open Now</span>
        {showDetail && openStatus.nextChange && (
          <span className="font-medium text-emerald-700/80 dark:text-emerald-300/80">
            • {openStatus.nextChange}
          </span>
        )}
      </span>
    );
  }

  // 2. Closed Now
  if (openStatus.category === 'open' && !openStatus.isOpen) {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full border bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30 backdrop-blur-xs ${sizeClasses} ${className}`}
        aria-label={`Status: Closed Now. ${openStatus.reason || ''}`}
      >
        <span className={`rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0 ${dotSizes}`} aria-hidden="true" />
        <span>Closed Now</span>
        {showDetail && openStatus.reason && (
          <span className="font-normal text-zinc-500 dark:text-zinc-400 truncate max-w-[160px]">
            • {openStatus.reason}
          </span>
        )}
      </span>
    );
  }

  // 3. Closed Permanently
  if (openStatus.category === 'permanently_closed') {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-full border bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 backdrop-blur-xs ${sizeClasses} ${className}`}
        aria-label={`Status: Closed Permanently. ${brewery.status}`}
      >
        <AlertCircle className={`text-rose-600 dark:text-rose-400 shrink-0 ${iconSizes}`} aria-hidden="true" />
        <span>Closed Permanently</span>
      </span>
    );
  }

  // 4. Temporarily Closed
  if (openStatus.category === 'temporarily_closed') {
    const displayLabel =
      brewery.status === 'Seasonal'
        ? 'Seasonal Closure'
        : brewery.status === 'Opening soon'
        ? 'Opening Soon'
        : 'Temporarily Closed';

    return (
      <span
        className={`inline-flex items-center font-bold rounded-full border bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/30 backdrop-blur-xs ${sizeClasses} ${className}`}
        aria-label={`Status: ${displayLabel}. ${brewery.status}`}
      >
        <Clock className={`text-amber-600 dark:text-amber-400 shrink-0 ${iconSizes}`} aria-hidden="true" />
        <span>{displayLabel}</span>
      </span>
    );
  }

  // 5. Hours Unavailable
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20 backdrop-blur-xs ${sizeClasses} ${className}`}
      aria-label="Status: Hours Unavailable"
    >
      <HelpCircle className={`text-zinc-400 shrink-0 ${iconSizes}`} aria-hidden="true" />
      <span>Hours Unavailable</span>
    </span>
  );
}

interface BreweryFreshnessBadgeProps {
  brewery: Partial<Brewery>;
  targetDate?: Date;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BreweryFreshnessBadge({
  brewery,
  targetDate,
  size = 'md',
  className = '',
}: BreweryFreshnessBadgeProps) {
  const freshness: DataFreshnessInfo = getDataFreshnessInfo(brewery, targetDate);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const badge = freshness.verificationBadge;

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border backdrop-blur-xs ${badge.colorClass} ${sizeClasses} ${className}`}
      aria-label={`Data Freshness: ${badge.label}. ${freshness.freshnessSummary}`}
      title={freshness.freshnessSummary}
    >
      {freshness.freshnessCategory === 'fresh' && (
        <ShieldCheck className={`shrink-0 text-emerald-600 dark:text-emerald-400 ${iconSizes}`} aria-hidden="true" />
      )}
      {(freshness.freshnessCategory === 'stale' || freshness.freshnessCategory === 'outdated') && (
        <AlertTriangle className={`shrink-0 ${freshness.freshnessCategory === 'outdated' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'} ${iconSizes}`} aria-hidden="true" />
      )}
      {freshness.freshnessCategory === 'unverified' && (
        <Users className={`shrink-0 text-zinc-500 dark:text-zinc-400 ${iconSizes}`} aria-hidden="true" />
      )}
      <span>{badge.label}</span>
    </span>
  );
}
