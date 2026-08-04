import Link from 'next/link';
import { Beer, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-50 group">
              <div className="bg-amber-500 text-zinc-950 p-1.5 rounded-lg group-hover:bg-amber-600 transition-colors">
                <Beer className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-base tracking-tight">
                Maryland <span className="text-amber-500">Beer Atlas</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              Establishing the ultimate guide to Maryland&apos;s vibrant craft beer community. Explore farm breweries, dynamic beer trails, and historic taprooms across our great state.
            </p>
          </div>

          {/* Directory Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/breweries" className="hover:text-amber-500 transition-colors">
                  Brewery Directory
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-amber-500 transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/trails" className="hover:text-amber-500 transition-colors">
                  Curated Beer Trails
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-amber-500 transition-colors">
                  Travel Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Social Placeholder */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider mb-4">
              About
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
              Maryland Beer Atlas is a modern, responsive showcase built using the latest Next.js features and Tailwind CSS.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 my-8" />

        {/* Copyright and signature */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            &copy; {currentYear} Maryland Beer Atlas. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>for Maryland Craft Beer.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
