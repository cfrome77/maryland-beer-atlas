/* eslint-disable @typescript-eslint/no-explicit-any */

export const brewerySchema = {
  name: 'brewery',
  title: 'Brewery',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Brewery Name',
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
      name: 'type',
      title: 'Brewery Type',
      type: 'string',
      options: {
        list: [
          { title: 'Microbrewery', value: 'Microbrewery' },
          { title: 'Brewpub', value: 'Brewpub' },
          { title: 'Production', value: 'Production' },
          { title: 'Farm Brewery', value: 'Farm Brewery' },
        ],
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
      name: 'address',
      title: 'Street Address',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'county',
      title: 'County',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'zipCode',
      title: 'Zip Code',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'website',
      title: 'Website URL',
      type: 'url',
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        { name: 'facebook', title: 'Facebook URL', type: 'url' },
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'twitter', title: 'Twitter URL', type: 'url' },
      ],
    },
    {
      name: 'coordinates',
      title: 'Geographic Coordinates',
      type: 'object',
      fields: [
        { name: 'lat', title: 'Latitude', type: 'number', validation: (Rule: any) => Rule.required() },
        { name: 'lng', title: 'Longitude', type: 'number', validation: (Rule: any) => Rule.required() },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Brewery Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'hours',
      title: 'Operating Hours',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'day', title: 'Day', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'hours', title: 'Hours', type: 'string', validation: (Rule: any) => Rule.required() },
          ],
        },
      ],
    },
    {
      name: 'beerStyles',
      title: 'Specialty Beer Styles',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'amenities',
      title: 'Taproom Amenities',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'featured',
      title: 'Featured Brewery',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'lastVerified',
      title: 'Last Verified Date',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'verificationSource',
      title: 'Verification Source',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      options: {
        list: [
          { title: 'Verified', value: 'Verified' },
          { title: 'Needs Review', value: 'Needs Review' },
          { title: 'Community Submitted', value: 'Community Submitted' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
};
