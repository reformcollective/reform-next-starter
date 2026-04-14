"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import ButtonLink from "./ButtonLink"
import { colors } from "styles/colors.css"
import textStyles, { clampText } from "styles/text"
import UniversalImage from "library/UniversalImage"
import { css, f, styled } from "library/styled/alpha"
import type { FeaturedCard } from "../types"

export default function LargeCard({ data }: { data: FeaturedCard }) {
	const router = useRouter()
	const [isHovered, setIsHovered] = useState(false)
	const { mainImage, title, articleTextPreview, slug, publishedAt } = data

	const formattedDate = publishedAt
		? new Date(publishedAt).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: null

	const linkToFeatured = `/blog-1/${encodeURIComponent(slug ?? "")}`

	return (
		<Wrapper
			onClick={() => router.push(linkToFeatured)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<ImageWrapper>
				<Image
					className="card-image"
					src={mainImage}
					loading="eager"
					sizes="(max-width: 768px) 318px, 905px"
				/>
			</ImageWrapper>

			<Details>
				<Top>
					{formattedDate && <PublishDate>{formattedDate}</PublishDate>}
					<Title>{title}</Title>
					<Description>{articleTextPreview}</Description>
				</Top>
				<ButtonLink arrow blog href={linkToFeatured} isHovered={isHovered}>
					Read Article
				</ButtonLink>
			</Details>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 0;
		padding: 42px;
		margin-bottom: 0;
		cursor: pointer;
		position: relative;
		
		&:hover .card-image {
			transform: scale(1.05);
		}
	`),
	f.small(css`
		flex-direction: column;
		padding: 0;
	`),
])

const ImageWrapper = styled("div", [
	f.responsive(css`
		position: relative;
		overflow: clip;
		width: 904.5px;
		height: 452.25px;
		border-radius: 10px;
		flex-shrink: 0;
	`),
	f.small(css`
		width: 100%;
		height: auto;
	`),
])

const Image = styled(UniversalImage, [
	f.responsive(css`
		width: 100%;
		height: 100%;
		border-radius: 10px;
		object-fit: cover;
		transform: scale(1.01);
		transition: transform 0.3s ease;
	`),
])

const Title = styled("div", [
	f.responsive(css`
		${textStyles.h8Sans};
		color: ${colors.blog1Black200};
		margin: 20px 0 42px;
		${clampText(4)};
		max-height: 4lh;

		&::after {
			content: "";
			display: none;
		}
	`),
	f.small(css`
		margin: 20px 0 28px;
	`),
])

const Details = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 28px 0 28px 28px;
		width: 427.5px;
	`),
	f.small(css`
		width: 100%;
		padding: 28px 0;
		gap: 54px;
	`),
])

const Description = styled("div", [
	f.responsive(css`
		${textStyles.p2};
		color: ${colors.blog1Black200};
		${clampText(4)};
		max-height: 4lh;
	`),
	f.small(css`
		${textStyles.p1};
	`),
])

const PublishDate = styled("div", [
	f.responsive(css`
		color: ${colors.blog1Black100};
		${textStyles.p2};
	`),
	f.small(css`
		${textStyles.p2};
	`),
])

const Top = styled("div", [
	f.responsive(css`
		position: relative;
	`),
])
