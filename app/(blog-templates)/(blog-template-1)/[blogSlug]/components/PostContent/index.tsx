import BlogRich from "app/(blog-templates)/(blog-template-1)/[blogSlug]/BlogRich"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import getReadTime from "app/utils/getReadTime"
import { css, f, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"

import type { Post, RecentPosts } from "../../types"

import BlogNav from "../BlogNav"
import RelatedPosts from "../RelatedPosts"
import CalendarSVG from "./date.inline.svg"
import TimeSVG from "./time.inline.svg"

export default function PostContent({
	post,
	recentPosts,
}: {
	post: Post
	recentPosts: RecentPosts
}) {
	const { author, title, mainImage, categories, articleTextPreview, body, publishedAt } = post

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
			<BlogNav categories={categories} />
			<BottomContent>
				<AuthorSidebar>
					<TopSide>Author</TopSide>
					<Author>
						{author?.image && (
							<AuthorPhoto src={author.image} alt={`Photo of ${author.name}`} sizes="80px" />
						)}
						<TextContent>
							<AuthorName>{author?.name}</AuthorName>
							<CompanyName>{author?.company}</CompanyName>
						</TextContent>
					</Author>
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
						<Author>
							{author?.image && (
								<AuthorPhoto src={author.image} alt={`Photo of ${author.name}`} sizes="80px" />
							)}
							<TextContent>
								<AuthorName>{author?.name}</AuthorName>
								<CompanyName>{author?.company}</CompanyName>
							</TextContent>
						</Author>
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
		display: flex;
		flex-direction: column;
		border-radius: 16px;
		margin-top: 106px;
		background: ${colors.blog1.secondary200};
		grid-column: main;
	`),
	f.small(css`
		width: 100%;
		grid-column: fullbleed;
	`),
])

const AuthorSidebar = styled("div", [
	f.responsive(css`
		position: sticky;
		top: 120px;
		display: flex;
		flex-direction: column;
		align-self: start;
		gap: 12px;
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
		top: unset;
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: flex-start;
		gap: unset;
	`),
])

const AuthorPhoto = styled(UniversalImage, [
	f.responsive(css`
		overflow: clip;
		width: 48px;
		height: 48px;
		border-radius: 10px;
	`),
	f.small(css`
		width: 46px;
		height: 46px;
	`),
])

const AuthorName = styled("div", [
	f.responsive(css`
		${textStyles.blog1.link1};
		color: ${colors.blog1.primary800};
	`),
])

const MetaItem = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p3};
		display: flex;
		align-items: center;
		color: ${colors.blog1.primary700};
		gap: 6px;
	`),
])

const MainContent = styled("div", [
	f.responsive(css`
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 32px;
		overflow-wrap: break-word;
	`),
	f.small(css`
		gap: 56px;
	`),
])

const ArticleImage = styled(UniversalImage, [
	f.responsive(css`
		overflow: clip;
		width: 100%;
		border-radius: 12px;
		aspect-ratio: 826 / 413;
	`),
])

const Title = styled("h1", [
	f.responsive(css`
		${textStyles.blog1.h5Sans};
		padding-top: 32px;
		padding-right: 154px;
		color: ${colors.blog1.primary800};
	`),
	f.small(css`
		${textStyles.blog1.h8Sans};
		padding-right: 0;
	`),
])

const Description = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p1};
		padding-right: 154px;
		color: ${colors.blog1.baseDark200};
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
		padding: 42px 42px 84px;
		gap: 168px;
		grid-template-columns: 337px auto;
	`),
	f.small(css`
		padding: 14px;
		gap: 28px;
		grid-template-columns: 1fr;
	`),
])

const TopSide = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p2};
		width: 100%;
		padding-bottom: 24px;
		border-bottom: 1px solid ${colors.blog1.secondary400};
		margin-bottom: 24px;
		color: ${colors.blog1.primary800};
	`),
	f.small(css`
		padding-bottom: 14px;
		margin-bottom: 14px;
	`),
])

const Author = styled("div", [
	f.responsive(css`
		display: flex;
		align-items: center;
		gap: 12px;
	`),
])

const TextContent = styled("div", [
	f.responsive(
		css`
			display: flex;
			flex-direction: column;
			color: ${colors.blog1.primary800};
			gap: 10px;
		`,
	),
])

const CompanyName = styled("div", [
	f.responsive(css`
		${textStyles.blog1.h8Serif};
		color: ${colors.black};
	`),
])

const Details = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		margin-top: 108px;
		gap: 16px;
	`),
	f.small(css`
		width: 100%;
		margin-top: 54px;
		gap: unset;
	`),
])

const Time = styled(TimeSVG, [
	f.responsive(css`
		bottom: 2px;
		width: 16px;
		height: 16px;
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
		bottom: 2px;
		left: -2px;
		transform: translateX(-2px) translateY(-1px);
	`),
])

const Green = styled("span", [
	f.responsive(css`
		color: ${colors.blog1.primary300};
	`),
])
