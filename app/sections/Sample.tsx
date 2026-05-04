import type { GetSectionType } from "page"
import UniversalLink from "library/link"
import { isRouteDefined } from "library/link/resolve"
import { getSanityDataAttribute } from "library/sanity/getSanityDataAttribute"
import UniversalImage from "library/UniversalImage"
import { VideoEmbed } from "library/videos/VideoEmbed"
import { css, f, styled } from "library/styled"

export default async function SampleSection({
	title,
	text,
	sampleImage,
	sampleLink,
	sampleVideo,
	sanityDataAttribute,
}: GetSectionType<"sample">) {
	const hasMedia = Boolean(sampleImage?.asset || sampleVideo)

	return (
		<Wrapper data-has-media={hasMedia || undefined}>
			<Content>
				{title && (
					<Title data-sanity={getSanityDataAttribute(sanityDataAttribute, "title")}>{title}</Title>
				)}
				{text && (
					<Text data-sanity={getSanityDataAttribute(sanityDataAttribute, "text")}>{text}</Text>
				)}
				{isRouteDefined(sampleLink) && (
					<Link href={sampleLink}>{sampleLink.text || "Learn more"}</Link>
				)}
			</Content>

			{hasMedia && (
				<Media>
					{sampleImage?.asset && (
						<Image
							data-sanity={getSanityDataAttribute(sanityDataAttribute, "sampleImage")}
							src={sampleImage}
							sizes="(max-width: 700px) 100vw, 50vw"
						/>
					)}
					{sampleVideo && (
						<VideoFrame data-sanity={getSanityDataAttribute(sanityDataAttribute, "sampleVideo")}>
							<VideoEmbed video={sampleVideo} />
						</VideoFrame>
					)}
				</Media>
			)}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.unresponsive(css`
		grid-column: main;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 24px;
		align-items: center;
		min-height: 60vh;
		padding: 72px 0;
		
		&[data-has-media="true"] {
			grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
		}
		
		@media (max-width: 700px) {
			grid-template-columns: minmax(0, 1fr);
			padding: 48px 0;
		
			&[data-has-media="true"] {
				grid-template-columns: minmax(0, 1fr);
			}
		}
	`),
])

const Content = styled("div", [
	f.unresponsive(css`
		display: grid;
		gap: 18px;
		align-content: center;
		max-width: 680px;
	`),
])

const Title = styled("h1", [
	f.unresponsive(css`
		margin: 0;
		font-size: 72px;
		line-height: 0.95;
		font-weight: 700;
		letter-spacing: 0;
		color: #111;
		
		@media (max-width: 700px) {
			font-size: 42px;
		}
	`),
])

const Text = styled("p", [
	f.unresponsive(css`
		margin: 0;
		max-width: 58ch;
		font-size: 20px;
		line-height: 1.45;
		color: #444;
		
		@media (max-width: 700px) {
			font-size: 17px;
		}
	`),
])

const Link = styled(UniversalLink, [
	f.unresponsive(css`
		justify-self: start;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 18px;
		border: 1px solid #111;
		border-radius: 6px;
		color: #fff;
		background: #111;
		text-decoration: none;
		font-size: 15px;
		font-weight: 600;
		transition:
			background 160ms ease,
			color 160ms ease;
		
		&:hover {
			color: #111;
			background: transparent;
		}
	`),
])

const Media = styled("div", [
	f.unresponsive(css`
		display: grid;
		gap: 16px;
		min-width: 0;
	`),
])

const Image = styled(UniversalImage, [
	f.unresponsive(css`
		width: 100%;
		height: auto;
		border-radius: 8px;
		overflow: hidden;
		background: #f3f3f3;
	`),
])

const VideoFrame = styled("div", [
	f.unresponsive(css`
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: 8px;
		background: #111;
	`),
])
