import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CsvError, parse } from 'csv-parse/sync'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { posts } from '#/db/schema'

config({ path: ['.env.local', '.env'] })

type CsvPost = {
  id: string
  full_picture: string
  attachments_image_src: string
  attachments_url: string
  attachments_height: string
  attachments_width: string
  attachments_media_type: string
  attachments_type: string
  attachments_description: string
  permalink_url: string
  message: string
  is_published: string
  is_hidden: string
  is_live_clip: string
  is_spherical: string
  is_popular: string
  created_time: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CSV_PATH = path.resolve(__dirname, '../data/data.csv')

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toBoolean(value: string) {
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

function toDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const numeric = Number(trimmed)
  if (Number.isFinite(numeric)) {
    const millis = numeric > 1_000_000_000_000 ? numeric : numeric * 1000
    return new Date(millis)
  }

  const millis = Date.parse(trimmed)
  if (Number.isFinite(millis)) return new Date(millis)

  return undefined
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run seed.')
  }

  const csvRaw = await readFile(CSV_PATH, 'utf8')
  const records = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  }) as CsvPost[]

  const rows = records
    .filter((record) => record.id.trim())
    .map((record) => ({
      id: record.id.trim(),
      fullPicture: record.full_picture,
      attachmentsImageSrc: record.attachments_image_src,
      attachmentsUrl: record.attachments_url,
      attachmentsHeight: toNumber(record.attachments_height),
      attachmentsWidth: toNumber(record.attachments_width),
      attachmentsMediaType: record.attachments_media_type,
      attachmentsType: record.attachments_type,
      attachmentsDescription: record.attachments_description,
      permalinkUrl: record.permalink_url,
      message: record.message,
      isPublished: toBoolean(record.is_published),
      isHidden: toBoolean(record.is_hidden),
      isLiveClip: toBoolean(record.is_live_clip),
      isSpherical: toBoolean(record.is_spherical),
      isPopular: toBoolean(record.is_popular),
      createdTime: toDate(record.created_time),
    }))

  const db = drizzle(process.env.DATABASE_URL)
  if (rows.length === 0) {
    console.log('No rows found in CSV. Nothing to seed.')
    return
  }

  await db.insert(posts).values(rows).onConflictDoNothing()
  console.log(`Seed complete. Attempted to insert ${rows.length} posts.`)
}

main().catch((error) => {
  console.error('Seed failed:', error)
  if (error instanceof CsvError) {
    console.error('CSV parsing error details:', {
      code: error.code,
      message: error.message,
      pos: error.pos,
      loc: error.loc,
    })
  }
  process.exit(1)
})
