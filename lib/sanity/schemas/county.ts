/* eslint-disable @typescript-eslint/no-explicit-any */

export const countySchema = {
  name: 'county',
  title: 'County',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'County Name',
      type: 'string',
      description: 'e.g. Anne Arundel County, Baltimore City',
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
      name: 'description',
      title: 'County Beer Overview',
      type: 'text',
      description: 'Editorial overview of the craft beer culture and history in this county.',
    },
  ],
};
