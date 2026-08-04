import { Brewery, BeerTrail, TravelGuide } from '../types';

export const mockBreweries: Brewery[] = [
  {
    id: 'flying-dog',
    name: 'Flying Dog Brewery',
    type: 'Production',
    region: 'Central',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    zipCode: '21703',
    phone: '301-694-7899',
    website: 'https://www.flyingdogbrewery.com',
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
    beers: [
      { name: 'Raging Bitch', style: 'Belgian IPA', abv: 8.3, description: 'An American IPA with Belgian yeast notes of banana and pear.' },
      { name: 'The Truth', style: 'Imperial IPA', abv: 8.7, description: 'Sharp hop bitterness with heavy pine and citrus notes.' },
      { name: 'Snake Dog', style: 'IPA', abv: 7.1, description: 'A classic Colorado-style IPA brewed with Columbus and Warrior hops.' }
    ],
    amenities: ['Tasting Room', 'Brewery Tours', 'Outdoor Seating', 'Food Trucks', 'Merch Shop']
  },
  {
    id: 'elder-pine',
    name: 'Elder Pine Brewing & Blending',
    type: 'Farm Brewery',
    region: 'Capital',
    address: '4200 Sundown Rd',
    city: 'Gaithersburg',
    zipCode: '20882',
    phone: '240-477-8051',
    website: 'https://www.elderpine.com',
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
    beers: [
      { name: 'Trophy Tree', style: 'Double IPA', abv: 8.2, description: 'Hazy and aromatic, packed with Citra, Mosaic, and El Dorado hops.' },
      { name: 'Under the Canopy', style: 'Czech Pilsner', abv: 4.8, description: 'Traditional bohemian pilsner, naturally carbonated and lagered for months.' },
      { name: 'Pineapple Sour', style: 'Fruited Sour', abv: 6.0, description: 'Tart, refreshing ale bursting with real pineapple and tropical vibes.' }
    ],
    amenities: ['Dog Friendly', 'Outdoor Pine Grove', 'Food Trucks', 'Kid Friendly', 'Cans To-Go']
  },
  {
    id: 'heavy-seas',
    name: 'Heavy Seas Beer',
    type: 'Production',
    region: 'Central',
    address: '4615 Hollins Ferry Rd',
    city: 'Halethorpe',
    zipCode: '21227',
    phone: '410-247-7822',
    website: 'https://www.hsbeer.com',
    coordinates: { lat: 39.2256, lng: -76.6575 },
    description: 'Founded by craft pioneer Hugh Sisson, Heavy Seas is famous for its pirate-themed beers, particularly Loose Cannon IPA. Located just outside Baltimore, their taproom has been a hub for over two decades.',
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800',
    featured: false,
    hours: [
      { day: 'Friday', hours: '3:00 PM - 10:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Sunday', hours: '12:00 PM - 6:00 PM' },
    ],
    beers: [
      { name: 'Loose Cannon', style: 'American IPA', abv: 7.2, description: 'Triple-hopped with notes of pine, citrus, and a balanced malt spine.' },
      { name: 'Double Cannon', style: 'Double IPA', abv: 9.5, description: 'A massive, hop-forward tribute to their flagship, with extra strength and piney warmth.' },
      { name: 'Peg Leg', style: 'Imperial Stout', abv: 8.0, description: 'A dark, roasted malt profile with rich chocolate and espresso flavors.' }
    ],
    amenities: ['Tasting Room', 'Merchandise', 'Outdoor Seating', 'Weekly Events']
  },
  {
    id: 'union-craft',
    name: 'Union Craft Brewing',
    type: 'Production',
    region: 'Central',
    address: '1700 W 41st St',
    city: 'Baltimore',
    zipCode: '21211',
    phone: '410-467-0290',
    website: 'https://www.unioncraftbrewing.com',
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
    beers: [
      { name: 'Duckpin', style: 'Pale Ale', abv: 5.5, description: 'Generously hopped, with a smooth malt character. Bold yet infinitely crushable.' },
      { name: 'Divine', style: 'IPA', abv: 6.5, description: 'An evergreen, classic IPA with a dry finish and robust hops.' },
      { name: 'Balt-Altbier', style: 'Altbier', abv: 5.0, description: 'A traditional German-style brown ale with toasted malt notes and clean lager-like finish.' }
    ],
    amenities: ['Large Beer Hall', 'Outdoor Plaza', 'Kid Friendly', 'Shared Collective Spaces', 'Food Vendors']
  },
  {
    id: 'cushwa',
    name: 'Cushwa Brewing Company',
    type: 'Microbrewery',
    region: 'Western',
    address: '10212 Governor Lane Blvd',
    city: 'Williamsport',
    zipCode: '21795',
    phone: '301-223-9840',
    website: 'https://cushwabrewing.com',
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
    beers: [
      { name: 'Cush', style: 'Hazy IPA', abv: 6.5, description: 'Citra and Mosaic hops craft an intensely juicy and tropical profile.' },
      { name: 'Canal Crossing', style: 'Pilsner', abv: 5.2, description: 'Crisp, light, cracker-like malt flavor with a touch of noble hops.' },
      { name: 'Sour Fusion', style: 'Fruited Sour', abv: 7.0, description: 'A velvety sour packed with raspberry, blackberry, and vanilla.' }
    ],
    amenities: ['Pizza Kitchen', 'C&O Canal Proximity', 'Outdoor Seating', 'Tasting Room']
  },
  {
    id: 'burley-oak',
    name: 'Burley Oak Brewing Company',
    type: 'Microbrewery',
    region: 'Eastern Shore',
    address: '10016 Old Ocean City Blvd',
    city: 'Berlin',
    zipCode: '21811',
    phone: '410-641-2622',
    website: 'https://burleyoak.com',
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
    beers: [
      { name: 'Bilsner', style: 'American Pilsner', abv: 4.2, description: 'A super crisp pilsner brewed with Maryland-grown barley.' },
      { name: 'Double Strawberry J.R.E.A.M.', style: 'Fruited Sour', abv: 7.0, description: 'Double dry-hopped sour ale with strawberry, lactose, and vanilla.' },
      { name: 'Aboriginal Gangster', style: 'IPA', abv: 6.5, description: 'Brewed with Nelson Sauvin and Motueka hops for white wine and grape flavors.' }
    ],
    amenities: ['Live Music', 'Rustic Taproom', 'Outdoor Patio', 'Sustainable Focus', 'Local Taproom Specials']
  },
  {
    id: 'calvert-brewing',
    name: 'Calvert Brewing Company',
    type: 'Production',
    region: 'Southern',
    address: '15850 Commerce Ct',
    city: 'Upper Marlboro',
    zipCode: '20774',
    phone: '240-245-4609',
    website: 'https://www.calvertbrewingcompany.com',
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
    beers: [
      { name: 'Excellent Adventure', style: 'IPA', abv: 7.0, description: 'Citrus-forward West Coast style IPA with clean bitterness.' },
      { name: 'I-95', style: 'Amber Ale', abv: 5.4, description: 'Caramel malt sweetness balanced nicely with light floral hops.' },
      { name: 'Autumn Frost', style: 'Spiced Ale', abv: 6.2, description: 'Brewed with cinnamon, nutmeg, and vanilla for cozy seasonal vibes.' }
    ],
    amenities: ['Spacious Taproom', 'Food Trucks', 'Trivia Nights', 'Huge Outdoor Seating Area']
  }
];

