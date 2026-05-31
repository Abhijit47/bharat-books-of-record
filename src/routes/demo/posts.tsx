import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import type { MediaType, Post } from '#/lib/data'
import { $fetch, mediaTypes } from '#/lib/data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

const getJSONPosts = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { data, error } = await $fetch<Post[]>('/')

  if (error) {
    throw notFound()
  }

  return { data }
})

export const Route = createFileRoute('/demo/posts')({
  beforeLoad: async () => {
    const posts = await getJSONPosts()

    return { posts }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedTab, setSelectedTab] = useState<MediaType>(mediaTypes[0])
  const { posts } = Route.useRouteContext()

  const data = posts.data // Limit to 9 posts for demo purposes

  const filteredByType = data.filter(
    (post) => post.attachments.data[0].media_type === selectedTab,
  )

  function capitalizeChar(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <main className={'max-w-(--breakpoint-xl) mx-auto px-4 py-24'}>
      <h2 className="mt-8 mb-4 text-2xl font-bold">Posts from DB:</h2>

      <Tabs
        defaultValue={selectedTab}
        onValueChange={(value) => setSelectedTab(value as MediaType)}
      >
        <TabsList variant="line">
          {mediaTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {capitalizeChar(type)}
            </TabsTrigger>
          ))}
        </TabsList>
        {mediaTypes.map((type) => (
          <TabsContent key={type} value={type} className={'w-full'}>
            <Card>
              <CardHeader>
                <CardTitle>{capitalizeChar(type)} Posts</CardTitle>
                <CardDescription>
                  You have {filteredByType.length} active events.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredByType.length === 0 ? (
                    <>No data to show</>
                  ) : (
                    <>
                      {filteredByType.map((post, idx) => {
                        // const placeholder = blurhashToCssGradientString(blurhash(post.attachmentsImageSrc!))
                        const firstAttachment = post.attachments.data[0]
                        return (
                          <article
                            key={crypto.randomUUID()}
                            className="island-shell feature-card rise-in rounded-2xl p-5 space-y-6"
                            style={{ animationDelay: `${idx * 90 + 80}ms` }}
                          >
                            <Link
                              to={post.permalink_url}
                              className="aspect-square block"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MediaComponent attachment={firstAttachment} />
                            </Link>

                            <p className="text-sm text-(--sea-ink-soft) line-clamp-6">
                              {post.message}
                            </p>

                            <PostDialog post={post} />
                          </article>
                        )
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  )
}

function MediaComponent({
  attachment,
}: {
  attachment: Post['attachments']['data'][0]
}) {
  switch (attachment.media_type) {
    case 'photo': {
      const imgObj =
        attachment.type === 'photo' &&
        'media' in attachment &&
        'image' in attachment.media
          ? attachment.media.image
          : {
              src: '/no-image-placeholder.svg',
              width: 330,
              height: 406,
            }
      const desc =
        'description' in attachment
          ? attachment.description
          : 'No description available.'

      return (
        <img
          src={imgObj.src}
          alt={desc}
          width={imgObj.width}
          height={imgObj.height}
          className="mb-4 h-full w-full rounded-lg object-cover"
        />
      )
    }

    case 'album': {
      const albumObj =
        attachment.type === 'album' &&
        'media' in attachment &&
        'image' in attachment.media
          ? attachment.media.image
          : {
              src: '/no-image-placeholder.svg',
              width: 330,
              height: 406,
            }
      const desc =
        'description' in attachment
          ? attachment.description
          : 'No description available.'
      return (
        <img
          src={albumObj.src}
          alt={desc}
          width={albumObj.width}
          height={albumObj.height}
          className="mb-4 h-full w-full rounded-lg object-cover"
        />
      )
    }

    case 'video': {
      const fallbackVideoObj = {
        image: {
          src: '/no-video-available-image.webp',
          width: 593,
          height: 333,
        },
        source: '/no-video-available-image.webp',
      }

      const videoObj =
        attachment.type === 'video_inline' &&
        'media' in attachment &&
        'image' in attachment.media &&
        'source' in attachment.media
          ? attachment.media
          : fallbackVideoObj

      return (
        <video
          controls
          width={videoObj.image.width}
          height={videoObj.image.height}
          className={'w-full h-full'}
          poster={videoObj.image.src}
        >
          <source src={videoObj.source} />
        </video>
      )
    }

    case 'link': {
      // const BASE_URL = import.meta.env.VITE_API_BASE_URL as string
      const fallbackLinkObj = {
        src: '/no-image-placeholder.svg',
        width: 330,
        height: 406,
      }

      const linkShareObj =
        attachment.type === 'share' &&
        'media' in attachment &&
        'image' in attachment.media
          ? attachment.media.image
          : fallbackLinkObj

      const linkNativeObj =
        attachment.type === 'native_templates' &&
        'media' in attachment &&
        'image' in attachment.media
          ? attachment.media.image
          : Object.assign(fallbackLinkObj, {
              url: 'https://www.facebook.com/bharatbookofrecords/',
            })

      const desc =
        'description' in attachment
          ? attachment.description
          : 'No description available.'
      return (
        <>
          {attachment.type === 'share' ? (
            <img
              src={linkShareObj.src}
              alt={desc}
              width={linkShareObj.width}
              height={linkShareObj.height}
              className="mb-4 h-full w-full rounded-lg object-cover"
            />
          ) : (
            <img
              src={linkNativeObj.src}
              alt={desc}
              width={linkNativeObj.width}
              height={linkNativeObj.height}
              className="mb-4 h-full w-full rounded-lg object-cover"
            />
          )}
        </>
      )
    }

    default:
      return <>Nothing to show</>
  }
}

function PostDialog({ post }: { post: Post }) {
  const desc =
    'description' in post.attachments.data[0]
      ? post.attachments.data[0].description
      : 'No description available.'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Keep Reading</Button>
      </DialogTrigger>
      <DialogContent
        className={
          'data-open:zoom-in-100! data-open:slide-in-from-bottom-20 data-open:duration-600 sm:max-w-106.25'
        }
        // className="data-open:zoom-in-0! data-open:duration-600 sm:max-w-106.25"
      >
        <DialogHeader>
          <DialogTitle className={'text-sm'}>{post.id}</DialogTitle>
          <DialogDescription className={'sr-only'}>{desc}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="">
          <p className="text-sm text-(--sea-ink-soft)">{post.message}</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button size={'sm'} variant="outline">
              Close
            </Button>
          </DialogClose>
          <Link
            to={post.permalink_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-(--lagoon-deep) no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            Keep Reading
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
