"use client"
import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled"
import { useParams } from "next/navigation"

export function Categories({
	items,
}: {
	items: { categories?: string[] | undefined }[]
}) {
	const params = useParams()
	const category = params.category as string | undefined

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
						href={`/blog/category/${item}`}
						isActive={category === item}
					>
						{item}
					</Button>
				)
			})}
			{category && <UniversalLink href="/blog">clear</UniversalLink>}
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
