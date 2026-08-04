import { Brewery, BeerTrail, TravelGuide } from '../types';

export const mockBreweries: Brewery[] = [
  {
    id: 'flying-dog',
    slug: 'flying-dog-brewery',
    name: 'Flying Dog Brewery',
    type: 'Production',
    region: 'Central',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    county: 'Frederick',
    zipCode: '21703',
    phone: '301-694-7899',
    website: 'https://www.flyingdogbrewery.com',
    socialLinks: {
      facebook: 'https://facebook.com/flyingdog',
      instagram: 'https://instagram.com/flyingdogbrewery',
      twitter: 'https://twitter.com/flyingdog'
    },
    coordinates: { lat: 39.3621, lng: -77.4245 },
    description: 'One of the largest craft breweries in Maryland, known for its bold, expressive beers and distinctive label art by Ralph Steadman. Flying Dog is an iconic fixture of the Frederick craft beer scene.',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&q=80&w=800',
    featured: true,
    hours: [
      { day: 'Thursday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Friday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Sunday', hours: '12:00 PM - 8:00 PM' },
    ],
    beerStyles: ['Belgian IPA', 'Imperial IPA', 'IPA', 'Pale Ale', 'Stout'],
    amenities: ['Tasting Room', 'Brewery Tours', 'Outdoor Seating', 'Food Trucks', 'Merch Shop'],
    lastVerified: '2025-05-10'
  },
  {
    id: 'elder-pine',
    slug: 'elder-pine-brewing-and-blending',
    name: 'Elder Pine Brewing & Blending',
    type: 'Farm Brewery',
    region: 'Capital',
    address: '4200 Sundown Rd',
    city: 'Gaithersburg',
    county: 'Montgomery',
    zipCode: '20882',
    phone: '240-477-8051',
    website: 'https://www.elderpine.com',
    socialLinks: {
      instagram: 'https://instagram.com/elderpinebrewing',
      facebook: 'https://facebook.com/elderpine'
    },
    coordinates: { lat: 39.2241, lng: -77.1425 },
    description: 'Nestled on an active pine farm in Montgomery County, Elder Pine blends traditional styles with modern, experimental brewing. Known for crisp lagers, hazy IPAs, and oak-aged wild ales.',
    image: 'https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?auto=format&fit=crop&q=80&w=800',
    featured: true,
    hours: [
      { day: 'Wednesday', hours: '3:00 PM - 9:00 PM' },
      { day: 'Thursday', hours: '3:00 PM - 9:00 PM' },
      { day: 'Friday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Saturday', hours: '11:00 AM - 10:00 PM' },
      { day: 'Sunday', hours: '11:00 AM - 8:00 PM' },
    ],
    beerStyles: ['Double IPA', 'Czech Pilsner', 'Fruited Sour', 'Lager', 'Hazy IPA', 'Wild Ale'],
    amenities: ['Dog Friendly', 'Outdoor Pine Grove', 'Food Trucks', 'Kid Friendly', 'Cans To-Go'],
    lastVerified: '2025-06-01'
  },
  {
    id: 'heavy-seas',
    slug: 'heavy-seas-beer',
    name: 'Heavy Seas Beer',
    type: 'Production',
    region: 'Central',
    address: '4615 Hollins Ferry Rd',
    city: 'Halethorpe',
    county: 'Baltimore County',
    zipCode: '21227',
    phone: '410-247-7822',
    website: 'https://www.hsbeer.com',
    socialLinks: {
      facebook: 'https://facebook.com/heavyseasbeer',
      instagram: 'https://instagram.com/heavyseasbeer',
      twitter: 'https://twitter.com/heavyseasbeer'
    },
    coordinates: { lat: 39.2256, lng: -76.6575 },
    description: 'Founded by craft pioneer Hugh Sisson, Heavy Seas is famous for its pirate-themed beers, particularly Loose Cannon IPA. Located just outside Baltimore, their taproom has been a hub for over two decades.',
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800',
    featured: false,
    hours: [
      { day: 'Friday', hours: '3:00 PM - 10:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Sunday', hours: '12:00 PM - 6:00 PM' },
    ],
    beerStyles: ['American IPA', 'Double IPA', 'Imperial Stout', 'English Pale Ale'],
    amenities: ['Tasting Room', 'Merchandise', 'Outdoor Seating', 'Weekly Events'],
    lastVerified: '2025-04-18'
  },
  {
    id: 'union-craft',
    slug: 'union-craft-brewing',
    name: 'Union Craft Brewing',
    type: 'Production',
    region: 'Central',
    address: '1700 W 41st St',
    city: 'Baltimore',
    county: 'Baltimore City',
    zipCode: '21211',
    phone: '410-467-0290',
    website: 'https://www.unioncraftbrewing.com',
    socialLinks: {
      instagram: 'https://instagram.com/unioncraftbrewing',
      facebook: 'https://facebook.com/unioncraftbrewing'
    },
    coordinates: { lat: 39.3371, lng: -76.6412 },
    description: 'Located at the Union Collective in Baltimore City, Union Craft is an energetic, community-oriented brewery making highly accessible, beautifully crafted beers like Duckpin Pale Ale.',
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=800',
    featured: true,
    hours: [
      { day: 'Wednesday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Thursday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Friday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Sunday', hours: '12:00 PM - 8:00 PM' },
    ],
    beerStyles: ['Pale Ale', 'IPA', 'Altbier', 'Lager', 'Gose'],
    amenities: ['Large Beer Hall', 'Outdoor Plaza', 'Kid Friendly', 'Shared Collective Spaces', 'Food Vendors'],
    lastVerified: '2025-05-22'
  },
  {
    id: 'cushwa',
    slug: 'cushwa-brewing-company',
    name: 'Cushwa Brewing Company',
    type: 'Microbrewery',
    region: 'Western',
    address: '10212 Governor Lane Blvd',
    city: 'Williamsport',
    county: 'Washington',
    zipCode: '21795',
    phone: '301-223-9840',
    website: 'https://cushwabrewing.com',
    socialLinks: {
      instagram: 'https://instagram.com/cushwabrewing',
      facebook: 'https://facebook.com/cushwabrewing'
    },
    coordinates: { lat: 39.5985, lng: -77.8185 },
    description: 'Located in historical Williamsport, Maryland, near the C&O Canal, Cushwa has garnered a national reputation for stellar IPAs, thick fruited sours, and incredibly clean lagers.',
    image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&q=80&w=800',
    featured: false,
    hours: [
      { day: 'Tuesday', hours: '3:00 PM - 9:00 PM' },
      { day: 'Wednesday', hours: '3:00 PM - 9:00 PM' },
      { day: 'Thursday', hours: '11:00 AM - 10:00 PM' },
      { day: 'Friday', hours: '11:00 AM - 10:00 PM' },
      { day: 'Saturday', hours: '11:00 AM - 10:00 PM' },
      { day: 'Sunday', hours: '11:00 AM - 8:00 PM' },
    ],
    beerStyles: ['Hazy IPA', 'Pilsner', 'Fruited Sour', 'Stout', 'Lager'],
    amenities: ['Pizza Kitchen', 'C&O Canal Proximity', 'Outdoor Seating', 'Tasting Room'],
    lastVerified: '2025-06-03'
  },
  {
    id: 'burley-oak',
    slug: 'burley-oak-brewing-company',
    name: 'Burley Oak Brewing Company',
    type: 'Microbrewery',
    region: 'Eastern Shore',
    address: '10016 Old Ocean City Blvd',
    city: 'Berlin',
    county: 'Worcester',
    zipCode: '21811',
    phone: '410-641-2622',
    website: 'https://burleyoak.com',
    socialLinks: {
      instagram: 'https://instagram.com/burleyoak',
      facebook: 'https://facebook.com/burleyoak'
    },
    coordinates: { lat: 38.3228, lng: -75.2215 },
    description: 'Situated in the charming town of Berlin, Maryland near Ocean City, Burley Oak is internationally known for its legendary "J.R.E.A.M." sour series and its deep commitment to sustainable, local ingredients.',
    image: 'https://images.unsplash.com/photo-1608270176050-12ec057de8d8?auto=format&fit=crop&q=80&w=800',
    featured: true,
    hours: [
      { day: 'Monday', hours: '11:00 AM - 11:00 PM' },
      { day: 'Tuesday', hours: '11:00 AM - 11:00 PM' },
      { day: 'Wednesday', hours: '11:00 AM - 11:00 PM' },
      { day: 'Thursday', hours: '11:00 AM - 11:00 PM' },
      { day: 'Friday', hours: '11:00 AM - Midnight' },
      { day: 'Saturday', hours: '11:00 AM - Midnight' },
      { day: 'Sunday', hours: '11:00 AM - 10:00 PM' },
    ],
    beerStyles: ['American Pilsner', 'Fruited Sour', 'IPA', 'Lager', 'Stout'],
    amenities: ['Live Music', 'Rustic Taproom', 'Outdoor Patio', 'Sustainable Focus', 'Local Taproom Specials'],
    lastVerified: '2025-05-15'
  },
  {
    id: 'calvert-brewing',
    slug: 'calvert-brewing-company',
    name: 'Calvert Brewing Company',
    type: 'Production',
    region: 'Southern',
    address: '15850 Commerce Ct',
    city: 'Upper Marlboro',
    county: "Prince George's",
    zipCode: '20774',
    phone: '240-245-4609',
    website: 'https://www.calvertbrewingcompany.com',
    socialLinks: {
      instagram: 'https://instagram.com/calvertbrewing',
      facebook: 'https://facebook.com/calvertbrewing'
    },
    coordinates: { lat: 38.8950, lng: -76.7325 },
    description: "Calvert Brewing is one of Southern Maryland's premiere production facilities. They balance consistent, reliable flagships with a rotation of fun, seasonal releases inside an expansive beer garden.",
    image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=800',
    featured: false,
    hours: [
      { day: 'Thursday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Friday', hours: '3:00 PM - 10:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Sunday', hours: '1:00 PM - 7:00 PM' },
    ],
    beerStyles: ['IPA', 'Amber Ale', 'Spiced Ale', 'Lager', 'Stout'],
    amenities: ['Spacious Taproom', 'Food Trucks', 'Trivia Nights', 'Huge Outdoor Seating Area'],
    lastVerified: '2025-04-30'
  }
];

