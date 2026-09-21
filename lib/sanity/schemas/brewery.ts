/* eslint-disable @typescript-eslint/no-explicit-any */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const brewerySchema = {
  name: 'brewery',
  title: 'Brewery Editorial Content',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity & Reference' },
    { name: 'editorial', title: 'Editorial & Storytelling' },
    { name: 'operations', title: 'Operating Hours & Contact' },
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
      validation: (Rule: any) => Rule.required().min(2).max(100),
    },
    {
      name: 'postalCode',
      title: 'Postal Code',
      type: 'string',
      group: 'identity',
      description: '5-digit or 9-digit postal / ZIP code for geocoding and proximity searching.',
      validation: (Rule: any) =>
        Rule.custom((postalCode: any) => {
          if (!postalCode) return true;
          return /^\d{5}(-\d{4})?$/.test(postalCode) || 'Postal code must be a valid 5-digit or 9-digit US ZIP code';
        }),
    },
    {
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      group: 'identity',
      description: 'Geographic latitude coordinate (-90 to 90).',
      validation: (Rule: any) => Rule.min(-90).max(90),
    },
    {
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      group: 'identity',
      description: 'Geographic longitude coordinate (-180 to 180).',
      validation: (Rule: any) => Rule.min(-180).max(180),
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
      validation: (Rule: any) =>
        Rule.required().custom((slug: any) => {
          const value = typeof slug === 'string' ? slug : slug?.current;
          if (!value) return 'Slug is required';
          if (!SLUG_REGEX.test(value)) {
            return 'Slug must be lower-case alphanumeric separated by single hyphens (e.g. "flying-dog-brewery")';
          }
          return true;
        }),
    },
    {
      name: 'breweryId',
      title: 'Canonical Brewery ID',
      type: 'string',
      group: 'identity',
      description: 'Unique stable identifier matching the canonical brewery domain record.',
      validation: (Rule: any) =>
        Rule.required()
          .regex(/^[a-z0-9-]+$/, { name: 'lowercase-hyphenated' })
          .error('Canonical Brewery ID must be lower-case alphanumeric with hyphens'),
    },

    // Editorial & Storytelling Group
    {
      name: 'description',
      title: 'Editorial Description',
      type: 'text',
      group: 'editorial',
      description: 'Curated narrative description highlighting history, craft, and visitor experience.',
      validation: (Rule: any) => Rule.required().min(10).max(2000),
    },
    {
      name: 'highlights',
      title: 'Brewery Highlights',
      type: 'array',
      group: 'editorial',
      description: 'Key highlights and unique features (e.g. Scenic beer garden, Historic timber barn).',
      of: [{ type: 'string', validation: (Rule: any) => Rule.required().min(2) }],
      validation: (Rule: any) => Rule.max(10),
    },
    {
      name: 'atmosphere',
      title: 'Atmosphere & Style',
      type: 'array',
      group: 'editorial',
      description: 'Descriptive ambiance and style tags (e.g. Industrial Chic, Family Friendly).',
      of: [{ type: 'string', validation: (Rule: any) => Rule.required().min(2) }],
      validation: (Rule: any) => Rule.max(10),
    },
    {
      name: 'image',
      title: 'Exterior / Taproom Photo',
      type: 'image',
      group: 'editorial',
      description: 'Featured high-resolution imagery showcasing the brewery exterior or taproom.',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.optional(),
    },
    {
      name: 'logo',
      title: 'Brewery Logo',
      type: 'image',
      group: 'editorial',
      description: 'Official brewery brand logo image with optional crop and hotspot positioning.',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.optional(),
    },

    // Operating Hours & Contact Group
    {
      name: 'hours',
      title: 'Operating Hours Summary',
      type: 'array',
      group: 'operations',
      description: 'Human-readable daily operating hours summary (e.g. Thu-Sun: 11am-10pm).',
      of: [
        {
          type: 'object',
          title: 'Daily Hours Summary',
          fields: [
            { name: 'day', title: 'Day / Days', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'hours', title: 'Hours Specification', type: 'string', validation: (Rule: any) => Rule.required() },
          ],
        },
      ],
    },
    {
      name: 'structuredHours',
      title: 'Structured Operating Hours',
      type: 'array',
      group: 'operations',
      description: 'Granular structured daily operating hours with open and close time periods.',
      of: [
        {
          type: 'object',
          title: 'Daily Operating Hours',
          fields: [
            {
              name: 'day',
              title: 'Day of Week',
              type: 'string',
              options: {
                list: [
                  { title: 'Monday', value: 'Monday' },
                  { title: 'Tuesday', value: 'Tuesday' },
                  { title: 'Wednesday', value: 'Wednesday' },
                  { title: 'Thursday', value: 'Thursday' },
                  { title: 'Friday', value: 'Friday' },
                  { title: 'Saturday', value: 'Saturday' },
                  { title: 'Sunday', value: 'Sunday' },
                ],
              },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'isClosed',
              title: 'Is Closed',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'periods',
              title: 'Operating Periods',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'opens',
                      title: 'Opens (24h format HH:MM)',
                      type: 'string',
                      validation: (Rule: any) =>
                        Rule.regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { name: '24h time format' }).error(
                          'Opening time must be in 24-hour HH:MM format (e.g. 11:00)'
                        ),
                    },
                    {
                      name: 'closes',
                      title: 'Closes (24h format HH:MM)',
                      type: 'string',
                      validation: (Rule: any) =>
                        Rule.regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { name: '24h time format' }).error(
                          'Closing time must be in 24-hour HH:MM format (e.g. 22:00)'
                        ),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      group: 'operations',
      description: 'Official social media presence links for the brewery.',
      fields: [
        {
          name: 'facebook',
          title: 'Facebook URL',
          type: 'url',
          validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
        },
        {
          name: 'instagram',
          title: 'Instagram URL',
          type: 'url',
          validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
        },
        {
          name: 'twitter',
          title: 'Twitter / X URL',
          type: 'url',
          validation: (Rule: any) => Rule.uri({ scheme: ['http', 'https'] }),
        },
      ],
    },
    {
      name: 'amenities',
      title: 'Amenity Tags',
      type: 'array',
      group: 'operations',
      description: 'Amenity and facility tags (e.g. Outdoor Seating, Dog Friendly, Food Trucks, Taproom).',
      of: [{ type: 'string', validation: (Rule: any) => Rule.required().min(2) }],
      validation: (Rule: any) => Rule.max(20),
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
              validation: (Rule: any) => Rule.required().min(2),
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
