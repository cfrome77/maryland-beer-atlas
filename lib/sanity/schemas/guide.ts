/* eslint-disable @typescript-eslint/no-explicit-any */

export const guideSchema = {
  name: 'guide',
  title: 'Travel Guide Article',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Guide Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'author',
      title: 'Author Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'publishDate',
      title: 'Publish Date',
      type: 'string',
      description: 'e.g., May 14, 2025',
      validation: (Rule: any) => Rule.required(),
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
      name: 'content',
      title: 'Article Content (HTML or Text)',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'recommendedStops',
      title: 'Recommended Brewery Stops',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'brewery' }],
        },
      ],
    },
    {
      name: 'tips',
      title: 'Expert Advice / Tips',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
};
