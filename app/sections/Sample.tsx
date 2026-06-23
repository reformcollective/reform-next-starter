import type { GetSectionType } from "page"

import UniversalLink from "library/link"
import { isRouteDefined } from "library/link/resolve"
import { getSanityDataAttribute } from "library/sanity/getSanityDataAttribute"
import { css, f, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"
import { VideoEmbed } from "library/videos/VideoEmbed"

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
		display: grid;
		min-height: 60vh;
		align-items: center;
		padding: 72px 0;
		gap: 24px;
		grid-column: main;
		grid-template-columns: minmax(0, 1fr);

		&[data-has-media="true"] {
			grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
		}

		@media (width <= 700px) {
			padding: 48px 0;
			grid-template-columns: minmax(0, 1fr);

			&[data-has-media="true"] {
				grid-template-columns: minmax(0, 1fr);
			}
		}
	`),
])

const Content = styled("div", [
	f.unresponsive(css`
		display: grid;
		max-width: 680px;
		align-content: center;
		gap: 18px;
	`),
])

const Title = styled("h1", [
	f.unresponsive(css`
		margin: 0;
		color: #111;
		font-size: 72px;
		font-weight: 700;
		letter-spacing: 0;
		line-height: 0.95;

		@media (width <= 700px) {
			font-size: 42px;
		}
	`),
])

const Text = styled("p", [
	f.unresponsive(css`
		max-width: 58ch;
		margin: 0;
		color: #444;
		font-size: 20px;
		line-height: 1.45;

		@media (width <= 700px) {
			font-size: 17px;
		}
	`),
])

const Link = styled(UniversalLink, [
	f.unresponsive(css`
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		padding: 0 18px;
		border: 1px solid #111;
		border-radius: 6px;
		background: #111;
		color: #fff;
		font-size: 15px;
		font-weight: 600;
		justify-self: start;
		text-decoration: none;
		transition:
			background 160ms ease,
			color 160ms ease;

		&:hover {
			background: transparent;
			color: #111;
		}
	`),
])

const Media = styled("div", [
	f.unresponsive(css`
		display: grid;
		min-width: 0;
		gap: 16px;
	`),
])

const Image = styled(UniversalImage, [
	f.unresponsive(css`
		overflow: hidden;
		width: 100%;
		height: auto;
		border-radius: 8px;
		background: #f3f3f3;
	`),
])

const VideoFrame = styled("div", [
	f.unresponsive(css`
		overflow: hidden;
		width: 100%;
		border-radius: 8px;
		aspect-ratio: 16 / 9;
		background: #111;
	`),
])
