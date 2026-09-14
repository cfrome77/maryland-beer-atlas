/* eslint-disable @typescript-eslint/no-explicit-any */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySchema = {
  name: 'category',
  title: 'Category & Style',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Category Name',
      type: 'string',
      description: 'e.g. Dog Friendly, Outdoor Seating, IPA Specialist',
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
      name: 'type',
      title: 'Category Type',
      type: 'string',
      options: {
        list: [
          { title: 'Amenity', value: 'amenity' },
          { title: 'Beer Style', value: 'style' },
          { title: 'Experience / Vibe', value: 'experience' },
        ],
      },
      initialValue: 'amenity',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Editorial Description',
      type: 'text',
      description: 'Curated overview for category and tag landing pages.',
    },
  ],
};
