import { css, unresponsive } from "library/styled"

/**
 * place all your colors here! the format is:
 * [hex color, optional p3 color]
 *
 * if you provide a p3 color, it will be used where supported
 */
const rawColors = {
	white: ["white"],
	red: ["red", "color(display-p3 1 0 0)"],
} as const satisfies Record<string, [string, string] | [string]>

/** widen the type a bit for processing */
const colorEntries: [string, [string, string] | [string]][] =
	Object.entries(rawColors)

/**
 * sets the values of CSS variables globally
 * include this in layout
 */
export const colorStyle = unresponsive(css`
	:root {
		@supports (not (color: color(display-p3 0 0 0))) {
			${colorEntries.map(([key, [hex]]) => {
				return `--${key}: ${hex};`
			})}
		}

		@supports (color: color(display-p3 0 0 0)) {
			${colorEntries.map(([key, [hex, p3]]) => {
				return `--${key}: ${p3 ?? hex};`
			})}
		}
	}
`)

/**
 * convert the raw colors to an object with the correct color for the current browser
 */
const CSSColors = Object.fromEntries(
	colorEntries.map(([key]) => {
		return [key, `var(--${key})`]
	}),
) as {
	[key in keyof typeof rawColors]: `var(--${key})`
}

/**
 * gsap can't animate variables, so we need to use the hex always
 */
const jsColors = Object.fromEntries(
	colorEntries.map(([key, [color]]) => {
		return [key, color]
	}),
) as {
	[key in keyof typeof rawColors]: (typeof rawColors)[key][0]
}

export default {
	...CSSColors,
	js: jsColors,
}
