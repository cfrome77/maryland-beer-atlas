import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brewery } from '@/lib/types';

interface BreweryCardProps {
  brewery: Brewery;
}

export function BreweryCard({ brewery }: BreweryCardProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:shadow-lg transition-all flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <Image
          src={brewery.image}
          alt={brewery.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant="secondary" className="bg-zinc-900/85 hover:bg-zinc-900/85 text-white backdrop-blur-sm border-none text-[11px] font-semibold py-0.5 px-2.5">
            {brewery.type}
          </Badge>
          {brewery.featured && (
            <Badge className="bg-amber-500 hover:bg-amber-500 text-zinc-950 font-bold border-none text-[11px] py-0.5 px-2.5 shadow-sm">
              Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Content wrapper */}
      <CardContent className="p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            <span>{brewery.region} Region</span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400">{brewery.county}</span>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors leading-snug">
            {brewery.name}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-2">
            {brewery.description}
          </p>

          {/* Styles Focus */}
          <div className="flex flex-wrap gap-1 pt-1">
            {brewery.beerStyles.slice(0, 3).map((style) => (
              <span key={style} className="text-[10px] font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded px-1.5 py-0.5">
                {style}
              </span>
            ))}
            {brewery.beerStyles.length > 3 && (
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 self-center pl-1">
                +{brewery.beerStyles.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer info within CardContent */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs mt-auto">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-[110px]">{brewery.city}</span>
            </span>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
              Verified {brewery.lastVerified}
            </span>
          </div>
          <Link
            href={`/breweries/${brewery.slug}`}
            className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors inline-flex items-center gap-1 shrink-0"
            aria-label={`View ${brewery.name} details`}
          >
            View Taproom
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
