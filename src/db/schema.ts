import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const todos = sqliteTable('todos', {
  id: integer({ mode: 'number' }).primaryKey({
    autoIncrement: true,
  }),
  title: text().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})

export const posts = sqliteTable('posts', {
  id: text({ mode: 'text' }).primaryKey(),
  fullPicture: text('full_picture').default(''),
  attachmentsImageSrc: text('attachments_image_src').default(''),
  attachmentsUrl: text('attachments_url').default(''),
  attachmentsHeight: integer('attachments_height', { mode: 'number' }).default(
    0,
  ),
  attachmentsWidth: integer('attachments_width', { mode: 'number' }).default(0),
  attachmentsMediaType: text('attachments_media_type').default(''),
  attachmentsType: text('attachments_type').default(''),
  attachmentsDescription: text('attachments_description').default(''),
  permalinkUrl: text('permalink_url').default(''),
  message: text('message').default(''),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false),
  isLiveClip: integer('is_live_clip', { mode: 'boolean' }).default(false),
  isSpherical: integer('is_spherical', { mode: 'boolean' }).default(false),
  isPopular: integer('is_popular', { mode: 'boolean' }).default(false),
  createdTime: integer('created_time', { mode: 'timestamp' }).default(
    sql`(unixepoch())`,
  ),
})
