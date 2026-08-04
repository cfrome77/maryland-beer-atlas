/* eslint-disable @typescript-eslint/no-explicit-any */

export const trailSchema = {
  name: 'trail',
  title: 'Beer Trail',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Trail Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
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
      name: 'distance',
      title: 'Distance',
      type: 'string',
      description: 'e.g., 15 miles',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., Full Day, Weekend',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'breweries',
      title: 'Breweries on the Trail',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'brewery' }],
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'nearbyAttractions',
      title: 'Nearby Attractions',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      description: 'e.g., Easy, Moderate, Challenging',
      validation: (Rule: any) => Rule.required(),
    },
  ],
};
