import { colors } from "app/styles/colors.css"
import textStyles, { clampText } from "app/styles/text"
import UniversalLink from "library/link"
import { css, f, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"

import type { Card } from "../types"

export default function SmallCard({ data }: { data: Card }) {
	const { slug, mainImage, title, publishedAt } = data

	const formattedDate = publishedAt
		? new Date(publishedAt).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: null

	const link = `/blog-1/${encodeURIComponent(slug ?? "")}`

	return (
		<Wrapper href={link}>
			<ImageWrapper>
				<Image
					className="card-image"
					src={mainImage}
					sizes="(max-width: 768px) 318px, 404px"
					loading="lazy"
				/>
			</ImageWrapper>
			<PublishDate>{formattedDate}</PublishDate>
			<Title>
				<TitleText>{title}</TitleText>
			</Title>
		</Wrapper>
	)
}

const Image = styled(UniversalImage, [
	f.responsive(css`
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.01);
		transition: transform 0.3s ease;
	`),
	f.small(css`
		width: 100%;
		height: auto;
	`),
])

const Wrapper = styled(UniversalLink, [
	f.responsive(css`
		position: relative;
		display: grid;

		&:hover .card-image {
			transform: scale(1.1);
		}
	`),
	f.small(css`
		display: flex;
		width: 100%;
		flex-direction: column;
	`),
])

const Title = styled("div", [])

const TitleText = styled("div", [
	f.responsive(css`
		${clampText(2)};
		${textStyles.blog1.p1};
		height: 2lh;
		padding-top: 2px;
		padding-bottom: 5px;
		margin-top: -2px;
		margin-bottom: -5px;
		color: ${colors.blog1.baseDark100};

		/* Capsize not playing nice with clamp */
		&::after {
			display: none;
			content: "";
		}
	`),
])

const PublishDate = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p3};
		margin: 26px 0 14px;
		color: ${colors.blog1.baseDark200};
		opacity: 0.5;
	`),
])

const ImageWrapper = styled("div", [
	f.responsive(css`
		overflow: clip;
		width: 100%;
		height: 215px;
		border-radius: 10px;
	`),
	f.small(css`
		height: auto;
	`),
])
