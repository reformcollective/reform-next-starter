import type { GetSectionType } from "page"
import { VideoEmbed, getVideoProps } from "app/components/VideoEmbed"
import { sleep } from "library/functions"
import { css, fresponsive, styled } from "library/styled/alpha"

export default async function SampleSection({
	title,
	text,
	genericVideo,
	genericVideo2,
	genericVideo3,
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
			{genericVideo && (
				<div>
					<h2>Generic Video</h2>
					<VideoEmbed {...getVideoProps(genericVideo)} />
				</div>
			)}

			{genericVideo2 && (
				<div>
					<h2>Generic Video 2</h2>
					<VideoEmbed {...getVideoProps(genericVideo2)} />
				</div>
			)}

			{genericVideo3 && (
				<div>
					<h2>Generic Video 3</h2>
					<VideoEmbed {...getVideoProps(genericVideo3)} />
				</div>
			)}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	fresponsive(css`
		padding: 200px;
		min-height: 60vh;
	`),
])
