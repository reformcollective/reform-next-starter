import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import { Suspense } from "react"

import type { RecentPosts } from "../types"

import Kicker from "./Kicker"
import { PostList } from "./PostList"

export default function RelatedPosts({ recentPosts }: { recentPosts: RecentPosts }) {
	return (
		<RelatedWrapper>
			<Kicker size="medium" variant="dark">
				From The Blog
			</Kicker>
			<RelatedHeading>Related Articles</RelatedHeading>
			{recentPosts && recentPosts.length > 0 && (
				<Related>
					<Suspense fallback={<HelperText>Loading posts...</HelperText>}>
						<PostList posts={recentPosts} />
					</Suspense>
				</Related>
			)}
		</RelatedWrapper>
	)
}

const HelperText = styled("div", [
	f.responsive(css`
		${textStyles.blog1.p1};
	`),
])

const Related = styled("div", [
	f.responsive(css`
		position: relative;
		display: grid;
		grid-column: main;
		grid-template-columns: 1fr 1fr 1fr;
		margin: 0 auto;
		gap: 28px;
	`),
	f.small(css`
		grid-template-columns: 1fr;
		gap: 52px;
	`),
])

const RelatedHeading = styled("div", [
	f.responsive(css`
		display: grid;
		grid-column: main;
		${textStyles.blog1.h4Sans};
		color: ${colors.blog1.primary800};
		margin: 28px 0 54px;
	`),
	f.small(css`
		width: 300px;
		${textStyles.blog1.h5Sans};
	`),
])

const RelatedWrapper = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		grid-column: main;
		padding: 126px 48px;
	`),
	f.small(css`
		grid-column: fullbleed;
		width: 100%;
		padding: 126px 14px;
	`),
])
