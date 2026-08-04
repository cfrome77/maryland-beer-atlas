import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Clock, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BeerTrail } from '@/lib/types';

interface TrailCardProps {
  trail: BeerTrail;
}

export function TrailCard({ trail }: TrailCardProps) {
  return (
    <Card className="group rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-full">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <Image
          src={trail.image}
          alt={trail.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-zinc-950/85 hover:bg-zinc-950/85 text-white backdrop-blur-sm border-none text-[11px] font-semibold py-1 px-3">
            {trail.region} Region
          </Badge>
        </div>
      </div>

      {/* Main card body */}
      <CardContent className="p-8 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-4">
          {/* Quick stats (Distance & Duration & Difficulty) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              {trail.distance}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {trail.duration}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
              {trail.difficulty}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-amber-500 transition-colors leading-tight">
            {trail.name}
          </h3>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3">
            {trail.description}
          </p>

          {/* Nearby Attractions Preview */}
          {trail.nearbyAttractions && trail.nearbyAttractions.length > 0 && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">Nearby Attractions:</span>
              <p className="line-clamp-1">{trail.nearbyAttractions.join(' • ')}</p>
            </div>
          )}

          {/* Highlight Callout Box */}
          {trail.highlight && (
            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 p-4 rounded-2xl flex gap-3 items-start">
              <Star className="w-5 h-5 text-amber-500 fill-current shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="block font-bold text-xs text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">Trail Highlight</span>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-normal">{trail.highlight}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions bar */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs mt-auto">
          <span className="text-zinc-500 dark:text-zinc-400 font-semibold">
            Includes <span className="font-bold text-zinc-800 dark:text-zinc-200">{trail.breweries.length}</span> stops
          </span>
          <Link
            href={`/trails/${trail.slug}`}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white font-bold transition-all inline-flex items-center gap-1.5 border border-zinc-800 shadow-sm"
            aria-label={`Explore ${trail.name} itinerary`}
          >
            Explore Itinerary
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
