import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"

type BlockquoteWithAttributionProps = {
	description?: string
	authorName?: string
	authorTitle?: string
}

export default function BlockquoteWithAttribution({
	description,
	authorName,
	authorTitle,
}: BlockquoteWithAttributionProps) {
	return (
		<Wrapper>
			<VerticalLine />
			{description && <Quote>{description}</Quote>}
			{(authorName || authorTitle) && (
				<NameWrapper>
					{authorName && <Name>{authorName}</Name>}
					{authorTitle && <Title>{authorTitle}</Title>}
				</NameWrapper>
			)}
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 70px 42px 70px 72px;
		border: 1px solid ${colors.blog1.secondary400};
		border-radius: 10px;
		background: ${colors.blog1.secondary300};
		gap: 48px;
	`),
	f.small(css`
		padding: 42px 28px 42px 56px;
		gap: 32px;
	`),
])

const Quote = styled("p", [
	f.responsive(css`
		${textStyles.blog1.p1};
	`),
	f.small(css`
		width: 100%;
	`),
])

const NameWrapper = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 10px;
	`),
])

const Name = styled("div", [
	f.responsive(css`
		color: ${colors.blog1.baseDark200};
		${textStyles.blog1.link1};
	`),
])

const Title = styled("div", [
	f.responsive(css`
		color: ${colors.blog1.baseDark200};
		${textStyles.blog1.h8Serif};
	`),
])

const VerticalLine = styled("div", [
	f.responsive(css`
		position: absolute;
		left: 42px;
		width: 2px;
		height: calc(100% - 84px);
		border-radius: 10px;
		background: ${colors.blog1.tertiary400};
	`),
	f.small(css`
		left: 28px;
		height: calc(100% - 56px);
	`),
])
