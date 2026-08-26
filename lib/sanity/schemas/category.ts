/* eslint-disable @typescript-eslint/no-explicit-any */

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
