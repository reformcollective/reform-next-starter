import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled/alpha"
import type { FooterQueryResult } from "sanity.types"

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
			</Content>
		</Wrapper>
	)
}

const Wrapper = styled(
	"footer",
	fresponsive(css`
		background-color: rebeccapurple;
		color: white;
		display: grid;
		grid-column: fullbleed;
		place-items: center;
		height: 300px;
		width: 100%;
		view-transition-name: footer;
	`),
)

const Content = styled(
	"div",
	fresponsive(css`
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 10px;
	`),
)
