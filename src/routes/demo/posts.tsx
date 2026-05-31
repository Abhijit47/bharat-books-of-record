import {
  ClientOnly,
  createFileRoute,
  Link,
  notFound,
} from '@tanstack/react-router'
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
import { cn } from '#/lib/utils'
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
import { useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const PAGE_SIZE = 9

const getJSONPosts = createServerFn({
  method: 'GET',
})
  .inputValidator((data: { offset?: number; limit?: number }) => data)
  .handler(async ({ data: input }) => {
    const { data: allPosts, error } = await $fetch<Post[]>('/')

    if (error) {
      throw notFound()
    }

    const offset = input.offset ?? 0
    const limit = input.limit ?? PAGE_SIZE

    return {
      data: allPosts.slice(offset, offset + limit),
    }
  })

export const Route = createFileRoute('/demo/posts')({
  beforeLoad: async () => {
    const posts = await getJSONPosts({
      data: { offset: 0, limit: PAGE_SIZE },
    })

    return { posts }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedTab, setSelectedTab] = useState<MediaType>(mediaTypes[0])
  const { posts } = Route.useRouteContext()
  const [items, setItems] = useState<Post[]>(() => posts.data)
  const [hasMore, setHasMore] = useState(posts.data.length === PAGE_SIZE)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const data = items

  const filteredByType = data.filter(
    (post) => post.attachments.data[0].media_type === selectedTab,
  )

  function capitalizeChar(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const fetchMore = async () => {
    setIsLoading(true)
    const next = await getJSONPosts({
      data: { offset: items.length, limit: PAGE_SIZE },
    })
    const randomDelay = Math.random() * 1000 + 500 // Random delay between 500ms and 1500ms
    await new Promise((resolve) => setTimeout(resolve, randomDelay))
    setIsLoading(false)

    if (next.data.length === 0) {
      setHasMore(false)
      return
    }

    setItems((prev) => [...prev, ...next.data])
    setHasMore(next.data.length === PAGE_SIZE)
  }

  const refreshList = async () => {
    setIsLoading(true)
    const refreshed = await getJSONPosts({
      data: { offset: 0, limit: items.length },
    })
    const randomDelay = Math.random() * 1000 + 500 // Random delay between 500ms and 1500ms
    await new Promise((resolve) => setTimeout(resolve, randomDelay))
    setIsLoading(false)

    setItems(refreshed.data)
    setHasMore(refreshed.data.length === items.length)
  }

  return (
    <main className={'max-w-(--breakpoint-xl) mx-auto px-4 py-24'}>
      <h2 className="mt-8 mb-4 text-2xl font-bold">Posts from DB:</h2>

      <ClientOnly fallback={<p>Loading...</p>}>
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
              <Card className={'relative'}>
                <CardHeader>
                  <CardTitle>{capitalizeChar(type)} Posts</CardTitle>
                  <CardDescription>
                    You have {filteredByType.length} active events.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div
                    id="posts-scrollable"
                    ref={containerRef}
                    className={'max-h-96 h-full w-full overflow-y-auto'}
                  >
                    <InfiniteScroll
                      dataLength={items.length}
                      next={fetchMore}
                      hasMore={hasMore}
                      loader={
                        <div
                          className={cn(
                            isLoading
                              ? 'absolute inset-0 h-full w-full flex items-center justify-center backdrop-blur-sm'
                              : '',
                          )}
                        >
                          <p>Loading...</p>
                        </div>
                      }
                      // scrollableTarget={containerRef.current}
                      pullDownToRefresh
                      pullDownToRefreshThreshold={50}
                      refreshFunction={refreshList}
                      scrollableTarget="posts-scrollable"
                      pullDownToRefreshContent={
                        <h3 style={{ textAlign: 'center' }}>
                          &#8595; Pull down to refresh
                        </h3>
                      }
                      releaseToRefreshContent={
                        <h3 style={{ textAlign: 'center' }}>
                          &#8593; Release to refresh
                        </h3>
                      }
                    >
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredByType.map((post, idx) => {
                          // const placeholder = blurhashToCssGradientString(blurhash(post.attachmentsImageSrc!))
                          const firstAttachment = post.attachments.data[0]
                          return (
                            <article
                              key={post.id}
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
                      </div>
                    </InfiniteScroll>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </ClientOnly>
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
