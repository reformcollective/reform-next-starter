"use client"

import { colors } from "app/styles/colors.css"
import textStyles, { clampText } from "app/styles/text"
import { css, f, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"
import { useRouter } from "next/navigation"
import { useState } from "react"

import type { FeaturedCard } from "../types"

import ButtonLink from "./ButtonLink"

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
		position: relative;
		display: flex;
		padding: 42px;
		margin-bottom: 0;
		cursor: pointer;
		gap: 0;

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
		flex-shrink: 0;
		border-radius: 10px;
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
		${textStyles.blog1.h8Sans};
		max-height: 4lh;
		margin: 20px 0 42px;
		color: ${colors.blog1.baseDark200};
		${clampText(4)};

		&::after {
			display: none;
			content: "";
		}
	`),
	f.small(css`
		margin: 20px 0 28px;
	`),
])

const Details = styled("div", [
	f.responsive(css`
		display: flex;
		width: 427.5px;
		flex-direction: column;
		justify-content: space-between;
		padding: 28px 0 28px 28px;
	`),
	f.small(css`
		width: 100%;
		padding: 28px 0;
		gap: 54px;
	`),
])

const Description = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p2};
		max-height: 4lh;
		color: ${colors.blog1.baseDark200};
		${clampText(4)};
	`),
	f.small(css`
		${textStyles.blog1.p1};
	`),
])

const PublishDate = styled("div", [
	f.responsive(css`
		color: ${colors.blog1.baseDark100};
		${textStyles.blog1.p2};
	`),
	f.small(css`
		${textStyles.blog1.p2};
	`),
])

const Top = styled("div", [
	f.responsive(css`
		position: relative;
	`),
])
