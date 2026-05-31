// import { env } from '#/env'
import { createFetch } from '@better-fetch/fetch'
import z from 'zod'

// import data from '../../public/data/fb_posts_107248091187807.json'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const mediaTypes = ['photo', 'video', 'link', 'album'] as const
export const attachmentDataTypes = [
  'album',
  'photo',
  'video_inline',
  'share',
  'native_templates',
] as const

// Extract literal union types from the const arrays
export type MediaType = (typeof mediaTypes)[number]
export type AttachmentDataType = (typeof attachmentDataTypes)[number]

export const AttachmentImage = z.object({
  height: z.number(),
  src: z.string(),
  width: z.number(),
})

export const AttachmentsSchema = z.object({
  data: z.array(
    z
      .object({
        media: z.object({
          image: AttachmentImage,
        }),
        media_type: z.enum(mediaTypes),
        title: z.string(),
        url: z.string(),
        type: z.enum(attachmentDataTypes),
      })
      .or(
        z.object({
          media: z.object({
            image: AttachmentImage,
          }),
          media_type: z.enum(mediaTypes),
          url: z.string(),
          type: z.enum(attachmentDataTypes),
          description: z.string(),
        }),
      )
      .or(
        z.object({
          media: z.object({
            image: AttachmentImage,
            source: z.string(),
          }),
          media_type: z.enum(mediaTypes),
          url: z.string(),
          type: z.enum(attachmentDataTypes),
        }),
      )
      .or(
        z.object({
          media: z.object({
            image: AttachmentImage,
          }),
          media_type: z.enum(mediaTypes),
          title: z.string(),
          url: z.string(),
          type: z.enum(attachmentDataTypes),
          description: z.string(),
        }),
      )
      .or(
        z.object({
          media_type: z.enum(mediaTypes),
          title: z.string(),
          type: z.enum(attachmentDataTypes),
          description: z.string(),
        }),
      ),
  ),
})

export const PostSchema = z.object({
  full_picture: z.string().optional(),
  attachments: AttachmentsSchema,
  id: z.string(),
  is_published: z.boolean(),
  is_hidden: z.boolean(),
  is_live_clip: z.boolean(),
  permalink_url: z.string(),
  message: z.string().optional(),
  created_time: z.string(),
})

export type Attachments = z.infer<typeof AttachmentsSchema>
export type Post = z.infer<typeof PostSchema>

export const $fetch = createFetch({
  baseURL: `${BASE_URL}/data/fb_posts_107248091187807.json`,
  retry: {
    type: 'linear',
    attempts: 3,
    delay: 1000,
  },
  output: z.array(PostSchema),
})
