import Link from "next/link"

import Avatar from "./avatar"
import CoverImage from "./cover-image"
import DateComponent from "./date"

import { sanityFetch } from "sanity/lib/fetch"
import { moreStoriesQuery } from "sanity/lib/queries"
import styled from "styled-components"

import type { SanityImageSource } from "@sanity/image-url/lib/types/types"
import type { MoreStoriesQueryResult } from "@/sanity.types"

interface Post {
	readonly id: string
	title: string | null
	slug: { current: string } | null
	mainImage: SanityImageSource
}

export default async function MoreStories(params: {
	skip: string
	limit: number
}) {
	const data: MoreStoriesQueryResult = await sanityFetch({
		query: moreStoriesQuery,
		params,
	})

	return (
		<>
			<MoreStoriesWrapper>
				{data?.map((post) => {
					const { _id, title, slug, mainImage } = post
					return (
						<article key={_id}>
							<Link
								href={`/posts/${slug?.current}`}
								className="group mb-5 block"
							>
								<CoverImage image={mainImage} priority={false} />
							</Link>
							<h3 className="text-balance mb-3 text-3xl leading-snug">
								<Link
									href={`/posts/${slug?.current}`}
									className="hover:underline"
								>
									{title}
								</Link>
							</h3>
						</article>
					)
				})}
			</MoreStoriesWrapper>
		</>
	)
}

const MoreStoriesWrapper = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 2rem;
	margin-top: 2rem;
	margin-bottom: 2rem;
`
