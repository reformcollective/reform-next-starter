import type { GetSectionType } from "page"
import type { Page } from "sanity.types"

import BlogRich from "app/sections/blog/BlogRich"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import getReadTime from "app/utils/getReadTime"
import { css, f, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"

import type { ArticleContext, RecentPosts } from "../../types"

import { AuthorCard } from "../Author"
import BlogNav from "../BlogNav"
import RelatedPosts from "../RelatedPosts"
import CalendarSVG from "./date.inline.svg"
import TimeSVG from "./time.inline.svg"

export default function PostContent({
	title,
	mainImage,
	articleTextPreview,
	publishedAt,
	body,
	context,
	recentPosts,
}: {
	title: Page["title"]
	mainImage: GetSectionType<"blogArticle">["mainImage"]
	articleTextPreview: Page["articleTextPreview"]
	publishedAt: Page["publishedAt"]
	body: GetSectionType<"blogArticle">["body"]
	context: ArticleContext
	recentPosts: RecentPosts
}) {
	const { author, categories, hub } = context

	const formattedDate = publishedAt
		? new Date(publishedAt).toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: null

	const readTime = getReadTime(body)

	return (
		<Wrapper>
			<BlogNav
				categories={categories}
				hubPath={hub?.path ?? "/"}
				hubTitle={hub?.title ?? "Blog Home"}
			/>
			<BottomContent>
				<AuthorSidebar>
					<TopSide>Author</TopSide>
					<AuthorCard author={author} />
					<Details>
						<TopSide>Details</TopSide>
						<TextContent>
							{readTime && (
								<MetaItem>
									<Time /> Read Time: <Green>{readTime}</Green>
								</MetaItem>
							)}
							{formattedDate && (
								<MetaItem>
									<Calendar /> Date: <Green>{formattedDate}</Green>
								</MetaItem>
							)}
						</TextContent>
					</Details>
				</AuthorSidebar>
				<MainContent>
					<ArticleImage src={mainImage} loading="eager" sizes="(max-width: 768px) 318px, 670px" />
					<Title>{title}</Title>
					{articleTextPreview && <Description> {articleTextPreview}</Description>}
					<AuthorSidebarMobile>
						<TopSide>Author</TopSide>
						<AuthorCard author={author} />
						<Details>
							<TopSide>Details</TopSide>
							<TextContent>
								{readTime && (
									<MetaItem>
										<Time /> Read Time: <Green>{readTime}</Green>
									</MetaItem>
								)}
								{formattedDate && (
									<MetaItem>
										<Calendar /> Date: <Green>{formattedDate}</Green>
									</MetaItem>
								)}
							</TextContent>
						</Details>
					</AuthorSidebarMobile>

					{body && <BlogRich value={body} />}
				</MainContent>
			</BottomContent>
			{recentPosts && recentPosts.length > 0 && <RelatedPosts recentPosts={recentPosts} />}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		position: relative;
		grid-column: main;
		display: flex;
		flex-direction: column;
		background: ${colors.blog1.secondary200};
		border-radius: 16px;
		margin-top: 106px;
	`),
	f.small(css`
		grid-column: fullbleed;
		width: 100%;
	`),
])

const AuthorSidebar = styled("div", [
	f.responsive(css`
		position: sticky;
		top: 120px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		align-self: start;
	`),
	f.small(css`
		display: none;
	`),
])

const AuthorSidebarMobile = styled(AuthorSidebar, [
	f.responsive(css`
		display: none;
	`),
	f.small(css`
		display: flex;
		flex-direction: column;
		top: unset;
		width: 100%;
		align-items: flex-start;
		gap: unset;
	`),
])

const MetaItem = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p3};
		color: ${colors.blog1.primary700};
		display: flex;
		align-items: center;
		gap: 6px;
	`),
])

const MainContent = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 32px;
		min-width: 0;
		overflow-wrap: break-word;
	`),
	f.small(css`
		gap: 56px;
	`),
])

const ArticleImage = styled(UniversalImage, [
	f.responsive(css`
		width: 100%;
		aspect-ratio: 826 / 413;
		border-radius: 12px;
		overflow: clip;
	`),
	f.small(css``),
])

const Title = styled("h1", [
	f.responsive(css`
		${textStyles.blog1.h5Sans};
		color: ${colors.blog1.primary800};
		padding-right: 154px;
		padding-top: 32px;
	`),
	f.small(css`
		${textStyles.blog1.h8Sans};
		padding-right: 0;
	`),
])

const Description = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p1};
		color: ${colors.blog1.baseDark200};
		padding-right: 154px;
		white-space: pre-line;
	`),
	f.small(css`
		${textStyles.blog1.p2};
		padding-right: 0;
	`),
])

const BottomContent = styled("div", [
	f.responsive(css`
		display: grid;
		grid-template-columns: 337px auto;
		gap: 168px;
		padding: 42px 42px 84px;
	`),
	f.small(css`
		grid-template-columns: 1fr;
		gap: 28px;
		padding: 14px;
	`),
])

const TopSide = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p2};
		color: ${colors.blog1.primary800};
		padding-bottom: 24px;
		margin-bottom: 24px;
		border-bottom: 1px solid ${colors.blog1.secondary400};
		width: 100%;
	`),
	f.small(css`
		padding-bottom: 14px;
		margin-bottom: 14px;
	`),
])

const TextContent = styled("div", [
	f.responsive(
		css`
			display: flex;
			flex-direction: column;
			gap: 10px;
			color: ${colors.blog1.primary800};
		`,
	),
])

const Details = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 108px;
	`),
	f.small(css`
		width: 100%;
		margin-top: 54px;
		gap: unset;
	`),
])

const Time = styled(TimeSVG, [
	f.responsive(css`
		width: 16px;
		height: 16px;
		bottom: 2px;
		transform: translateY(-1px);
	`),
	f.small(css`
		left: -2px;
		transform: translateX(-2px) translateY(-1px);
	`),
])

const Calendar = styled(CalendarSVG, [
	f.responsive(css`
		width: 16px;
		height: 16px;
		transform: translateY(-1px);
	`),
	f.small(css`
		left: -2px;
		bottom: 2px;
		transform: translateX(-2px) translateY(-1px);
	`),
])

const Green = styled("span", [
	f.responsive(css`
		color: ${colors.blog1.primary300};
	`),
])
