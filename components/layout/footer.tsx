import Link from 'next/link';
import { Beer, Heart, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-emerald-950/10 dark:border-zinc-800 bg-zinc-950 text-zinc-300">
      {/* Subtle outdoor graphic line/pattern */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-800 via-amber-500 to-amber-700" />

      <div className="container mx-auto px-4 md:px-6 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand Info */}
          <div className="md:col-span-5 space-y-5">
            <Link
              href="/"
              className="flex items-center space-x-2.5 text-zinc-50 group focus-visible:outline-2 focus-visible:outline-amber-500 rounded-lg w-fit"
              aria-label="Maryland Beer Atlas Home"
            >
              <div className="bg-emerald-800 text-amber-400 p-2 rounded-xl group-hover:bg-emerald-900 group-hover:text-amber-300 transition-colors shadow-sm">
                <Beer className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Maryland <span className="text-amber-500">Beer Atlas</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed font-normal">
              Establishing the ultimate curated guide to Maryland&apos;s vibrant craft beer community. Explore beautiful farm breweries, historic taprooms, and dynamic beer trails across our great state.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Mapping local adventure across Maryland</span>
            </div>
          </div>

          {/* Directory Links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-zinc-50 uppercase tracking-widest border-l-2 border-amber-500 pl-2.5">
              Explore Maryland
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/breweries" className="text-zinc-400 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded px-1 -mx-1 py-0.5">
                  Brewery Directory
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-zinc-400 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded px-1 -mx-1 py-0.5">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/trails" className="text-zinc-400 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded px-1 -mx-1 py-0.5">
                  Curated Beer Trails
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-zinc-400 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded px-1 -mx-1 py-0.5">
                  Travel Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Counties & Categories SEO links */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-zinc-50 uppercase tracking-widest border-l-2 border-amber-500 pl-2.5">
              Popular Local Guides
            </h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs font-medium text-zinc-400">
              <li>
                <Link href="/breweries/county/frederick" className="hover:text-amber-400 transition-colors">
                  Frederick County
                </Link>
              </li>
              <li>
                <Link href="/breweries/county/baltimore-city" className="hover:text-amber-400 transition-colors">
                  Baltimore City
                </Link>
              </li>
              <li>
                <Link href="/breweries/county/montgomery" className="hover:text-amber-400 transition-colors">
                  Montgomery County
                </Link>
              </li>
              <li>
                <Link href="/breweries/county/baltimore-county" className="hover:text-amber-400 transition-colors">
                  Baltimore County
                </Link>
              </li>
              <li>
                <Link href="/breweries/category/dog-friendly" className="hover:text-amber-400 transition-colors font-semibold text-amber-500">
                  🐕 Dog-Friendly Taprooms
                </Link>
              </li>
              <li>
                <Link href="/breweries/category/farm-brewery" className="hover:text-amber-400 transition-colors">
                  Farm Breweries
                </Link>
              </li>
              <li>
                <Link href="/breweries/category/brewpub" className="hover:text-amber-400 transition-colors">
                  Local Brewpubs
                </Link>
              </li>
              <li>
                <Link href="/breweries/category/microbrewery" className="hover:text-amber-400 transition-colors">
                  Microbreweries
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Social Placeholder */}
          <div className="md:col-span-12 lg:md:col-span-5 space-y-4 hidden md:block">
            {/* Kept minimal or removed to keep grid nice under 12-cols constraint */}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 my-10" />

        {/* Copyright and signature */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; {currentYear} Maryland Beer Atlas. All rights reserved.
          </div>
          <div className="flex items-center space-x-1.5 font-medium">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
            <span>for the Maryland Craft Beer Community.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
