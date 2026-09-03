import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"
import UniversalImage from "library/UniversalImage"

import type { PostAuthor } from "../types"

export function AuthorCard({ author }: { author: PostAuthor | null | undefined }) {
	if (!author) return null

	return (
		<Wrapper>
			{author.image && <Photo src={author.image} alt={`Photo of ${author.name}`} sizes="80px" />}
			<Text>
				<Name>{author.name}</Name>
				<Company>{author.company}</Company>
			</Text>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		display: flex;
		gap: 12px;
		align-items: center;
	`),
])

const Photo = styled(UniversalImage, [
	f.responsive(css`
		width: 48px;
		height: 48px;
		border-radius: 10px;
		overflow: clip;
	`),
	f.small(css`
		width: 46px;
		height: 46px;
	`),
])

const Text = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 10px;
	`),
])

const Name = styled("div", [
	f.responsive(css`
		${textStyles.blog1.link1};
		color: ${colors.blog1.primary800};
	`),
])

const Company = styled("div", [
	f.responsive(css`
		${textStyles.blog1.h8Serif};
		color: ${colors.black};
	`),
])
