import type { ComponentProps } from "react"

import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"

type KickerProps = ComponentProps<"span"> & {
	size?: "large" | "medium" | "tag"
	variant?: "dark" | "light"
	children: React.ReactNode
}

export default function Kicker({
	size = "large",
	variant = "dark",
	children,
	...props
}: KickerProps) {
	return (
		<Wrapper size={size} variant={variant} {...props}>
			<span>{children}</span>
		</Wrapper>
	)
}

const Wrapper = styled("span", {
	base: [
		f.responsive(css`
			display: inline-flex;
			justify-content: center;
			align-items: center;
			gap: 8px;
			border-radius: 99vw;
			width: fit-content;
		`),
	],
	variants: {
		size: {
			large: [
				f.responsive(css`
					height: 43px;
					padding: 15px 18px;

					span {
						${textStyles.blog1.kicker1}
					}
				`),
			],
			medium: [
				f.responsive(css`
					height: 33px;
					padding: 12px 14px;

					span {
						${textStyles.blog1.kicker2}
					}
				`),
			],
			tag: [
				f.responsive(css`
					height: 39px;
					padding: 15px 18px;
					${textStyles.blog1.p3}
				`),
			],
		},
		variant: {
			dark: [
				f.responsive(css`
					background: ${colors.blog1.primary900};
					color: ${colors.blog1.primaryLight100};
				`),
			],
			light: [
				f.responsive(css`
					background: ${colors.blog1.primary200};
					color: ${colors.blog1.primary700};
				`),
			],
		},
	},
})
