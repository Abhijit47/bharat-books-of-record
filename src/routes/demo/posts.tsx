import { db } from '#/db'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
// import { blurhashToImageCssString } from '@unpic/placeholder'
// import { blurhash } from '#/lib/unpic'

// const css = blurhashToImageCssString(blurhash("https://res.cloudinary.com/demo/image/upload/c_lfill,w_200,h_100/dog.jpg"))

// const getServerTime = createServerFn({
//   method: 'GET',
// }).handler(async () => {
//   return new Date().toISOString()
// })

const postsQueryOptions = () => ({
  queryKey: ['posts'],
  structuralSharing: false, // Required - RSC values must not be merged
  queryFn: () => getPosts(),
  staleTime: 5 * 60 * 1000, // Optional - Cache posts for 5 minutes
})

const getPosts = createServerFn({
  method: 'GET',
}).handler(async () => {
  const posts = await db.query.posts.findMany({
    limit: 10,
  })
  return posts
})

export const Route = createFileRoute('/demo/posts')({
  beforeLoad: async () => {
    const posts = await getPosts()
    return { posts }
  },
  loader: async ({ context }) => {
    // Prefetch during SSR - data reused on client without refetch
    await context.queryClient.ensureQueryData(postsQueryOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  // const [time, setTime] = useState('')
  // const { posts } = Route.useRouteContext()

  // const queryClient = useQueryClient()

  const { data, isError, isFetching } = useSuspenseQuery(postsQueryOptions())

  // useEffect(() => {
  //   getServerTime().then(setTime)
  // }, [])

  if (isFetching) {
    return <p>Loading...</p>
  }

  if (isError) {
    return <p>Error loading posts.</p>
  }

  return (
    <main className={'max-w-(--breakpoint-xl) mx-auto px-4 py-24'}>
      {/* <p>Server time: {time}</p> */}
      <h2 className="mt-8 mb-4 text-2xl font-bold">Posts from DB:</h2>
      {data.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((post, idx) => {
            // const placeholder = blurhashToCssGradientString(blurhash(post.attachmentsImageSrc!))
            return (
              <article
                key={post.id}
                className="island-shell feature-card rise-in rounded-2xl p-5"
                style={{ animationDelay: `${idx * 90 + 80}ms` }}
              >
                {/* <Image
                  src={post.attachmentsImageSrc!}
                  alt={post.attachmentsDescription!}
                  width={post.attachmentsWidth!}
                  height={post.attachmentsHeight!}
                  // background={placeholder}
                /> */}

                <img
                  src={post.attachmentsImageSrc!}
                  alt={post.attachmentsDescription!}
                  width={post.attachmentsWidth!}
                  height={post.attachmentsHeight!}
                  className="mb-4 h-auto w-full rounded-lg object-cover"
                />
                <h2 className="mb-2 text-base font-semibold text-(--sea-ink)">
                  {post.id}
                </h2>
                <p className="m-0 text-sm text-(--sea-ink-soft)">
                  {post.message}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
