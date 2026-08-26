/* eslint-disable @typescript-eslint/no-explicit-any */

export const brewerySchema = {
  name: 'brewery',
  title: 'Brewery',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Brewery Identity' },
    { name: 'location', title: 'Location & Contact' },
    { name: 'operations', title: 'Operations & Hours' },
    { name: 'verification', title: 'Data Verification & Provenance' },
    { name: 'editorial', title: 'Editorial & Marketing Content' },
  ],
  fields: [
    // Identity Group
    {
      name: 'name',
      title: 'Brewery Name',
      type: 'string',
      group: 'identity',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'identity',
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
      group: 'identity',
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
      group: 'identity',
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
      name: 'featured',
      title: 'Featured Brewery',
      type: 'boolean',
      group: 'identity',
      initialValue: false,
    },

    // Location Group
    {
      name: 'address',
      title: 'Street Address',
      type: 'string',
      group: 'location',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'location',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'county',
      title: 'County',
      type: 'string',
      group: 'location',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'state',
      title: 'State Code',
      type: 'string',
      group: 'location',
      initialValue: 'MD',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'zipCode',
      title: 'Zip Code',
      type: 'string',
      group: 'location',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      group: 'location',
    },
    {
      name: 'website',
      title: 'Website URL',
      type: 'url',
      group: 'location',
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      group: 'location',
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
      group: 'location',
      fields: [
        { name: 'lat', title: 'Latitude', type: 'number', validation: (Rule: any) => Rule.required() },
        { name: 'lng', title: 'Longitude', type: 'number', validation: (Rule: any) => Rule.required() },
      ],
      validation: (Rule: any) => Rule.required(),
    },

    // Operations Group
    {
      name: 'status',
      title: 'Operating Status',
      type: 'string',
      group: 'operations',
      options: {
        list: [
          { title: 'Open', value: 'Open' },
          { title: 'Temporarily Closed', value: 'Temporarily closed' },
          { title: 'Seasonal', value: 'Seasonal' },
          { title: 'Opening Soon', value: 'Opening soon' },
          { title: 'Relocating', value: 'Relocating' },
          { title: 'Closed', value: 'Closed' },
          { title: 'Contract-only', value: 'Contract-only' },
        ],
      },
      initialValue: 'Open',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'statusUpdatedAt',
      title: 'Status Updated At',
      type: 'date',
      group: 'operations',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    },
    {
      name: 'statusNotes',
      title: 'Status Notes',
      type: 'text',
      group: 'operations',
    },
    {
      name: 'hours',
      title: 'Operating Hours (Legacy Display String)',
      type: 'array',
      group: 'operations',
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
      name: 'structuredHours',
      title: 'Structured Operating Hours',
      type: 'array',
      group: 'operations',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'day',
              title: 'Day',
              type: 'string',
              options: {
                list: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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
              title: 'Opening Periods',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'opens', title: 'Opens At (HH:MM)', type: 'string' },
                    { name: 'closes', title: 'Closes At (HH:MM)', type: 'string' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'holidayExceptions',
      title: 'Holiday and Special Date Exceptions',
      type: 'array',
      group: 'operations',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'date', title: 'Date (YYYY-MM-DD)', type: 'date', validation: (Rule: any) => Rule.required() },
            { name: 'isClosed', title: 'Is Closed', type: 'boolean', initialValue: true },
            {
              name: 'periods',
              title: 'Alternative Hours',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'opens', title: 'Opens At (HH:MM)', type: 'string' },
                    { name: 'closes', title: 'Closes At (HH:MM)', type: 'string' },
                  ],
                },
              ],
            },
            { name: 'notes', title: 'Notes / Holiday Name', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'beerStyles',
      title: 'Specialty Beer Styles',
      type: 'array',
      group: 'operations',
      of: [{ type: 'string' }],
    },
    {
      name: 'amenities',
      title: 'Taproom Amenities',
      type: 'array',
      group: 'operations',
      of: [{ type: 'string' }],
    },

    // Verification Group
    {
      name: 'lastVerified',
      title: 'Last Verified Date',
      type: 'date',
      group: 'verification',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'verificationSource',
      title: 'Verification Source',
      type: 'string',
      group: 'verification',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      group: 'verification',
      options: {
        list: [
          { title: 'Verified', value: 'Verified' },
          { title: 'Needs Review', value: 'Needs Review' },
          { title: 'Community Submitted', value: 'Community Submitted' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'verification',
      title: 'Detailed Field Verifications',
      type: 'object',
      group: 'verification',
      fields: [
        {
          name: 'general',
          title: 'General Profile Verification',
          type: 'object',
          fields: [
            { name: 'verified', type: 'boolean', initialValue: false },
            { name: 'sourceType', type: 'string' },
            { name: 'sourceUrl', type: 'url' },
            { name: 'checkedAt', type: 'date' },
            { name: 'confidence', type: 'string' },
            { name: 'notes', type: 'string' },
          ],
        },
        {
          name: 'hours',
          title: 'Hours Verification',
          type: 'object',
          fields: [
            { name: 'verified', type: 'boolean', initialValue: false },
            { name: 'sourceType', type: 'string' },
            { name: 'sourceUrl', type: 'url' },
            { name: 'checkedAt', type: 'date' },
            { name: 'confidence', type: 'string' },
            { name: 'notes', type: 'string' },
          ],
        },
        {
          name: 'address',
          title: 'Address Verification',
          type: 'object',
          fields: [
            { name: 'verified', type: 'boolean', initialValue: false },
            { name: 'sourceType', type: 'string' },
            { name: 'sourceUrl', type: 'url' },
            { name: 'checkedAt', type: 'date' },
            { name: 'confidence', type: 'string' },
            { name: 'notes', type: 'string' },
          ],
        },
        {
          name: 'amenities',
          title: 'Amenities Verification',
          type: 'object',
          fields: [
            { name: 'verified', type: 'boolean', initialValue: false },
            { name: 'sourceType', type: 'string' },
            { name: 'sourceUrl', type: 'url' },
            { name: 'checkedAt', type: 'date' },
            { name: 'confidence', type: 'string' },
            { name: 'notes', type: 'string' },
          ],
        },
      ],
    },

    // Editorial Group
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'editorial',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Brewery Image',
      type: 'image',
      group: 'editorial',
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
  ],
};
