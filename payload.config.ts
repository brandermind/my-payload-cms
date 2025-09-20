// payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'

const isProd = process.env.NODE_ENV === 'production'
const CMS_URL =
  process.env.PUBLIC_SITE_URL
  ?? process.env.NEXT_PUBLIC_SITE_URL
  ?? process.env.URL           // Netlify primary site URL
  ?? process.env.DEPLOY_URL    // Netlify per-deploy URL (fallback)
  ?? (isProd ? undefined : 'http://localhost:3000')

if (isProd && !CMS_URL) {
  throw new Error('CMS_URL is required in production. Set PUBLIC_SITE_URL or NEXT_PUBLIC_SITE_URL in Netlify.')
}

const allowlist = isProd ? [CMS_URL!] : [CMS_URL!, 'http://localhost:3000']

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  serverURL: CMS_URL!,
  cors: allowlist,
  csrf: allowlist,

  admin: { user: 'users' },

  collections: [
    { slug: 'users', auth: true, fields: [{ name: 'role', type: 'text' }] },
    { slug: 'media', upload: true, fields: [] },
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
