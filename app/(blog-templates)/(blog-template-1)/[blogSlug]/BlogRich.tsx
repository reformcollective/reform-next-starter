"use client"

import BlockquoteWithAttribution from "app/(blog-templates)/(blog-template-1)/[blogSlug]/components/BlockquoteWithAttribution"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import UniversalLink from "library/link"
import { TypedPortableText } from "library/sanity/PortableText"
import { css, f, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"
import { VideoEmbed } from "library/videos/VideoEmbed"
import type { ReactNode } from "react"
import type { BlogBodyBlock } from "./types"

export default function BlogRich({
	className,
	value,
}: {
	className?: string
	value: BlogBodyBlock[]
}) {
	if (!value) return null

	return (
		<Wrapper className={className}>
			<TypedPortableText<BlogBodyBlock[]>
				value={value}
				components={{
					types: {
						image: ({ value }) => (
							<BlogImage src={value} sizes="(max-width: 768px) 318px, 670px" loading="lazy" />
						),
						blockquoteWithAttribution: ({ value }) => (
							<BlockquoteWithAttribution
								description={value.description}
								authorName={value.authorName}
								authorTitle={value.authorTitle}
							/>
						),
						video: ({ value }) => <StyledVideoEmbed video={value} />,
					},
					block: {
						normal: ({ children }: { children: ReactNode }) => (
							<StyledNormal>{children}</StyledNormal>
						),
						h1: ({ children }: { children: ReactNode }) => <StyledH1>{children}</StyledH1>,
						h2: ({ children }: { children: ReactNode }) => <StyledH2>{children}</StyledH2>,
						blockquote: ({ children }: { children: ReactNode }) => (
							<StyledBlockQuote>{children}</StyledBlockQuote>
						),
					},
					list: {
						bullet: ({ children }: { children: ReactNode }) => <StyledUl>{children}</StyledUl>,
					},
					marks: {
						strong: ({ children }: { children: ReactNode }) => (
							<StyledStrong>{children}</StyledStrong>
						),
						link: ({
							value,
							children,
						}: {
							value: { href?: string; _type: "link"; _key: string }
							children: ReactNode
						}) =>
							value.href ? (
								<StyledLink href={value.href}>{children}</StyledLink>
							) : (
								<>{children} (empty link)</>
							),
					},
				}}
			/>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 30px;
		padding-right: 154px;
		color: ${colors.blog1.primary900};
		position: relative;
		overflow-wrap: break-word;
	`),
	f.small(css`
		padding-right: 0;
	`),
])

const BlogImage = styled(UniversalImage, [
	f.responsive(css`
		width: 100%;
		height: auto;
		border-radius: 16px;
	`),
])

const StyledNormal = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p2};
	`),
])

const StyledH1 = styled("h1", [
	f.responsive(css`
		${textStyles.blog1.h8Sans};
		padding-top: 32px;
	`),
])

const StyledH2 = styled("h2", [
	f.responsive(css`
		${textStyles.blog1.h7Serif};
		padding-top: 32px;
	`),
])

const StyledBlockQuote = styled("blockquote", [
	f.responsive(css`
		${textStyles.blog1.p1};
		color: ${colors.blog1.primary800};
		display: flex;
		flex-direction: column;
		padding: 40px;
		align-items: flex-start;
		gap: 30px;
		border-radius: 20px;
		background: ${colors.blog1.primary100};

		em {
			font-style: normal;
		}
	`),
])

const StyledUl = styled("ul", [
	f.responsive(css`
		list-style: disc;
		padding-inline-start: 2.3ch;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		${textStyles.blog1.p2};
	`),
])

const StyledStrong = styled("strong", [
	f.responsive(css`
		font-weight: 600;
	`),
])

const StyledLink = styled(UniversalLink, [
	f.responsive(css`
		color: ${colors.blog1.primary300};
		text-decoration: underline;
	`),
])

const StyledVideoEmbed = styled(VideoEmbed, [
	f.responsive(css`
		width: 100%;
		border-radius: 16px;
		aspect-ratio: 16 / 9;
		overflow: clip;
	`),
])
