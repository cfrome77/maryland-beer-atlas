/* eslint-disable @typescript-eslint/no-explicit-any */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const trailSchema = {
  name: 'trail',
  title: 'Beer Trail',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Trail Name',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(3).max(100),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule: any) => Rule.required().min(10).max(1500),
    },
    {
      name: 'region',
      title: 'Maryland Region',
      type: 'string',
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
      description: 'Optional reference to the primary County document for this trail.',
      to: [{ type: 'county' }],
    },
    {
      name: 'categories',
      title: 'Trail Categories / Themes',
      type: 'array',
      description: 'Optional references to category documents (e.g. Scenic Drive, Urban Trail).',
      of: [
        {
          type: 'reference',
          to: [{ type: 'category' }],
        },
      ],
    },
    {
      name: 'distance',
      title: 'Distance',
      type: 'string',
      description: 'e.g., 15 miles',
      validation: (Rule: any) => Rule.required().min(2),
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., Full Day, Weekend',
      validation: (Rule: any) => Rule.required().min(2),
    },
    {
      name: 'stops',
      title: 'Itinerary Stops',
      type: 'array',
      description: 'Structured, ordered stops along the trail itinerary with brewery references, optional flags, and stop-specific notes.',
      of: [
        {
          type: 'object',
          name: 'trailStop',
          title: 'Trail Stop',
          fields: [
            {
              name: 'order',
              title: 'Stop Order Number',
              type: 'number',
              validation: (Rule: any) => Rule.required().integer().min(1),
            },
            {
              name: 'brewery',
              title: 'Brewery Reference',
              type: 'reference',
              to: [{ type: 'brewery' }],
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'isOptional',
              title: 'Optional Stop',
              type: 'boolean',
              description: 'Toggle if this stop is an optional detour or alternative on the itinerary.',
              initialValue: false,
            },
            {
              name: 'notes',
              title: 'Stop Notes / Tips',
              type: 'text',
              description: 'Specific advice or recommendations for this stop.',
            },
            {
              name: 'highlight',
              title: 'Stop Highlight',
              type: 'string',
              description: 'Featured highlight or signature offering at this stop.',
            },
            {
              name: 'recommendedDuration',
              title: 'Recommended Duration',
              type: 'string',
              description: 'e.g. 1-2 hours',
            },
            {
              name: 'attractions',
              title: 'Nearby Attractions',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
          preview: {
            select: {
              title: 'brewery.name',
              order: 'order',
              isOptional: 'isOptional',
            },
            prepare(selection: any) {
              const { title, order, isOptional } = selection;
              return {
                title: `#${order || '?'}: ${title || 'Unnamed Brewery'}`,
                subtitle: isOptional ? 'Optional Stop' : 'Required Stop',
              };
            },
          },
        },
      ],
    },
    {
      name: 'breweries',
      title: 'Breweries on the Trail',
      type: 'array',
      description: 'References to brewery editorial documents included on this trail (legacy reference array).',
      of: [
        {
          type: 'reference',
          to: [{ type: 'brewery' }],
        },
      ],
    },
    {
      name: 'notes',
      title: 'Trail Itinerary Notes',
      type: 'text',
      description: 'General trail notes, driving advice, or travel tips for this itinerary.',
    },
    {
      name: 'image',
      title: 'Trail Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'highlight',
      title: 'Trail Highlight',
      type: 'text',
      validation: (Rule: any) => Rule.required().min(5),
    },
    {
      name: 'nearbyAttractions',
      title: 'Nearby Attractions',
      type: 'array',
      of: [{ type: 'string', validation: (Rule: any) => Rule.required().min(2) }],
    },
    {
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      description: 'e.g., Easy, Moderate, Challenging',
      options: {
        list: [
          { title: 'Easy', value: 'Easy' },
          { title: 'Moderate', value: 'Moderate' },
          { title: 'Challenging', value: 'Challenging' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
};
