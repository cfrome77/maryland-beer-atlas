import React from 'react';
import { GuideType } from '@/lib/types';
import { BookOpen, Compass, Map, Route, Sparkles, GraduationCap } from 'lucide-react';

const GUIDE_TYPE_LABELS: Record<GuideType | 'all', { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'All Guides', icon: BookOpen, color: 'bg-zinc-850 text-white' },
  brewery_guide: { label: 'Brewery Guides', icon: Compass, color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  regional_guide: { label: 'Regional Guides', icon: Map, color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  trip_planning: { label: 'Trip Planning', icon: Route, color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  curated_recommendations: { label: 'Curated Picks', icon: Sparkles, color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  education: { label: 'Beer Education', icon: GraduationCap, color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' },
};

export function GuideTypeBadge({ type }: { type?: GuideType }) {
  const meta = GUIDE_TYPE_LABELS[type || 'brewery_guide'] || GUIDE_TYPE_LABELS.brewery_guide;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {meta.label}
    </span>
  );
}
