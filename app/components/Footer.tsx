import type { FooterQueryResult } from "sanity.types"

import UniversalLink from "library/link"
import { css, f, styled } from "library/styled"

export default function Footer({ footerText }: NonNullable<FooterQueryResult>) {
	return (
		<Wrapper data-header-hide>
			<Content>
				<h1>Footer</h1>
				<p>The header is hidden while the Footer is in view</p>
				<p>{footerText}</p>
				<UniversalLink href="/" style={{ textDecoration: "underline" }}>
					Go to Home
				</UniversalLink>
				<UniversalLink href="/visual-tests" style={{ textDecoration: "underline" }}>
					Go to Visual Tests
				</UniversalLink>
			</Content>
		</Wrapper>
	)
}

const Wrapper = styled(
	"footer",
	f.responsive(css`
		display: grid;
		width: 100%;
		height: 300px;
		background-color: rebeccapurple;
		color: white;
		grid-column: fullbleed;
		place-items: center;
		view-transition-name: footer;
	`),
)

const Content = styled(
	"div",
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 10px;
		text-align: center;
	`),
)
