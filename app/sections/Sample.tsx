import type { GetSectionType } from "[slug]/page"
import { css, fresponsive, styled } from "library/styled"

export default function SampleSection({
	title,
	text,
}: GetSectionType<"sample">) {
	return (
		<Wrapper>
			<h1>{title}</h1>
			<p>{text}</p>
		</Wrapper>
	)
}

const Wrapper = styled("div", {
	...fresponsive(css`
		padding: 200px;
	`),
})
