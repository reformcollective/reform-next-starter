import type { UniversalLinkProps } from "library/link"

import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import UniversalLink from "library/link"
import { css, f, styled } from "library/styled"

import ArrowIcon from "./Arrow.inline.svg"

// text styles live on this span rather than the inline-flex anchor, so capsize's
// pseudo-elements do not become flex items alongside the arrow
const Label = styled("span", [f.responsive(css``)])

export default function ButtonLink({
	children,
	arrow,
	blog,
	isHovered,
	className,
	...props
}: UniversalLinkProps & {
	arrow?: boolean
	blog?: boolean
	className?: string
	isHovered?: boolean
}) {
	return (
		<Wrapper {...props} className={className} arrow={arrow} blog={blog} isHovered={isHovered}>
			<Label>{children}</Label>
			{arrow && <Arrow />}
		</Wrapper>
	)
}

const Wrapper = styled(UniversalLink, {
	base: [
		f.responsive(css`
			color: ${colors.blog1.primary200};
			text-decoration: none;
			cursor: pointer;
			display: inline-flex;
			align-items: center;

			&:hover svg {
				transform: translateX(5px);
			}
		`),
	],
	variants: {
		arrow: {
			false: [
				f.responsive(css`
					& > span {
						${textStyles.blog1.link3}
					}
				`),
			],
			true: [
				f.responsive(css`
					& > span {
						${textStyles.blog1.link2}
					}
				`),
			],
		},
		blog: {
			false: [
				f.responsive(css`
					& > span {
						${textStyles.blog1.link3}
					}
				`),
			],
			true: [
				f.responsive(css`
					color: ${colors.blog1.quaternary400};

					& > span {
						${textStyles.blog1.link1}
					}
				`),
			],
		},
		isHovered: {
			true: [
				f.responsive(css`
					svg {
						transform: translateX(5px);
					}
				`),
			],
			false: [
				f.responsive(css`
					svg {
						transform: translateX(0);
					}
				`),
			],
		},
	},
	defaultVariants: {
		arrow: false,
		blog: false,
		isHovered: false,
	},
})

const Arrow = styled(ArrowIcon, [
	f.responsive(css`
		width: 11px;
		height: auto;
		transition: transform 0.3s ease-out;
		margin-left: 8px;
	`),
])
