/* eslint-disable @typescript-eslint/no-explicit-any */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
      validation: (Rule: any) => Rule.required().min(2).max(80),
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
      validation: (Rule: any) => Rule.required().min(10).max(1000),
    },
  ],
};