export const mockTrails: BeerTrail[] = [
  {
    id: 'charm-city-craft',
    name: 'Baltimore Charm City Trail',
    description: 'Explore the exciting, industrious beer scene of Baltimore. From the creative enclave of Hampden to the sprawling brewing collective in Halethorpe, this trail offers rich history, delicious local food vendors, and world-class craft beverages.',
    region: 'Central',
    distance: '12 miles',
    duration: 'Full Day',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    highlight: 'Experience the active Union Collective featuring artisanal local crafts, ice cream, climbing, and brilliant brews.',
    breweries: [
      mockBreweries.find(b => b.id === 'union-craft')!,
      mockBreweries.find(b => b.id === 'heavy-seas')!
    ]
  },
  {
    id: 'capital-beltway-brews',
    name: 'Capital Farm & Forest Trail',
    description: 'Get out of the suburbs and breathe in the fresh air of Maryland\'s rural farm breweries. Montgomery and Prince George\'s counties offer rich pine forests, rustic tasting barns, and exceptional agricultural brews made directly from locally sourced crops.',
    region: 'Capital',
    distance: '24 miles',
    duration: 'Weekend Trip',
    image: 'https://images.unsplash.com/photo-1505075119208-fb6348b57729?auto=format&fit=crop&q=80&w=800',
    highlight: 'Sip a crisp, fresh lager under a beautiful grove of pines at Montgomery County\'s premium farm brewery.',
    breweries: [
      mockBreweries.find(b => b.id === 'elder-pine')!,
      mockBreweries.find(b => b.id === 'calvert-brewing')!
    ]
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
      <p>Flying Dog Brewery stands as an imposing, beloved anchor of this community. Step into their Wedgewood tasting room to see walls decorated with original Ralph Steadman paintings, and experience their highly experimental small-batch beers alongside classic offerings like Raging Bitch IPA.</p>

      <h3>Heading West to Cushwa</h3>
      <p>A short drive west takes you into Williamsport, where Cushwa Brewing operates. Cushwa sits near the C&O Canal national historical park, making it the perfect final destination after a day of cycling or walking along the Potomac River. Their incredibly hazy IPAs are widely regarded as some of the finest in the state.</p>
    `
  }
];
