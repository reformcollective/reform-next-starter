import type { FooterQueryResult } from "sanity.types"

import UniversalLink from "library/link"
import { css, f, styled } from "library/styled"

export default function Footer({ footerText, links }: NonNullable<FooterQueryResult>) {
	return (
		<Wrapper data-header-hide>
			<Content>
				<h1>Footer</h1>
				<p>The header is hidden while the Footer is in view</p>
				<p>{footerText}</p>
				{links && links.length > 0 && (
					<LinkRow>
						{links.map((link) => (
							<FooterLink key={link._key} href={link}>
								{link.text}
							</FooterLink>
						))}
					</LinkRow>
				)}
				<FooterLink href="/">Go to Home</FooterLink>
				<FooterLink href="/visual-tests">Go to Visual Tests</FooterLink>
			</Content>
		</Wrapper>
	)
}

const LinkRow = styled("nav", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 8px 20px;
		max-width: 700px;
		margin: 12px auto;
		padding: 16px 24px;
		border-top: 1px solid rgb(255 255 255 / 25%);
		border-bottom: 1px solid rgb(255 255 255 / 25%);
	`),
	f.small(css`
		gap: 6px 14px;
		max-width: 100%;
		padding: 14px;
	`),
])

const FooterLink = styled(UniversalLink, [
	f.responsive(css`
		text-decoration: underline;
		text-underline-offset: 3px;
		opacity: 0.75;
		transition: opacity 0.2s ease;
		white-space: nowrap;

		&:hover {
			opacity: 1;
		}
	`),
])

const Wrapper = styled(
	"footer",
	f.responsive(css`
		background-color: rebeccapurple;
		color: white;
		display: grid;
		grid-column: fullbleed;
		place-items: center;

		/* min rather than fixed, so the CMS link row can wrap without overflowing */
		min-height: 300px;
		padding: 32px 0;
		width: 100%;
		view-transition-name: footer;
	`),
)

const Content = styled(
	"div",
	f.responsive(css`
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 10px;
	`),
)
