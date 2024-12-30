"use client"

import UniversalLink from "library/Loader/UniversalLink"
import { useQueryState } from "nuqs"
import { css, fresponsive, styled } from "library/styled"
import type { PostsQueryResult } from "@/sanity.types"

export function Categories({ data }: { data: PostsQueryResult }) {
	const [, setCategory] = useQueryState("category")

	const uniqueCategories = Array.from(
		new Set(data.flatMap((item) => item?.categories ?? [])),
	)

	return (
		<Wrapper>
			<h1>Categories</h1>
			{uniqueCategories.map((item) => {
				return (
					<Button type="button" key={item} onClick={() => setCategory(item)}>
						{item}
					</Button>
				)
			})}
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		display: flex;
		gap: 8px;
	`),
)

const Button = styled(
	UniversalLink,
	fresponsive(css`
		max-width: 1024px;
		margin: 0 auto;
		border: 1px solid orange;
	`),
)
