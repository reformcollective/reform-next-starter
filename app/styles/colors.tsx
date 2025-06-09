import { GlobalStyles } from "library/styled"

/**
 * place all your colors here! the format is:
 * [hex color, optional p3 color]
 *
 * if you provide a p3 color, it will be used where supported
 */
const rawColors = {
	white: ["#FFF", "color(display-p3 1 1 1)"],
	red: ["#FE3712"],
	black: ["#000", "color(display-p3 0 0 0)"],
} as const satisfies Record<string, [string, string] | [string]>

/** widen the type a bit for processing */
const colorEntries: [string, [string, string] | [string]][] =
	Object.entries(rawColors)

/**
 * sets the values of CSS variables globally
 * include this in layout
 */
export const ColorStyle = () => (
	<GlobalStyles>
		{{
			":root": {
				"@supports (not (color: color(display-p3 0 0 0)))": Object.fromEntries(
					colorEntries.map(([key, [hex]]) => {
						return [`--${key.toLowerCase()}`, hex]
					}),
				),
				"@supports (color: color(display-p3 0 0 0))": Object.fromEntries(
					colorEntries.map(([key, [hex, p3]]) => {
						return [`--${key.toLowerCase()}`, p3 ?? hex]
					}),
				),
			},
		}}
	</GlobalStyles>
)

/**
 * convert the raw colors to an object with the correct color for the current browser
 */
const CSSColors = Object.fromEntries(
	colorEntries.map(([key]) => {
		return [key, `var(--${key.toLowerCase()})`]
	}),
) as {
	[key in keyof typeof rawColors]: `var(--${key})`
}

export default CSSColors
