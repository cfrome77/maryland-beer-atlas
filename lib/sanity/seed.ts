/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockBreweries, mockTrails, mockGuides } from '../data/mock-data';
import { isSanityConfigured, getSanityWriteClient, getSanityDataset } from './client';
import { BEER_STYLES } from '../constants/beer-styles';

export interface SeedOptions {
  dryRun?: boolean;
  mode?: 'development' | 'production' | 'auto';
  limit?: number;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function htmlStringToPortableText(html: string): any[] {
  const blocks: any[] = [];
  const lines = html
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<h2>/gi, '\n## ')
    .replace(/<\/h2>/gi, '\n')
    .replace(/<h3>/gi, '\n### ')
    .replace(/<\/h3>/gi, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let keyCount = 0;
  for (const line of lines) {
    keyCount++;
    if (line.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        _key: `block_${keyCount}`,
        style: 'h2',
        markDefs: [],
        children: [{ _type: 'span', _key: `span_${keyCount}`, text: line.replace('## ', '') }],
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        _key: `block_${keyCount}`,
        style: 'h3',
        markDefs: [],
        children: [{ _type: 'span', _key: `span_${keyCount}`, text: line.replace('### ', '') }],
      });
    } else {
      const text = line.replace(/<[^>]*>?/gm, '');
      if (text) {
        blocks.push({
          _type: 'block',
          _key: `block_${keyCount}`,
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: `span_${keyCount}`, text }],
        });
      }
    }
  }

  if (blocks.length === 0) {
    blocks.push({
      _type: 'block',
      _key: 'block_default',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 'span_default', text: 'Baseline travel guide article.' }],
    });
  }

  return blocks;
}

export function resolveSeedMode(options?: SeedOptions): 'development' | 'production' {
  if (options?.mode && options.mode !== 'auto') {
    return options.mode;
  }
  const envMode = process.env.SEED_MODE?.toLowerCase();
  if (envMode === 'dev' || envMode === 'development') return 'development';
  if (envMode === 'prod' || envMode === 'production') return 'production';

  const dataset = getSanityDataset();
  if (dataset === 'development') return 'development';
  return 'production';
}

