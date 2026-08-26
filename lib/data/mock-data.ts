import { Brewery, BeerTrail, TravelGuide } from '../types';

export const mockBreweries: Brewery[] = [
  {
    id: 'flying-dog',
    slug: 'flying-dog-brewery',
    name: 'Flying Dog Brewery',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    statusUpdatedAt: '2025-05-10',
    statusNotes: 'Normal taproom operating hours.',
    address: '4607 Wedgewood Blvd',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
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
    structuredHours: [
      { day: 'Thursday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '12:00', closes: '20:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true },
      { day: 'Wednesday', isClosed: true }
    ],
    holidayExceptions: [
      { date: '2025-12-25', isClosed: true, notes: 'Christmas Day closure' }
    ],
    beerStyles: ['Belgian IPA', 'Imperial IPA', 'IPA', 'Pale Ale', 'Stout'],
    amenities: ['Tasting Room', 'Brewery Tours', 'Outdoor Seating', 'Food Trucks', 'Merch Shop'],
    lastVerified: '2025-05-10',
    verificationSource: 'Official Website & Socials',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Official Website', sourceUrl: 'https://www.flyingdogbrewery.com', checkedAt: '2025-05-10', confidence: 'High' },
      hours: { verified: true, sourceType: 'Official Website', sourceUrl: 'https://www.flyingdogbrewery.com/visit', checkedAt: '2025-05-10', confidence: 'High' },
      address: { verified: true, sourceType: 'Official Website', checkedAt: '2025-05-10', confidence: 'High' },
      amenities: { verified: true, sourceType: 'Social Media', sourceUrl: 'https://instagram.com/flyingdogbrewery', checkedAt: '2025-05-09', confidence: 'Medium' }
    }
  },
  {
    id: 'monocacy',
    slug: 'monocacy-brewing-company',
    name: 'Monocacy Brewing Company',
    type: 'Microbrewery',
    region: 'Central',
    status: 'Open',
    statusUpdatedAt: '2025-06-15',
    statusNotes: 'Taproom is open to visitors and outdoor patio seating is available.',
    address: '1783 N Market St',
    city: 'Frederick',
    county: 'Frederick',
    state: 'MD',
    zipCode: '21701',
    phone: '240-457-4232',
    website: 'https://monocacybrewing.com',
    socialLinks: {
      instagram: 'https://instagram.com/monocacybrewing',
      facebook: 'https://facebook.com/monocacybrewing'
    },
    coordinates: { lat: 39.4292, lng: -77.4045 },
    description: 'Tucked away in Frederick\'s historic district, Monocacy Brewing prides itself on producing high-quality craft beers with local Maryland ingredients, creating a true sense of place and community.',
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=800',
    featured: true,
    hours: [
      { day: 'Thursday', hours: '4:00 PM - 8:00 PM' },
      { day: 'Friday', hours: '3:00 PM - 9:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 9:00 PM' },
      { day: 'Sunday', hours: '12:00 PM - 6:00 PM' },
    ],
    structuredHours: [
      { day: 'Thursday', isClosed: false, periods: [{ opens: '16:00', closes: '20:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '15:00', closes: '21:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '12:00', closes: '21:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '12:00', closes: '18:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true },
      { day: 'Wednesday', isClosed: true }
    ],
    holidayExceptions: [],
    beerStyles: ['Pilsner', 'Hazy IPA', 'Red Ale', 'Stout'],
    amenities: ['Tasting Room', 'Outdoor Seating', 'Kid Friendly', 'Dog Friendly'],
    lastVerified: '2025-06-15',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Official Website', sourceUrl: 'https://monocacybrewing.com', checkedAt: '2025-06-15', confidence: 'High' },
      hours: { verified: true, sourceType: 'Official Website', checkedAt: '2025-06-15', confidence: 'High' }
    }
  },
  {
    id: 'elder-pine',
    slug: 'elder-pine-brewing-and-blending',
    name: 'Elder Pine Brewing & Blending',
    type: 'Farm Brewery',
    region: 'Capital',
    status: 'Open',
    statusUpdatedAt: '2025-06-01',
    address: '4200 Sundown Rd',
    city: 'Gaithersburg',
    county: 'Montgomery',
    state: 'MD',
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
    structuredHours: [
      { day: 'Wednesday', isClosed: false, periods: [{ opens: '15:00', closes: '21:00' }] },
      { day: 'Thursday', isClosed: false, periods: [{ opens: '15:00', closes: '21:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '11:00', closes: '22:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '11:00', closes: '20:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true }
    ],
    beerStyles: ['Double IPA', 'Czech Pilsner', 'Fruited Sour', 'Lager', 'Hazy IPA', 'Wild Ale'],
    amenities: ['Dog Friendly', 'Outdoor Pine Grove', 'Food Trucks', 'Kid Friendly', 'Cans To-Go'],
    lastVerified: '2025-06-01',
    verificationSource: 'Brewery Management',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Direct Communication', checkedAt: '2025-06-01', confidence: 'High', notes: 'Verified via representative email.' }
    }
  },
  {
    id: 'streetcar82',
    slug: 'streetcar-82-brewing-co',
    name: 'Streetcar 82 Brewing Co.',
    type: 'Microbrewery',
    region: 'Capital',
    status: 'Open',
    statusUpdatedAt: '2025-06-20',
    address: '4824 Rhode Island Ave',
    city: 'Hyattsville',
    county: "Prince George's",
    state: 'MD',
    zipCode: '20781',
    phone: '240-770-6644',
    website: 'https://www.streetcar82brewing.com',
    socialLinks: {
      instagram: 'https://instagram.com/streetcar82brewing',
      facebook: 'https://facebook.com/streetcar82'
    },
    coordinates: { lat: 38.9482, lng: -76.9405 },
    description: 'A neighborhood microbrewery situated in historic Hyattsville. Streetcar 82 is proudly Deaf-owned and operated, offering a beautiful community-focused taproom and classic Belgian and American beer styles.',
    image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&q=80&w=800',
    featured: true,
    hours: [
      { day: 'Wednesday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Thursday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Friday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 10:00 PM' },
      { day: 'Sunday', hours: '12:00 PM - 7:00 PM' },
    ],
    structuredHours: [
      { day: 'Wednesday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Thursday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '12:00', closes: '19:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true }
    ],
    beerStyles: ['Belgian Witbier', 'Saison', 'IPA', 'Dry Stout'],
    amenities: ['Outdoor Seating', 'Deaf-Friendly / ASL', 'Kid Friendly', 'Dog Friendly', 'Food Trucks'],
    lastVerified: '2025-06-20',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Official Website', sourceUrl: 'https://www.streetcar82brewing.com', checkedAt: '2025-06-20', confidence: 'High' }
    }
  },
  {
    id: 'franklins',
    slug: 'franklins-brewery',
    name: "Franklin's Brewery",
    type: 'Brewpub',
    region: 'Capital',
    status: 'Open',
    statusUpdatedAt: '2025-06-21',
    address: '5123 Baltimore Ave',
    city: 'Hyattsville',
    county: "Prince George's",
    state: 'MD',
    zipCode: '20781',
    phone: '301-927-2740',
    website: 'https://franklinsbrewery.com',
    socialLinks: {
      instagram: 'https://instagram.com/franklinsbrewery',
      facebook: 'https://facebook.com/franklinsbrewpub'
    },
    coordinates: { lat: 38.9525, lng: -76.9398 },
    description: "Franklin's is Prince George's County's first microbrewery and the only brewery/toy store/general store in the world! Serving up award-winning hand-crafted beers and local food in an incredibly fun, eclectic space.",
    image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=800',
    featured: false,
    hours: [
      { day: 'Monday', hours: '11:00 AM - 9:30 PM' },
      { day: 'Tuesday', hours: '11:00 AM - 9:30 PM' },
      { day: 'Wednesday', hours: '11:00 AM - 9:30 PM' },
      { day: 'Thursday', hours: '11:00 AM - 9:30 PM' },
      { day: 'Friday', hours: '11:00 AM - 10:30 PM' },
      { day: 'Saturday', hours: '11:00 AM - 10:30 PM' },
      { day: 'Sunday', hours: '11:00 AM - 9:00 PM' },
    ],
    structuredHours: [
      { day: 'Monday', isClosed: false, periods: [{ opens: '11:00', closes: '21:30' }] },
      { day: 'Tuesday', isClosed: false, periods: [{ opens: '11:00', closes: '21:30' }] },
      { day: 'Wednesday', isClosed: false, periods: [{ opens: '11:30', closes: '14:00' }, { opens: '17:00', closes: '21:30' }] },
      { day: 'Thursday', isClosed: false, periods: [{ opens: '11:00', closes: '21:30' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '11:00', closes: '22:30' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '11:00', closes: '22:30' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '11:00', closes: '21:00' }] }
    ],
    beerStyles: ['IPA', 'Stout', 'Lager', 'Porter', 'Sour'],
    amenities: ['Full Food Menu', 'General Store / Toy Shop', 'Kid Friendly', 'Tasting Flight', 'Togo Cans'],
    lastVerified: '2025-06-21',
    verificationSource: 'Brewery Management',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Direct Communication', checkedAt: '2025-06-21', confidence: 'High' }
    }
  },
  {
    id: 'heavy-seas',
    slug: 'heavy-seas-beer',
    name: 'Heavy Seas Beer',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    statusUpdatedAt: '2025-04-18',
    address: '4615 Hollins Ferry Rd',
    city: 'Halethorpe',
    county: 'Baltimore County',
    state: 'MD',
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
    structuredHours: [
      { day: 'Friday', isClosed: false, periods: [{ opens: '15:00', closes: '22:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '12:00', closes: '18:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true },
      { day: 'Wednesday', isClosed: true },
      { day: 'Thursday', isClosed: true }
    ],
    beerStyles: ['American IPA', 'Double IPA', 'Imperial Stout', 'English Pale Ale'],
    amenities: ['Tasting Room', 'Merchandise', 'Outdoor Seating', 'Weekly Events'],
    lastVerified: '2025-04-18',
    verificationSource: 'Community Report',
    verificationStatus: 'Community Submitted',
    verification: {
      general: { verified: true, sourceType: 'Community Report', checkedAt: '2025-04-18', confidence: 'Low' }
    }
  },
  {
    id: 'union-craft',
    slug: 'union-craft-brewing',
    name: 'Union Craft Brewing',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    statusUpdatedAt: '2025-05-22',
    address: '1700 W 41st St',
    city: 'Baltimore',
    county: 'Baltimore City',
    state: 'MD',
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
    structuredHours: [
      { day: 'Wednesday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Thursday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '12:00', closes: '20:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true }
    ],
    beerStyles: ['Pale Ale', 'IPA', 'Altbier', 'Lager', 'Gose'],
    amenities: ['Large Beer Hall', 'Outdoor Plaza', 'Kid Friendly', 'Shared Collective Spaces', 'Food Vendors'],
    lastVerified: '2025-05-22',
    verificationSource: 'Official Website & Socials',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Official Website', sourceUrl: 'https://www.unioncraftbrewing.com', checkedAt: '2025-05-22', confidence: 'High' }
    }
  },
  {
    id: 'peabody',
    slug: 'peabody-heights-brewery',
    name: 'Peabody Heights Brewery',
    type: 'Production',
    region: 'Central',
    status: 'Open',
    statusUpdatedAt: '2025-06-18',
    address: '401 E 30th St',
    city: 'Baltimore',
    county: 'Baltimore City',
    state: 'MD',
    zipCode: '21218',
    phone: '410-467-7837',
    website: 'https://peabodyheightsbrewery.com',
    socialLinks: {
      instagram: 'https://instagram.com/peabodyheightsbrewery',
      facebook: 'https://facebook.com/peabodyheightsbrewery'
    },
    coordinates: { lat: 39.3248, lng: -76.6111 },
    description: 'Located on the historic site of Old Oriole Park in Baltimore\'s Charles Village/Abell neighborhood, Peabody Heights is a co-op style production brewery producing delicious, community-minded craft beers and retro-themed sours.',
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=800',
    featured: true,
    hours: [
      { day: 'Wednesday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Thursday', hours: '4:00 PM - 9:00 PM' },
      { day: 'Friday', hours: '12:00 PM - 11:00 PM' },
      { day: 'Saturday', hours: '12:00 PM - 11:00 PM' },
      { day: 'Sunday', hours: '12:00 PM - 8:00 PM' },
    ],
    structuredHours: [
      { day: 'Wednesday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Thursday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '12:00', closes: '23:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '12:00', closes: '23:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '12:00', closes: '20:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true }
    ],
    beerStyles: ['IPA', 'Lager', 'Sour', 'Stout', 'Pilsner'],
    amenities: ['Tasting Room', 'Spacious Beer Garden', 'Kid Friendly', 'Arcade Games', 'Historic Memorabilia'],
    lastVerified: '2025-06-18',
    verificationSource: 'Official Website',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Official Website', sourceUrl: 'https://peabodyheightsbrewery.com', checkedAt: '2025-06-18', confidence: 'High' }
    }
  },
  {
    id: 'cushwa',
    slug: 'cushwa-brewing-company',
    name: 'Cushwa Brewing Company',
    type: 'Microbrewery',
    region: 'Western',
    status: 'Seasonal',
    statusUpdatedAt: '2025-06-03',
    statusNotes: 'Hours change during peak summer and winter seasons. Check socials for announcements.',
    address: '10212 Governor Lane Blvd',
    city: 'Williamsport',
    county: 'Washington',
    state: 'MD',
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
    structuredHours: [
      { day: 'Tuesday', isClosed: false, periods: [{ opens: '15:00', closes: '21:00' }] },
      { day: 'Wednesday', isClosed: false, periods: [{ opens: '15:00', closes: '21:00' }] },
      { day: 'Thursday', isClosed: false, periods: [{ opens: '11:00', closes: '22:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '11:00', closes: '22:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '11:00', closes: '22:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '11:00', closes: '20:00' }] },
      { day: 'Monday', isClosed: true }
    ],
    beerStyles: ['Hazy IPA', 'Pilsner', 'Fruited Sour', 'Stout', 'Lager'],
    amenities: ['Pizza Kitchen', 'C&O Canal Proximity', 'Outdoor Seating', 'Tasting Room'],
    lastVerified: '2025-06-03',
    verificationSource: 'Outdated Info Alert',
    verificationStatus: 'Needs Review',
    verification: {
      general: { verified: false, sourceType: 'Community Report', checkedAt: '2025-06-03', confidence: 'Medium', notes: 'Community members flagged hours changed.' }
    }
  },
  {
    id: 'burley-oak',
    slug: 'burley-oak-brewing-company',
    name: 'Burley Oak Brewing Company',
    type: 'Microbrewery',
    region: 'Eastern Shore',
    status: 'Open',
    statusUpdatedAt: '2025-05-15',
    address: '10016 Old Ocean City Blvd',
    city: 'Berlin',
    county: 'Worcester',
    state: 'MD',
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
    structuredHours: [
      { day: 'Monday', isClosed: false, periods: [{ opens: '11:00', closes: '23:00' }] },
      { day: 'Tuesday', isClosed: false, periods: [{ opens: '11:00', closes: '23:00' }] },
      { day: 'Wednesday', isClosed: false, periods: [{ opens: '11:00', closes: '23:00' }] },
      { day: 'Thursday', isClosed: false, periods: [{ opens: '11:00', closes: '23:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '11:00', closes: '23:59' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '11:00', closes: '23:59' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '11:00', closes: '22:00' }] }
    ],
    beerStyles: ['American Pilsner', 'Fruited Sour', 'IPA', 'Lager', 'Stout'],
    amenities: ['Live Music', 'Rustic Taproom', 'Outdoor Patio', 'Sustainable Focus', 'Local Taproom Specials'],
    lastVerified: '2025-05-15',
    verificationSource: 'Brewery Representative',
    verificationStatus: 'Verified',
    verification: {
      general: { verified: true, sourceType: 'Direct Communication', checkedAt: '2025-05-15', confidence: 'High' }
    }
  },
  {
    id: 'calvert-brewing',
    slug: 'calvert-brewing-company',
    name: 'Calvert Brewing Company',
    type: 'Production',
    region: 'Southern',
    status: 'Opening soon',
    statusUpdatedAt: '2025-04-30',
    statusNotes: 'Undergoing taproom renovations. Grand reopening next month!',
    address: '15850 Commerce Ct',
    city: 'Upper Marlboro',
    county: "Prince George's",
    state: 'MD',
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
    structuredHours: [
      { day: 'Thursday', isClosed: false, periods: [{ opens: '16:00', closes: '21:00' }] },
      { day: 'Friday', isClosed: false, periods: [{ opens: '15:00', closes: '22:00' }] },
      { day: 'Saturday', isClosed: false, periods: [{ opens: '12:00', closes: '22:00' }] },
      { day: 'Sunday', isClosed: false, periods: [{ opens: '13:00', closes: '19:00' }] },
      { day: 'Monday', isClosed: true },
      { day: 'Tuesday', isClosed: true },
      { day: 'Wednesday', isClosed: true }
    ],
    beerStyles: ['IPA', 'Amber Ale', 'Spiced Ale', 'Lager', 'Stout'],
    amenities: ['Spacious Taproom', 'Food Trucks', 'Trivia Nights', 'Huge Outdoor Seating Area'],
    lastVerified: '2025-04-30',
    verificationSource: 'Community Submission Forum',
    verificationStatus: 'Community Submitted',
    verification: {
      general: { verified: true, sourceType: 'Community Report', checkedAt: '2025-04-30', confidence: 'Medium' }
    }
  }
];

export const mockTrails: BeerTrail[] = [
  {
    id: 'frederick-beer-adventure',
    slug: 'frederick-beer-adventure',
    name: 'Frederick City Beer Trail',
    description: 'Embark on an exciting journey through Frederick\'s historic streets and industrial hubs. These outstanding breweries are situated just minutes apart in Frederick, making for a seamless, ultra-local craft adventure with a gorgeous mountain backdrop.',
    region: 'Central',
    distance: '4.5 miles',
    duration: 'Half Day',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    highlight: 'Sip bold IPAs at Flying Dog\'s legendary tasting room and experience Monocacy\'s historic warehouse brewery tour.',
    breweries: [
      mockBreweries.find(b => b.id === 'flying-dog')!,
      mockBreweries.find(b => b.id === 'monocacy')!
    ],
    nearbyAttractions: [
      'Historic Downtown Frederick',
      'Carroll Creek Linear Park',
      'Monocacy National Battlefield'
    ],
    difficulty: 'Easy'
  },
  {
    id: 'hyattsville-beer-trail',
    slug: 'hyattsville-beer-trail',
    name: 'Hyattsville & Route 1 Corridor Trail',
    description: 'A neighborhood craft beer trail in Prince George\'s county, connecting close-knit community taprooms just a block or two apart along the historic Route 1 corridor. Extremely bike and pedestrian-friendly.',
    region: 'Capital',
    distance: '1.2 miles',
    duration: '3-4 Hours',
    image: 'https://images.unsplash.com/photo-1505075119208-fb6348b57729?auto=format&fit=crop&q=80&w=800',
    highlight: 'Walk between Prince George\'s first microbrewery and a vibrant Deaf-owned neighbourhood taproom.',
    breweries: [
      mockBreweries.find(b => b.id === 'streetcar82')!,
      mockBreweries.find(b => b.id === 'franklins')!
    ],
    nearbyAttractions: [
      'Hyattsville Arts District',
      'Anacostia River Trail',
      'University of Maryland Campus'
    ],
    difficulty: 'Easy'
  },
  {
    id: 'baltimore-craft-loop',
    slug: 'baltimore-craft-loop',
    name: 'Baltimore Craft Brewery Loop',
    description: 'Pair Baltimore\'s industrial history with world-class local brewing. These outstanding urban craft breweries are located in the heart of Baltimore City, just a short Uber or bike ride apart.',
    region: 'Central',
    distance: '2.1 miles',
    duration: '4-5 Hours',
    image: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=800',
    highlight: 'Enjoy fresh Duckpin Pale Ale in the Union Collective and retro sours on the historic Old Oriole Park site at Peabody Heights.',
    breweries: [
      mockBreweries.find(b => b.id === 'union-craft')!,
      mockBreweries.find(b => b.id === 'peabody')!
    ],
    nearbyAttractions: [
      'The Union Collective',
      'Charles Village Historic District',
      'Johns Hopkins University Campus'
    ],
    difficulty: 'Easy'
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
      mockBreweries.find(b => b.id === 'monocacy')!
    ],
    tips: [
      'Bring your hiking shoes—Frederick is flanked by beautiful state parks like Catoctin Mountain and Sugarloaf, perfect for pre-beer adventures.',
      'Frederick\'s historic downtown is highly walkable with unique restaurants, boutiques, and historic buildings along Carroll Creek.'
    ],
    content: `
      <p>Frederick, Maryland holds a legendary place in East Coast brewing history. It blends a gorgeous, historic downtown canal with expansive industrial facilities that supply delicious beer across the entire Mid-Atlantic.</p>

      <h3>The Giants of Frederick</h3>
      <p>Flying Dog Brewery stands as an imposing, beloved anchor of this community. Step into their Wedgewood tasting room to see walls decorated with original Ralph Steadman paintings, and experience their highly experimental small-batch behaviors alongside classic offerings like Raging Bitch IPA.</p>

      <h3>Heading West to Monocacy</h3>
      <p>A short drive takes you to Monocacy Brewing. Monocacy is situated inside a beautifully converted historic warehouse building, producing crisp beers using locally grown Maryland hops and malts.</p>
    `
  }
];
