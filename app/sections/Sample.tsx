import type { GetSectionType } from "[[...slug]]/page"
import { sleep } from "library/functions"
import { css, fresponsive, styled } from "library/styled"

export default async function SampleSection({
	title,
	text,
}: GetSectionType<"sample">) {
	/**
	 * artificially delay so we can see the loading state
	 * in sanity studio
	 */
	await sleep(2000)

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
