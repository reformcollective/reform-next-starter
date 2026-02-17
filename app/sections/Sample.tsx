import type { GetSectionType } from "page"
import { VideoEmbed } from "library/videos/VideoEmbed"
import { sleep } from "library/functions"
import { css, fresponsive, styled } from "library/styled/alpha"

export default async function SampleSection(props: GetSectionType<"sample">) {
	const { title, text, sampleVideo } = props

	/**
	 * artificially delay so we can see the loading state
	 * in sanity studio
	 */
	await sleep(2000)

	return (
		<Wrapper>
			<h1>{title}</h1>
			<p>{text}</p>
			{sampleVideo && <VideoEmbed video={sampleVideo} />}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	fresponsive(css`
		display: grid;
		gap: 40px;
		min-height: 60vh;
	`),
])
