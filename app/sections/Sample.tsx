import type { GetSectionType } from "page"
import { VideoEmbed } from "library/videos/VideoEmbed"
import { sleep } from "library/functions"
import { css, fresponsive, styled } from "library/styled"

export default async function SampleSection({
	title,
	text,
	sampleVideo,
	generateSanityDataAttribute,
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
			<div data-sanity={generateSanityDataAttribute("title")}>example of a data sanity prop</div>
			{sampleVideo && <VideoEmbed video={sampleVideo} />}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	fresponsive(css`
		grid-column: main;
		display: grid;
		gap: 12px;
		min-height: 60vh;
	`),
])
