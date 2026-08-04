import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-zinc-900 text-zinc-50 py-12 md:py-16 border-b border-zinc-800',
        className
      )}
      {...props}
    >
      {/* Decorative nature-inspired gradients for outdoor/adventure feel */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.06),transparent_50%)]" />
        {/* Subtle grid pattern or lines */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3 max-w-3xl">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-zinc-400 font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-amber-500 transition-colors"
                  aria-label="Home"
                >
                  <Home className="w-3.5 h-3.5" />
                </Link>
                {breadcrumbs.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
                    {item.href ? (
                      <Link href={item.href} className="hover:text-amber-500 transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-zinc-300 truncate" aria-current="page">
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Optional Badge */}
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {badge}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none">
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>

          {/* Page Actions (buttons, search, etc) */}
          {actions && (
            <div className="flex flex-wrap gap-3 shrink-0 pt-2 md:pt-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
