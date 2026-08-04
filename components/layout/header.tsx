'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Beer, Map, Compass, BookOpen, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks: NavLink[] = [
    { href: '/breweries', label: 'Breweries', icon: <Beer className="w-4 h-4 shrink-0" /> },
    { href: '/map', label: 'Interactive Map', icon: <Map className="w-4 h-4 shrink-0" /> },
    { href: '/trails', label: 'Beer Trails', icon: <Compass className="w-4 h-4 shrink-0" /> },
    { href: '/guides', label: 'Travel Guides', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-950/10 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-sm transition-all">
      {/* Visual Adventure Accent Line: Deep forest green to warm amber */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-700 via-amber-500 to-amber-600" />

      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-6xl">
        {/* Brand/Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2.5 text-zinc-900 dark:text-zinc-50 group focus-visible:outline-2 focus-visible:outline-amber-500 rounded-lg p-1"
          aria-label="Maryland Beer Atlas Home"
        >
          <div className="bg-emerald-800 text-amber-400 p-2 rounded-xl group-hover:bg-emerald-900 group-hover:text-amber-300 transition-colors shadow-sm">
            <Beer className="w-5 h-5 fill-current" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Maryland <span className="text-amber-600 dark:text-amber-500">Beer Atlas</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-500',
                  active
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-b-2 border-amber-500 rounded-b-none'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-emerald-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className={cn(active ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 group-hover:text-emerald-800')}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-500 cursor-pointer"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        id="mobile-navigation"
        className={cn(
          'md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[300px] opacity-100 border-t' : 'max-h-0 opacity-0 pointer-events-none'
        )}
      >
        <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all',
                  active
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className={active ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