export function generateSanitySeedDocuments(options?: SeedOptions): any[] {
  const documents: any[] = [];
  const effectiveMode = resolveSeedMode(options);

  let targetBreweries = mockBreweries;

  if (effectiveMode === 'development' && !options?.limit) {
    // Select a representative subset of breweries across regions for fast dev testing
    const devSubsetIds = new Set(['flying-dog', 'elder-pine', 'union-craft', 'burley-oak', 'calvert-brewing']);
    targetBreweries = mockBreweries.filter((b) => devSubsetIds.has(b.id));
  } else if (options?.limit && options.limit > 0) {
    targetBreweries = mockBreweries.slice(0, options.limit);
  }

  const selectedBreweryIds = new Set(targetBreweries.map((b) => b.id));

  // Filter Trails & Guides to match selected breweries
  const targetTrails = mockTrails.filter((t) =>
    (t.stops || []).some((s) => selectedBreweryIds.has(s.brewery?.id)) ||
    (t.breweries || []).some((b) => selectedBreweryIds.has(b.id))
  );

  const targetGuides = mockGuides.filter((g) =>
    (g.recommendedStops || []).some((b) => selectedBreweryIds.has(b.id))
  );

  // 1. County Documents
  const countyMap = new Map<string, { name: string; region: string }>();
  for (const b of targetBreweries) {
    if (b.county) {
      const countySlug = slugify(b.county.endsWith('County') || b.county.endsWith('City') ? b.county : `${b.county} County`);
      if (!countyMap.has(countySlug)) {
        countyMap.set(countySlug, {
          name: b.county.endsWith('County') || b.county.endsWith('City') ? b.county : `${b.county} County`,
          region: b.region,
        });
      }
    }
  }

  for (const [slug, info] of countyMap.entries()) {
    documents.push({
      _id: `county-${slug}`,
      _type: 'county',
      name: info.name,
      slug: { _type: 'slug', current: slug },
      region: info.region,
      description: `Editorial guide and overview of the vibrant craft beer scene in ${info.name}, Maryland.`,
    });
  }

  // 2. Category Documents
  const categoryMap = new Map<string, { name: string; type: 'amenity' | 'style' | 'experience' }>();

  // Ensure all canonical BEER_STYLES taxonomy entries are seeded as category style documents
  for (const style of BEER_STYLES) {
    const catSlug = slugify(style);
    if (!categoryMap.has(catSlug)) {
      categoryMap.set(catSlug, { name: style, type: 'style' });
    }
  }

  for (const b of targetBreweries) {
    if (b.amenities) {
      for (const amenity of b.amenities) {
        const catSlug = slugify(amenity);
        if (!categoryMap.has(catSlug)) {
          categoryMap.set(catSlug, { name: amenity, type: 'amenity' });
        }
      }
    }
    if (b.beerStyles) {
      for (const style of b.beerStyles) {
        const catSlug = slugify(style);
        if (!categoryMap.has(catSlug)) {
          categoryMap.set(catSlug, { name: style, type: 'style' });
        }
      }
    }
  }

  for (const [slug, info] of categoryMap.entries()) {
    documents.push({
      _id: `category-${slug}`,
      _type: 'category',
      name: info.name,
      slug: { _type: 'slug', current: slug },
      type: info.type,
      description: `Curated selections and guide entries for ${info.name} in Maryland craft brewing.`,
    });
  }

  // 3. Brewery Editorial Documents
  for (const b of targetBreweries) {
    const countySlug = b.county ? slugify(b.county.endsWith('County') || b.county.endsWith('City') ? b.county : `${b.county} County`) : null;
    const breweryCategories = [
      ...(b.amenities || []).map((a) => ({ _type: 'reference', _ref: `category-${slugify(a)}` })),
      ...(b.beerStyles || []).map((s) => ({ _type: 'reference', _ref: `category-${slugify(s)}` })),
    ];

    documents.push({
      _id: `brewery-${b.id}`,
      _type: 'brewery',
      name: b.name,
      slug: { _type: 'slug', current: b.slug },
      breweryId: b.id,
      postalCode: b.zipCode,
      latitude: b.coordinates?.lat,
      longitude: b.coordinates?.lng,
      description: b.description,
      highlights: b.highlights || ['Local Maryland Craft Brewery', 'Tasting Room Experience'],
      atmosphere: b.atmosphere || ['Welcoming Taproom', 'Community Hub'],
      hours: b.hours || [],
      structuredHours: b.structuredHours || [],
      socialLinks: b.socialLinks || {},
      amenities: b.amenities || [],
      featured: Boolean(b.featured),
      editorialRecommendations: b.editorialRecommendations || [],
      curatedContent: b.curatedContent || {
        editorNotes: `Official editorial entry for ${b.name}.`,
        curatedTags: ['Maryland Craft', 'Local Favorite'],
      },
      county: countySlug ? { _type: 'reference', _ref: `county-${countySlug}` } : undefined,
      categories: breweryCategories,
      ...(b.logo && b.logo.startsWith('image-') ? { logo: { _type: 'image', asset: { _type: 'reference', _ref: b.logo } } } : {}),
      ...(b.image && b.image.startsWith('image-') ? { image: { _type: 'image', asset: { _type: 'reference', _ref: b.image } } } : {}),
    });
  }

  // 4. Trail Documents
  for (const t of targetTrails) {
    const stops = (t.stops || [])
      .filter((stop) => selectedBreweryIds.has(stop.brewery?.id))
      .map((stop) => ({
        _type: 'trailStop',
        order: stop.order,
        brewery: { _type: 'reference', _ref: `brewery-${stop.brewery.id}` },
        isOptional: Boolean(stop.isOptional),
        notes: stop.notes || '',
        highlight: stop.highlight || '',
        recommendedDuration: stop.recommendedDuration || '1-2 Hours',
        attractions: stop.attractions || [],
      }));

    const breweries = (t.breweries || [])
      .filter((b) => selectedBreweryIds.has(b.id))
      .map((b) => ({
        _type: 'reference',
        _ref: `brewery-${b.id}`,
      }));

    const firstStopBrewery = t.stops?.[0]?.brewery;
    documents.push({
      _id: `trail-${t.id}`,
      _type: 'trail',
      name: t.name,
      slug: { _type: 'slug', current: t.slug },
      description: t.description,
      region: t.region,
      postalCode: firstStopBrewery?.zipCode,
      latitude: firstStopBrewery?.coordinates?.lat,
      longitude: firstStopBrewery?.coordinates?.lng,
      distance: t.distance,
      duration: t.duration,
      difficulty: t.difficulty,
      highlight: t.highlight,
      nearbyAttractions: t.nearbyAttractions || [],
      notes: t.notes || '',
      stops,
      breweries,
      ...(t.image && t.image.startsWith('image-') ? { image: { _type: 'image', asset: { _type: 'reference', _ref: t.image } } } : {}),
    });
  }

  // 5. Guide Documents
  for (const g of targetGuides) {
    const recommendedStops = (g.recommendedStops || [])
      .filter((b) => selectedBreweryIds.has(b.id))
      .map((b) => ({
        _type: 'reference',
        _ref: `brewery-${b.id}`,
      }));

    const relatedTrails = (g.relatedTrails || [])
      .filter((t) => targetTrails.some((tt) => tt.id === t.id))
      .map((t) => ({
        _type: 'reference',
        _ref: `trail-${t.id}`,
      }));

    documents.push({
      _id: `guide-${g.slug}`,
      _type: 'guide',
      title: g.title,
      slug: { _type: 'slug', current: g.slug },
      guideType: g.guideType,
      description: g.description,
      author: g.author,
      publishDate: g.publishDate,
      region: g.region,
      tips: g.tips || [],
      seo: g.seo || {
        metaTitle: g.title,
        metaDescription: g.description,
      },
      recommendedStops,
      relatedTrails,
      content: typeof g.content === 'string' ? htmlStringToPortableText(g.content) : g.content,
      ...(g.image && g.image.startsWith('image-') ? { image: { _type: 'image', asset: { _type: 'reference', _ref: g.image } } } : {}),
    });
  }

  return documents;
}

