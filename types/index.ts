import z from 'zod'

const mediaTypes = ['photo', 'video', 'link', 'album'] as const
const attachmentDataTypes = [
  'album',
  'photo',
  'video_inline',
  'share',
  'native_templates',
] as const

// Extract literal union types from the const arrays
type MediaType = (typeof mediaTypes)[number]
type AttachmentDataType = (typeof attachmentDataTypes)[number]

// Helper type for standard image structure
type MediaImageType = {
  image: {
    height: number
    src: string
    width: number
  }
}

// Map each type to its exact allowed shape (Discriminated Union)
type AttachmentItem =
  | {
      type: AttachmentDataType
      media_type: MediaType
      media: MediaImageType
      title: string
      url: string
    }
  | {
      type: AttachmentDataType
      media_type: MediaType
      media: MediaImageType
      url: string
      description: string
    }
  | {
      type: AttachmentDataType
      media_type: MediaType
      media: MediaImageType & { source: string }
      url: string
    }
  | {
      type: AttachmentDataType
      media_type: MediaType
      media: MediaImageType
      title: string
      url: string
      description: string
    }
  | {
      type: AttachmentDataType
      media_type: MediaType
      title: string
      description: string
    }

// Wrap it in the outer object structure
export type AttachmentsData = {
  data: AttachmentItem[]
}

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
        media_type: 'album',
        type: 'album',
        title: z.string(),
        url: z.string(),
      })
      .or(
        z.object({
          media: z.object({
            image: AttachmentImage,
          }),
          media_type: 'photo',
          type: 'photo',
          url: z.string(),
          description: z.string(),
        }),
      )
      .or(
        z.object({
          media: z.object({
            image: AttachmentImage,
            source: z.string(),
          }),
          media_type: 'video',
          type: 'video_inline',
          url: z.string(),
        }),
      )
      .or(
        z.object({
          media: z.object({
            image: AttachmentImage,
          }),
          media_type: 'link',
          type: 'share',
          title: z.string(),
          url: z.string(),
          description: z.string(),
        }),
      )
      .or(
        z.object({
          media_type: 'link',
          type: 'native_templates',
          title: z.string(),
          description: z.string(),
        }),
      ),
  ),
})

type Attchmnt = z.infer<typeof AttachmentsSchema>

const AttachmentsData: Attchmnt = {
  data: [
    {
      media: {
        image: {
          height: 485,
          src: '',
          width: 1512,
        },
      },
      media_type: 'album',
      title: '',
      url: '',
      type: 'album',
    },
    {
      media: {
        image: {
          height: 720,
          src: '',
          width: 720,
        },
      },
      media_type: 'photo',
      url: '',
      type: 'photo',
      description: '',
    },
    {
      media: {
        image: {
          height: 360,
          src: '',
          width: 640,
        },
        source: '',
      },
      media_type: 'video',
      url: '',
      type: 'video_inline',
    },
    {
      media: {
        image: {
          height: 720,
          src: '',
          width: 720,
        },
      },
      media_type: 'link',
      title: '',
      url: '',
      type: 'share',
      description: '',
    },
    {
      media_type: 'link',
      title: '',
      type: 'native_templates',
      description: '',
    },
    {
      media_type: 'link',
      title: '',
      type: 'native_templates',
      description: '',
    },
  ],
}
