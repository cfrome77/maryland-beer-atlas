import Link from 'next/link';
import Image from 'next/image';
import { Beer, Map, Compass, BookOpen, ArrowRight, Star, MapPin } from 'lucide-react';
import { mockBreweries, mockTrails, mockGuides } from '@/lib/data/mock-data';
import { PageContainer } from '@/components/layout/page-container';
import { BreweryCard } from '@/components/ui/brewery-card';

export default function Home() {
  const featuredBreweries = mockBreweries.filter(b => b.featured);
  const regions = ['Capital', 'Central', 'Eastern Shore', 'Southern', 'Western'];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Keep full width for gorgeous landing page splash */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-zinc-900 text-white">
        {/* Abstract background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.06),transparent_40%)]" />

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Star className="w-3.5 h-3.5 fill-current" />
                Maryland Craft Beer Guide
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">
                Explore Maryland&apos;s <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                  Craft Beer Capital
                </span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover local microbreweries, historic taprooms, and beautiful farm breweries. Map your next beer trail adventure and read curated travel guides across Maryland.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/breweries"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-base hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  Explore Directory
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/map"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-800 text-white font-bold text-base hover:bg-zinc-700 transition-colors border border-zinc-700 cursor-pointer"
                >
                  <Map className="w-4 h-4 text-amber-500" />
                  Interactive Map
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block">
              {/* Creative Image/Card stack to look highly polished */}
              <div className="relative w-full aspect-square max-w-[400px] mx-auto">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 rotate-3 opacity-20 blur-xl" />
                <div className="relative rounded-2xl border border-zinc-850 bg-zinc-950 p-6 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Featured Brewery</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Farm Brewery</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Elder Pine Brewing</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                      Nestled on an active pine farm in Montgomery County, Elder Pine blends traditional styles with modern, experimental brewing.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    Gaithersburg, Maryland
                  </div>
                  <Link
                    href="/breweries/elder-pine-brewing-and-blending"
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-sm font-bold transition-all border border-zinc-800 group cursor-pointer"
                  >
                    View Brewery Details
                    <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access/Feature Highlights */}
      <section className="py-16 bg-white dark:bg-zinc-950">
        <PageContainer size="default" className="py-0 md:py-0">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">How to Explore the Atlas</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 font-normal text-sm leading-relaxed">
              We&apos;ve organized Maryland&apos;s rich beer community into simple, engaging modules to help you plan your ideal craft beer journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Beer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Brewery Directory</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                Filter and browse Maryland breweries by region, size, and amenities like outdoor seating and food trucks.
              </p>
              <Link href="/breweries" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                View Directory <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Interactive Map</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                Locate breweries on our interactive map. Plan your route, select regions, and view exact geographical detail.
              </p>
              <Link href="/map" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                View Map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Beer Trails</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                Explore curated beer trails offering scenic drives, rustic farm roads, and stellar itineraries for day trips.
              </p>
              <Link href="/trails" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                View Trails <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Travel Guides</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-normal">
                Read local insider tips, hotel suggestions, historic landmarks, and craft dining pairing ideas.
              </p>
              <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                View Guides <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Featured Breweries */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-850">
        <PageContainer size="default" className="py-0 md:py-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Handpicked Selection</span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">Featured Breweries</h2>
            </div>
            <Link href="/breweries" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline mt-4 sm:mt-0 cursor-pointer">
              See All Breweries <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredBreweries.map((brewery) => (
              <BreweryCard key={brewery.id} brewery={brewery} />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Region Exploration */}
      <section className="py-16 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-850">
        <PageContainer size="default" className="py-0 md:py-0">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Explore Maryland by Region</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 font-normal text-sm leading-relaxed">
              Maryland boasts distinct geographic and cultural regions, each home to a diverse and thriving network of local brewers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {regions.map((region) => {
              const count = mockBreweries.filter(b => b.region === region).length;
              return (
                <Link
                  key={region}
                  href={`/breweries?region=${encodeURIComponent(region)}`}
                  className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-amber-950/20 border border-zinc-200 dark:border-zinc-850 hover:border-amber-300 dark:hover:border-amber-900 transition-all text-center group flex flex-col justify-between cursor-pointer"
                >
                  <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {region}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                    {count} {count === 1 ? 'Brewery' : 'Breweries'}
                  </span>
                </Link>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* Featured Trails and Guides Duo */}
      <section className="py-16 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-850">
        <PageContainer size="default" className="py-0 md:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Trail Promo Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={mockTrails[0].image}
                  alt={mockTrails[0].name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-950">
                    Featured Trail
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{mockTrails[0].distance} • {mockTrails[0].duration}</span>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{mockTrails[0].name}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3 font-normal">
                    {mockTrails[0].description}
                  </p>
                </div>
                <Link
                  href={`/trails/${mockTrails[0].id}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white font-bold text-sm transition-colors border border-zinc-800 cursor-pointer"
                >
                  Explore Trail Itinerary
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </Link>
              </div>
            </div>

            {/* Guide Promo Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={mockGuides[0].image}
                  alt={mockGuides[0].title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-950">
                    Latest Travel Guide
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">By {mockGuides[0].author} • {mockGuides[0].publishDate}</span>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{mockGuides[0].title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3 font-normal">
                    {mockGuides[0].description}
                  </p>
                </div>
                <Link
                  href={`/guides/${mockGuides[0].slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white font-bold text-sm transition-colors border border-zinc-800 cursor-pointer"
                >
                  Read Travel Guide
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
