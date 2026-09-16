/* eslint-disable @typescript-eslint/no-explicit-any */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const guideSchema = {
  name: 'guide',
  title: 'Travel Guide & Editorial Article',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity & Overview' },
    { name: 'editorial', title: 'Rich Content & Media' },
    { name: 'relationships', title: 'Curated References' },
    { name: 'seo', title: 'SEO & Metadata' },
  ],
  fields: [
    {
      name: 'title',
      title: 'Guide Title',
      type: 'string',
      group: 'identity',
      validation: (Rule: any) => Rule.required().min(5).max(120),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'identity',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) =>
        Rule.required().custom((slug: any) => {
          const value = typeof slug === 'string' ? slug : slug?.current;
          if (!value) return 'Slug is required';
          if (!SLUG_REGEX.test(value)) {
            return 'Slug must be lower-case alphanumeric separated by single hyphens';
          }
          return true;
        }),
    },
    {
      name: 'guideType',
      title: 'Guide Type / Focus',
      type: 'string',
      group: 'identity',
      description: 'Categorizes editorial intent (e.g. Brewery Guide, Regional Guide, Trip Planning, Education).',
      options: {
        list: [
          { title: 'Brewery Guide', value: 'brewery_guide' },
          { title: 'Regional Brewery Guide', value: 'regional_guide' },
          { title: 'Trip-Planning Guide', value: 'trip_planning' },
          { title: 'Curated Recommendations', value: 'curated_recommendations' },
          { title: 'Maryland Beer Education', value: 'education' },
        ],
      },
      initialValue: 'brewery_guide',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Summary / Meta Description',
      type: 'text',
      group: 'identity',
      validation: (Rule: any) => Rule.required().min(10).max(500),
    },
    {
      name: 'author',
      title: 'Author Name',
      type: 'string',
      group: 'identity',
      validation: (Rule: any) => Rule.required().min(2),
    },
    {
      name: 'publishDate',
      title: 'Publish Date',
      type: 'string',
      group: 'identity',
      description: 'e.g., May 14, 2025',
      validation: (Rule: any) => Rule.required(),
    },

    // --- EDITORIAL & MEDIA ---
    {
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      group: 'editorial',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.optional(),
    },
    {
      name: 'content',
      title: 'Rich Text Article Content',
      type: 'array',
      group: 'editorial',
      description: 'Flexible Portable Text rich text content supporting blocks, headings, lists, quotes, and inline images.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'URL',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule: any) => Rule.required().uri({ scheme: ['http', 'https'] }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (Rule: any) => Rule.required().min(1).error('Guide content must contain at least one content block'),
    },
    {
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      group: 'editorial',
      description: 'Optional additional photos featured in the guide.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alternative Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
    },
    {
      name: 'tips',
      title: 'Expert Advice / Tips',
      type: 'array',
      group: 'editorial',
      of: [{ type: 'string', validation: (Rule: any) => Rule.required().min(3) }],
    },

    // --- RELATIONSHIPS & CURATION ---
    {
      name: 'region',
      title: 'Maryland Region',
      type: 'string',
      group: 'relationships',
      options: {
        list: [
          { title: 'Capital', value: 'Capital' },
          { title: 'Central', value: 'Central' },
          { title: 'Eastern Shore', value: 'Eastern Shore' },
          { title: 'Southern', value: 'Southern' },
          { title: 'Western', value: 'Western' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'county',
      title: 'County Reference',
      type: 'reference',
      group: 'relationships',
      description: 'Optional reference to the associated County document.',
      to: [{ type: 'county' }],
    },
    {
      name: 'categories',
      title: 'Guide Categories / Topics',
      type: 'array',
      group: 'relationships',
      description: 'References to category documents (e.g. Day Trips, Waterfront Breweries, Beer Styles).',
      of: [
        {
          type: 'reference',
          to: [{ type: 'category' }],
        },
      ],
    },
    {
      name: 'recommendedStops',
      title: 'Recommended Brewery Stops',
      type: 'array',
      group: 'relationships',
      description: 'References to brewery documents featured as stops in this guide. Reuses canonical brewery references without duplicating brewery facts.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'brewery' }],
        },
      ],
    },
    {
      name: 'relatedTrails',
      title: 'Featured / Related Beer Trails',
      type: 'array',
      group: 'relationships',
      description: 'Optional references to beer trails associated with this guide.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'trail' }],
        },
      ],
    },
    {
      name: 'relatedGuides',
      title: 'Related Guides',
      type: 'array',
      group: 'relationships',
      description: 'Optional references to other editorial guides.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'guide' }],
        },
      ],
    },

    // --- SEO METADATA ---
    {
      name: 'seo',
      title: 'SEO Metadata',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Optimized page title for search engines (defaults to guide title if empty).',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Search snippet summary (defaults to guide description if empty).',
        },
        {
          name: 'keywords',
          title: 'Target Keywords',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'ogImage',
          title: 'Open Graph Share Image',
          type: 'image',
          options: { hotspot: true },
        },
        {
          name: 'noIndex',
          title: 'Hide from Search Engines (noindex)',
          type: 'boolean',
          initialValue: false,
        },
      ],
    },
  ],
};
