// payload.config.ts
import { buildConfig } from 'payload/config'
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  serverURL: process.env.PUBLIC_SITE_URL, // http://localhost:3000 in dev
  cors: ['http://localhost:3000'],
  csrf: ['http://localhost:3000'],

  admin: { user: 'users' },

  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [{ name: 'role', type: 'text' }],
    },
    {
      slug: 'media',
      upload: true,               // keep your existing Media collection if you had one
      fields: [],
    },
    {
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', unique: true, required: true },
        { name: 'body', type: 'richText' },
        { name: 'publishedAt', type: 'date' },
      ],
      access: {
        read: () => true,                 // public can read
        create: ({ req }) => !!req.user,  // only logged-in admin can write
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
      },
      timestamps: true,
    },
  ],

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    schemaName: 'payload', // keep Payload tables isolated
  }),
})