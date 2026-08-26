/* eslint-disable @typescript-eslint/no-explicit-any */

export const brewerySchema = {
  name: 'brewery',
  title: 'Brewery Editorial Content',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity & Reference' },
    { name: 'editorial', title: 'Editorial & Storytelling' },
    { name: 'curation', title: 'Curation & Recommendations' },
    { name: 'relationships', title: 'Related Content & Classifications' },
  ],
  fields: [
    // Identity & Reference Group (Links Sanity editorial record to canonical domain entity)
    {
      name: 'name',
      title: 'Brewery Name',
      type: 'string',
      group: 'identity',
      description: 'The display name of the brewery for Sanity Studio reference.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'identity',
      description: 'Matches the canonical brewery slug for URL routing.',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'breweryId',
      title: 'Canonical Brewery ID',
      type: 'string',
      group: 'identity',
      description: 'Unique stable identifier matching the canonical brewery domain record.',
      validation: (Rule: any) => Rule.required(),
    },

    // Editorial & Storytelling Group
    {
      name: 'description',
      title: 'Editorial Description',
      type: 'text',
      group: 'editorial',
      description: 'Curated narrative description highlighting history, craft, and visitor experience.',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'highlights',
      title: 'Brewery Highlights',
      type: 'array',
      group: 'editorial',
      description: 'Key highlights and unique features (e.g. Scenic beer garden, Historic timber barn).',
      of: [{ type: 'string' }],
    },
    {
      name: 'atmosphere',
      title: 'Atmosphere & Style',
      type: 'array',
      group: 'editorial',
      description: 'Descriptive ambiance and style tags (e.g. Industrial Chic, Family Friendly).',
      of: [{ type: 'string' }],
    },
    {
      name: 'image',
      title: 'Editorial Photo',
      type: 'image',
      group: 'editorial',
      description: 'Featured high-resolution imagery showcasing the brewery exterior or taproom.',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },

    // Curation & Editorial Recommendations Group
    {
      name: 'featured',
      title: 'Featured Editorial Listing',
      type: 'boolean',
      group: 'curation',
      description: 'Flag to highlight this brewery in featured editorial showcases.',
      initialValue: false,
    },
    {
      name: 'editorialRecommendations',
      title: 'Editorial Recommendations & Staff Picks',
      type: 'array',
      group: 'curation',
      description: 'Curated staff picks, recommended beers, food pairings, or best visiting times.',
      of: [
        {
          type: 'object',
          title: 'Recommendation',
          fields: [
            {
              name: 'category',
              title: 'Recommendation Category',
              type: 'string',
              options: {
                list: [
                  { title: 'Must-Try Beer', value: 'beer' },
                  { title: 'Food Pairing / Bite', value: 'food' },
                  { title: 'Best Time to Visit', value: 'timing' },
                  { title: 'Local Tip', value: 'tip' },
                ],
              },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'title',
              title: 'Title / Item',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'notes',
              title: 'Editorial Notes',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'curatedContent',
      title: 'Curated Content & Badges',
      type: 'object',
      group: 'curation',
      description: 'Editorial tags, badges, and curated notes assigned by editors.',
      fields: [
        {
          name: 'editorNotes',
          title: 'Editor Notes',
          type: 'text',
        },
        {
          name: 'curatedTags',
          title: 'Curated Tags',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    },

    // Relationships & Editorial Classifications Group
    {
      name: 'categories',
      title: 'Categories & Styles',
      type: 'array',
      group: 'relationships',
      description: 'Editorial categories, amenities, or style tags linked to this brewery.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'category' }],
        },
      ],
    },
    {
      name: 'county',
      title: 'County Reference',
      type: 'reference',
      group: 'relationships',
      description: 'Reference to the County editorial document.',
      to: [{ type: 'county' }],
    },
  ],
};
