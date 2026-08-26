import type { GetSectionType } from "page"

import FAQAccordion from "app/components/Accordion"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { getSanityDataAttribute } from "library/sanity/getSanityDataAttribute"
import { css, f, styled } from "library/styled"

export default function FaqSection({
	kicker,
	title,
	items,
	sanityDataAttribute,
}: GetSectionType<"faq">) {
	return (
		<Wrapper>
			<Inner>
				<TitleColumn>
					{kicker && (
						<Kicker data-sanity={getSanityDataAttribute(sanityDataAttribute, "kicker")}>
							{kicker}
						</Kicker>
					)}
					<Title data-sanity={getSanityDataAttribute(sanityDataAttribute, "title")}>{title}</Title>
				</TitleColumn>
				<FaqColumn data-sanity={getSanityDataAttribute(sanityDataAttribute, "items")}>
					<FAQAccordion items={items} />
				</FaqColumn>
			</Inner>
		</Wrapper>
	)
}

const Wrapper = styled("section", [
	f.responsive(css`
		grid-column: fullbleed;
		grid-template-columns: var(--subgrid-columns);
		position: relative;
		display: grid;
		background: ${colors.white};
		padding: 149px 0 125px;
	`),
	f.small(css`
		padding: 120px 0;
	`),
])

const Inner = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		gap: 64px;
	`),
	f.small(css`
		flex-direction: column;
		gap: 40px;
	`),
])

const TitleColumn = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 32px;
		width: 442px;
		flex-shrink: 0;
	`),
	f.small(css`
		width: 100%;
		gap: 20px;
	`),
])

const Kicker = styled("span", [
	f.responsive(css`
		${textStyles.kicker1};
		color: ${colors.black};
	`),
])

const Title = styled("h2", [
	f.responsive(css`
		${textStyles.h2};
		color: ${colors.black};
	`),
])

const FaqColumn = styled("div", [
	f.responsive(css`
		flex: 1;
		min-width: 0;
	`),
	f.small(css`
		width: 100%;
	`),
])