export const mockTrails: BeerTrail[] = [
  {
    id: 'frederick-beer-adventure',
    slug: 'frederick-beer-adventure',
    name: 'Frederick Beer Adventure',
    description: 'Embark on an exciting journey through Frederick\'s historic streets and industrial hubs. Taste bold IPAs, visit massive production houses, and enjoy the beautiful mountain backdrop.',
    region: 'Central',
    distance: '15 miles',
    duration: 'Full Day',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    highlight: 'Sip bold IPAs at Flying Dog\'s legendary Wedgewood tasting room and view original Steadman artwork.',
    breweries: [
      mockBreweries.find(b => b.id === 'flying-dog')!,
      mockBreweries.find(b => b.id === 'union-craft')!
    ],
    nearbyAttractions: [
      'Historic Downtown Frederick',
      'Carroll Creek Linear Park',
      'Monocacy National Battlefield'
    ],
    difficulty: 'Easy'
  },
  {
    id: 'brewery-hiking-day',
    slug: 'brewery-hiking-day',
    name: 'Brewery + Hiking Day',
    description: 'The ultimate active getaway. Combine scenic trails along the historic C&O Canal or Catoctin Mountain with crisp farm fresh lagers and hop-forward IPAs.',
    region: 'Capital',
    distance: '28 miles',
    duration: '1 Day (Active)',
    image: 'https://images.unsplash.com/photo-1505075119208-fb6348b57729?auto=format&fit=crop&q=80&w=800',
    highlight: 'Sip a crisp, farm-brewed Czech Pilsner under a serene pine grove after a satisfying hike.',
    breweries: [
      mockBreweries.find(b => b.id === 'elder-pine')!,
      mockBreweries.find(b => b.id === 'cushwa')!
    ],
    nearbyAttractions: [
      'C&O Canal National Historical Park',
      'Sugarloaf Mountain',
      'Catoctin Mountain Park'
    ],
    difficulty: 'Challenging'
  },
  {
    id: 'chesapeake-bay-beer-weekend',
    slug: 'chesapeake-bay-beer-weekend',
    name: 'Chesapeake Bay Beer Weekend',
    description: 'A relaxing weekend trip across the bay bridge. Pair sun, sand, and coastal views with legendary sour beers, coastal pale ales, and premium outdoor beer gardens.',
    region: 'Eastern Shore',
    distance: '45 miles',
    duration: '2-3 Days (Weekend)',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    highlight: 'Enjoy a world-famous J.R.E.A.M. sour beer in the charming, historic streets of Berlin.',
    breweries: [
      mockBreweries.find(b => b.id === 'burley-oak')!,
      mockBreweries.find(b => b.id === 'calvert-brewing')!
    ],
    nearbyAttractions: [
      'Assateague Island National Seashore',
      'Historic Berlin Historic District',
      'Ocean City Boardwalk'
    ],
    difficulty: 'Moderate'
  }
];

