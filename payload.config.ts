// payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'

const CMS_URL = process.env.PUBLIC_SITE_URL // e.g. https://cms.skylineroofing-systems.com in prod
const LOCAL_URL = 'http://localhost:3000'
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN // optional: e.g. https://www.skylineroofing-systems.com

const allowlist = [CMS_URL, LOCAL_URL, FRONTEND_ORIGIN].filter(Boolean) as string[]

export default buildConfig({
  // REQUIRED in v3
  secret: process.env.PAYLOAD_SECRET!,

  serverURL: CMS_URL,

  // Allow admin/API requests from your CMS domain, localhost, and optional frontend
  cors: allowlist,
  csrf: allowlist,

  admin: { user: 'users' },

  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [{ name: 'role', type: 'text' }],
    },
    {
      slug: 'media',
      upload: true,
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
        read: () => true,
        create: ({ req }) => !!req.user,
        update: ({ req }) => !!req.user,
        delete: ({ req }) => !!req.user,
      },
      timestamps: true,
    },
  ],

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    schemaName: 'payload',
  }),
})