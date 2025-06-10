"use client"
import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled"
import { useQueryState } from "nuqs"

export function Categories({
	items,
}: {
	items: { categories?: string[] | undefined }[]
}) {
	const [category, setCategory] = useQueryState("category")

	const uniqueCategories = Array.from(
		new Set(items.flatMap((item) => item?.categories ?? [])),
	)

	return (
		<Wrapper>
			<h1>Categories</h1>
			{uniqueCategories.map((item) => {
				return (
					<Button
						type="button"
						key={item}
						onClick={(e) => {
							e.preventDefault()
							setCategory(item)
						}}
						isActive={category === item}
					>
						{item}
					</Button>
				)
			})}
			{category && (
				<UniversalLink
					type="button"
					onClick={(e) => {
						e.preventDefault()
						setCategory(null)
					}}
				>
					clear
				</UniversalLink>
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
