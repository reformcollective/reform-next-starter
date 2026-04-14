"use client"

import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import UniversalLink, { isRouteDefined } from "library/link"
import type { CMSLink } from "library/link"
import { css, f, styled } from "library/styled/alpha"

export type DiscoverCTAData = {
	title?: string | null
	text?: string | null
	colorScheme?: "light" | "dark" | null
	link?: CMSLink | null
}

export function DiscoverCTA({ title, text, link, colorScheme = "light" }: DiscoverCTAData) {
	const scheme = colorScheme ?? "light"

	return (
		<Wrapper colorScheme={scheme}>
			<ContentWrapper colorScheme={scheme}>
				<TextWrapper>
					<Headline colorScheme={scheme}>{title}</Headline>
					<Body colorScheme={scheme}>{text}</Body>
				</TextWrapper>
				{isRouteDefined(link) && (
					<CTALink href={link} colorScheme={scheme}>
						{link?.text || "Learn More"}
					</CTALink>
				)}
			</ContentWrapper>
		</Wrapper>
	)
}

const Wrapper = styled("div", {
	base: [
		f.responsive(css`
			position: relative;
			width: 100%;
			grid-column: fullbleed;
			display: grid;
			place-items: center;
		`),
	],
	variants: {
		colorScheme: {
			light: [
				f.responsive(css`
					padding: 53px 0 69px;
				`),
				f.small(css`
					padding: 14px;
				`),
			],
			dark: [
				f.responsive(css`
					background: ${colors.blog1Evergreen900};
				`),
			],
		},
	},
})

const ContentWrapper = styled("div", {
	base: [
		f.responsive(css`
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 35px;
			min-height: 600px;
			border-radius: 16px;
			text-align: center;
			overflow: clip;
			width: 1332px;
		`),
		f.small(css`
			width: 100%;
			padding: 56px 28px;
			border-radius: 8px;
		`),
	],
	variants: {
		colorScheme: {
			light: [
				f.responsive(css`
					background: linear-gradient(
						138deg,
						${colors.blog1Neongreen100} -11.41%,
						${colors.blog1Evergreen100} 18.02%,
						${colors.blog1Pink300} 34.96%,
						${colors.blog1Cream100} 78.44%
					);
				`),
			],
			dark: [
				f.responsive(css`
					padding: 170px 0;
					width: 1440px;
					border-radius: 0;
				`),
				f.small(css`
					padding: 116px 28px;
				`),
			],
		},
	},
})

const TextWrapper = styled("div", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 35px;
		width: 100%;
	`),
])

const Headline = styled("h2", {
	base: [
		f.responsive(css`
			${textStyles.h2Sans};
			text-align: center;
		`),
		f.small(css`
			${textStyles.h6Sans};
		`),
	],
	variants: {
		colorScheme: {
			light: [
				f.responsive(css`
					color: ${colors.blog1Evergreen900};
				`),
			],
			dark: [
				f.responsive(css`
					color: ${colors.blog1Cream100};
				`),
			],
		},
	},
})

const Body = styled("p", {
	base: [
		f.responsive(css`
			${textStyles.p2};
			width: 300px;
			white-space: pre-line;
		`),
	],
	variants: {
		colorScheme: {
			light: [
				f.responsive(css`
					color: ${colors.blog1Evergreen900};
				`),
			],
			dark: [
				f.responsive(css`
					color: ${colors.blog1Cream300};
				`),
			],
		},
	},
})

const CTALink = styled(UniversalLink, {
	base: [
		f.responsive(css`
			${textStyles.p2};
			padding: 16px 32px;
			border-radius: 10px;
			font-weight: 600;
			cursor: pointer;
			text-decoration: none;
			transition: opacity 0.15s ease;

			&:hover {
				opacity: 0.85;
			}
		`),
	],
	variants: {
		colorScheme: {
			light: [
				f.responsive(css`
					background: ${colors.blog1Evergreen700};
					color: ${colors.blog1Cream100};
				`),
			],
			dark: [
				f.responsive(css`
					background: ${colors.blog1Cream100};
					color: ${colors.blog1Evergreen900};
				`),
			],
		},
	},
})
