import React from 'react';
import { Navigation, ExternalLink } from 'lucide-react';
import { Brewery, BreweryCoordinates } from '@/lib/types';
import { getDirectionsUrls, hasValidCoordinates } from '@/lib/utils/directions';

export type DirectionsVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'compact';
export type DirectionsSize = 'sm' | 'md' | 'lg';
export type PreferredMapApp = 'google' | 'apple' | 'both';

export interface BreweryDirectionsActionProps {
  brewery: Partial<Brewery> & {
    name?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    coordinates?: BreweryCoordinates | null;
  };
  variant?: DirectionsVariant;
  size?: DirectionsSize;
  preferredApp?: PreferredMapApp;
  label?: string;
  ariaLabel?: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * Checks if the brewery has enough verified location data (valid coordinates or non-empty address fields)
 * to construct a safe directions destination without fabricating data.
 */
export function hasDirectionsDestination(
  brewery?: Partial<Brewery> & {
    name?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    coordinates?: BreweryCoordinates | null;
  } | null
): boolean {
  if (!brewery) return false;
  if (hasValidCoordinates(brewery.coordinates)) return true;

  // If coordinates are missing or invalid, check for verified address fields
  const hasName = Boolean(brewery.name && brewery.name.trim().length > 0);
  const hasAddress = Boolean(brewery.address && brewery.address.trim().length > 0);
  const hasCity = Boolean(brewery.city && brewery.city.trim().length > 0);

  return hasName || hasAddress || hasCity;
}

export function BreweryDirectionsAction({
  brewery,
  variant = 'primary',
  size = 'md',
  preferredApp = 'google',
  label = 'Get Directions',
  ariaLabel,
  showIcon = true,
  className = '',
}: BreweryDirectionsActionProps) {
  if (!hasDirectionsDestination(brewery)) {
    return null;
  }

  const directions = getDirectionsUrls(brewery);

  // Styling maps
  const baseClasses =
    'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 shrink-0 active:scale-95 cursor-pointer select-none';

  const sizeClasses: Record<DirectionsSize, string> = {
    sm: 'text-[11px] py-1 px-2.5 rounded-lg gap-1 min-h-[32px]',
    md: 'text-xs py-2 px-3.5 rounded-xl gap-1.5 min-h-[40px]',
    lg: 'text-sm py-2.5 px-5 rounded-xl gap-2 min-h-[44px]',
  };

  const variantClasses: Record<DirectionsVariant, string> = {
    primary:
      'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-sm shadow-amber-500/20 active:bg-amber-700',
    secondary:
      'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700',
    outline:
      'bg-transparent hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/60',
    ghost:
      'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold',
    compact:
      'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] py-1 px-2.5 rounded-lg gap-1 border border-amber-500/20',
  };

  const iconSizes: Record<DirectionsSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const name = brewery.name || 'brewery';
  const calculatedAriaLabel =
    ariaLabel ||
    `${label} to ${name}${directions.hasValidCoords ? ' using exact coordinates' : ' using verified address'}`;

  if (preferredApp === 'both') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <a
          href={directions.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} to ${name} via Google Maps`}
          title={`Get directions to ${name} via Google Maps`}
          className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
        >
          {showIcon && <Navigation className={`${iconSizes[size]} text-current`} />}
          <span>{label} (Google)</span>
        </a>
        <a
          href={directions.appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} to ${name} via Apple Maps`}
          title={`Get directions to ${name} via Apple Maps`}
          className={`${baseClasses} ${sizeClasses[size]} ${variantClasses['secondary']}`}
        >
          {showIcon && <ExternalLink className={`${iconSizes[size]} text-current`} />}
          <span>Apple Maps</span>
        </a>
      </div>
    );
  }

  const href = preferredApp === 'apple' ? directions.appleMapsUrl : directions.googleMapsUrl;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={calculatedAriaLabel}
      title={`${label} to ${name}`}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {showIcon && (
        preferredApp === 'apple' ? (
          <ExternalLink className={`${iconSizes[size]} text-current`} />
        ) : (
          <Navigation className={`${iconSizes[size]} text-current`} />
        )
      )}
      <span>{label}</span>
    </a>
  );
}
