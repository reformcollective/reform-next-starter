"use client"

import UniversalLink from "library/Loader/UniversalLink"
import { css, fresponsive, styled } from "library/styled"
import { useParams } from "next/navigation"

export function Categories({
	items,
}: {
	items: { categories?: string[] | undefined }[]
}) {
	const { category } = useParams<"/blog/category/[category]">()
	const uniqueCategories = Array.from(
		new Set(items.flatMap((item) => item?.categories ?? [])),
	)

	return (
		<Wrapper>
			<h1>Categories</h1>
			{uniqueCategories.map((item) => {
				return (
					<Button
						key={item}
						href={{
							pathname: "/blog/category/[category]",
							query: { category: item },
						}}
						isActive={category === item}
					>
						{item}
					</Button>
				)
			})}
			{category && (
				<UniversalLink href={{ pathname: "/blog" }}>clear</UniversalLink>
			)}
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

const Button = styled(UniversalLink, ({ isActive }: { isActive: boolean }) =>
	fresponsive(css`
		border: 1px solid orange;
		padding: 10px;
		text-decoration: ${isActive ? "underline" : "none"};
	`),
)
