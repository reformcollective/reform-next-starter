/**
 * place all your colors here! the format is:
 * [hex color, optional p3 color]
 *
 * if you provide a p3 color, it will be used where supported
 */
export const rawColors = {
	white: ["#FFF", "color(display-p3 1 1 1)"],
	red: ["#FE3712"],
	black: ["#000", "color(display-p3 0 0 0)"],
} as const satisfies Record<string, [string, string] | [string]>

/** widen the type a bit for processing */
const colorEntries: [string, [string, string] | [string]][] =
	Object.entries(rawColors)

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

const jsColors = Object.fromEntries(
	colorEntries.map(([key, [hex]]) => {
		return [key, hex]
	}),
) as {
	[key in keyof typeof rawColors]: string
}

const colors = {
	...CSSColors,
	...jsColors,
	// add any custom colors here
} as const

export default colors