export const mockGuides: TravelGuide[] = [
  {
    slug: 'beers-of-eastern-shore',
    title: 'A Weekend Beer Guide to Maryland\'s Eastern Shore',
    description: 'Sun, sand, and sours! Discover how to pair a perfect coastal getaway with the legendary brewing community of Maryland\'s Eastern Shore, from historic Berlin to the boardwalk of Ocean City.',
    author: 'Maryland Explorer',
    publishDate: 'May 14, 2025',
    region: 'Eastern Shore',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    recommendedStops: [
      mockBreweries.find(b => b.id === 'burley-oak')!
    ],
    tips: [
      'Stop in Berlin, MD—voted "America\'s Coolest Small Town"—and stroll the historic streets prior to visiting Burley Oak.',
      'Check the taproom releases ahead of time: the J.R.E.A.M. sour series is highly coveted and can sell out early.',
      'Always have a designated driver or use rideshare services when traveling between Berlin and Ocean City.'
    ],
    content: `
      <p>Maryland's Eastern Shore is famous for its blue crabs, sandy beaches, and relaxed, slow-paced lifestyle. But over the last decade, it has also quietely transformed into an international beacon for craft beer lovers.</p>

      <h3>The Gem of Berlin: Burley Oak</h3>
      <p>Your journey begins in Berlin, Maryland, located just fifteen minutes west of Ocean City's bustling boardwalk. Berlin represents classic Eastern Shore architecture and hospitality. At the heart of this town is Burley Oak Brewing Company.</p>
      <p>Burley Oak operates on a simple philosophy: produce high-quality, craft beverages using local ingredients and sustainable practices. They have built an incredibly loyal, global following around their fruited sours, but their traditional IPAs and pilsners are equally exceptional.</p>

      <h3>Beaches and Beyond</h3>
      <p>After sampling the local drafts in Berlin, make your way to the coast. Ocean City offers miles of clean beaches and a world-renowned boardwalk. The sea air pairs perfectly with Maryland's crisp craft pilsners and fruity ales. It makes for an unbeatable weekend escape.</p>
    `
  },
  {
    slug: 'frederick-historic-brews',
    title: 'Historic Sips: Touring Frederick\'s Industrial Breweries',
    description: 'Dive deep into the rich historic and industrial craft beer hub of Frederick, MD. Home to massive production spaces and amazing mountain vistas.',
    author: 'Brewmaster Pete',
    publishDate: 'June 2, 2025',
    region: 'Central',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    recommendedStops: [
      mockBreweries.find(b => b.id === 'flying-dog')!,
      mockBreweries.find(b => b.id === 'cushwa')!
    ],
    tips: [
      'Bring your hiking shoes—Frederick is flanked by beautiful state parks like Catoctin Mountain and Sugarloaf, perfect for pre-beer adventures.',
      'Frederick\'s historic downtown is highly walkable with unique restaurants, boutiques, and historic buildings along Carroll Creek.'
    ],
    content: `
      <p>Frederick, Maryland holds a legendary place in East Coast brewing history. It blends a gorgeous, historic downtown canal with expansive industrial facilities that supply delicious beer across the entire Mid-Atlantic.</p>

      <h3>The Giants of Frederick</h3>
      <p>Flying Dog Brewery stands as an imposing, beloved anchor of this community. Step into their Wedgewood tasting room to see walls decorated with original Ralph Steadman paintings, and experience their highly experimental small-batch behaviors alongside classic offerings like Raging Bitch IPA.</p>

      <h3>Heading West to Cushwa</h3>
      <p>A short drive west takes you into Williamsport, where Cushwa Brewing operates. Cushwa sits near the C&O Canal national historical park, making it the perfect final destination after a day of cycling or walking along the Potomac River. Their incredibly hazy IPAs are widely regarded as some of the finest in the state.</p>
    `
  }
];
