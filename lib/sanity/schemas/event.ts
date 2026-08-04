/* eslint-disable @typescript-eslint/no-explicit-any */

export const eventSchema = {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Event Name',
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
      name: 'date',
      title: 'Event Date & Time',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'location',
      title: 'Location / Venue',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'brewery',
      title: 'Associated Brewery',
      type: 'reference',
      to: [{ type: 'brewery' }],
    },
    {
      name: 'image',
      title: 'Event Banner / Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'ticketUrl',
      title: 'Ticket / Info URL',
      type: 'url',
    },
  ],
};