export async function seedSanityDataset(options: SeedOptions = {}) {
  const effectiveMode = resolveSeedMode(options);
  const documents = generateSanitySeedDocuments(options);
  const dataset = getSanityDataset();

  if (options.dryRun || !process.env.SANITY_API_WRITE_TOKEN || !isSanityConfigured()) {
    console.log(`--- Sanity Local Baseline Seeding (Dry-Run / Verification Mode - ${effectiveMode.toUpperCase()} MODE) ---`);
    console.log(`Target Dataset: ${dataset}`);
    console.log(`Seeding Mode: ${effectiveMode}`);
    console.log(`Total Baseline Documents Prepared: ${documents.length}`);

    const byType = documents.reduce((acc, doc) => {
      acc[doc._type] = (acc[doc._type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Document Breakdown:', JSON.stringify(byType, null, 2));

    if (!isSanityConfigured()) {
      console.log('\n[Notice] NEXT_PUBLIC_SANITY_PROJECT_ID is not configured.');
    }
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.log('[Notice] SANITY_API_WRITE_TOKEN is not provided.');
    }
    console.log('To perform live mutation seeding against your Sanity dataset, ensure NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are set.');

    return {
      success: true,
      dryRun: true,
      mode: effectiveMode,
      documentCount: documents.length,
      byType,
      documents,
    };
  }

  console.log(`--- Seeding ${documents.length} baseline documents (${effectiveMode.toUpperCase()} mode) to Sanity dataset "${dataset}" ---`);
  const client = getSanityWriteClient();
  const transaction = client.transaction();

  for (const doc of documents) {
    transaction.createOrReplace(doc);
  }

  const result = await transaction.commit();
  console.log(`Successfully committed baseline Sanity documents in ${effectiveMode} mode. Transaction ID: ${result.transactionId}`);

  return {
    success: true,
    dryRun: false,
    mode: effectiveMode,
    transactionId: result.transactionId,
    documentCount: documents.length,
  };
}
