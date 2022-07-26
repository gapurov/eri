import {stringify, parse} from "superjson"
import type {GetStaticProps} from "next"
import {formatRelative} from "date-fns"
import {TRPCError} from "@trpc/server"
import type {FC} from "react"

import Link from "next/link"

import {router} from "server/trpc/route"
import {Post} from "server/db/entity/Post"

import {BaseLayout} from "layout/Base"

import getEmptyPaths from "lib/util/getEmptyPaths"

interface Props {
  data: string
}

interface Query {
  date: string
  name: string
}

export const getStaticPaths = getEmptyPaths

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const {date, name} = params as unknown as Query

  try {
    const post = await router.createCaller({}).query("post.getBySlug", {
      slug: [date, name]
    })

    return {
      props: {
        data: stringify(post)
      }
    }
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      return {
        notFound: true
      }
    }

    throw error
  }
}

const PostPage: FC<Props> = ({data}) => {
  const post = parse<Post>(data)

  return (
    <BaseLayout title={post.title}>
      <nav className="pb-5">
        <Link href="/">
          <a className="no-underline">
            ← Back to posts
          </a>
        </Link>
      </nav>

      <h1 className="mb-0">{post.title}</h1>

      <small className="text-gray-500">
        <span>
          {formatRelative(post.createdAt, Date.now())}
        </span>
        <span>
          {` by @${post.author.login}`}
        </span>
      </small>

      <div className="pt-2">Content will be here</div>
    </BaseLayout>
  )
}

export default PostPage
