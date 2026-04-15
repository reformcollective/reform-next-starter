import { createVar, globalStyle } from "@vanilla-extract/css"

/**
 * place all your colors here!
 * the last supported color in the array will be used
 */
export const rawColors = {
	white: ["#FFF", "color(display-p3 1 1 1)"],
	red: ["#FE3712"],
	green: ["#22C55E"],
	blue: ["#3B82F6"],
	black: ["#000", "color(display-p3 0 0 0)"],
	transparent: ["transparent"],

	// ---------------------------------------------------------------------------
	// Blog Template 1 Raw Values
	// NOTE: Placeholder colors from the enzo reference project.
	// Replace with project brand colors when adopting this template.
	// ---------------------------------------------------------------------------

	// Base
	white100: ["#FFFFFF"],
	black100: ["#1C1C1C"],
	black200: ["#000000"],

	// Primary (Blue-Greens)
	evergreen100: ["#EFFAF5"],
	evergreen200: ["#DDF3EE"],
	evergreen300: ["#007074"],
	evergreen400: ["#015A5D"],
	evergreen500: ["#004A50"],
	evergreen600: ["#004146"],
	evergreen700: ["#003438"],
	evergreen800: ["#012F33"],
	evergreen900: ["#00272A"],
	evergreenTag: ["#5CAFB5"],

	// Primary Light
	neongreen100: ["#DCFF9F"],
	neongreen200: ["#E7FFBF"],

	// Accent
	accentGreenLight: ["#418D93"],
	accentGreenDark: ["#024E54"],

	// Secondary (Creams)
	cream100: ["#FFFDF9"],
	cream200: ["#FFFAF2"],
	cream300: ["#FAF4E9"],
	cream400: ["#F3EADC"],
	cream500: ["#B6A895"],

	// Tertiary (Pinks)
	pink100: ["#DBC7D6"],
	pink200: ["#ECCEED"],
	pink300: ["#FEE7FF"],
	pink400: ["#FFA7EF"],

	// Quaternary (Plums)
	plum100: ["#864880"],
	plum200: ["#6D3368"],
	plum300: ["#592654"],
	plum400: ["#451F41"],

	// Gradients
	gradientBreezy: [
		"linear-gradient(144deg, #DCFF9F 10.87%, #EFFAF5 40.28%, #FEE7FF 69.7%, #F7F5EF 81.59%)",
	],
} as const

// ---------------------------------------------------------------------------
// Blog 1 semantic color mappings — values are keyof rawColors
// ---------------------------------------------------------------------------

const blog1Raw = {
	baseLight100: "white100",
	baseDark100: "black100",
	baseDark200: "black200",

	primary100: "evergreen100",
	primary200: "evergreen200",
	primary300: "evergreen300",
	primary400: "evergreen400",
	primary500: "evergreen500",
	primary600: "evergreen600",
	primary700: "evergreen700",
	primary800: "evergreen800",
	primary900: "evergreen900",
	primaryTag: "evergreenTag",
	primaryLight100: "neongreen100",
	primaryLight200: "neongreen200",

	accent100: "accentGreenLight",
	accent200: "accentGreenDark",

	secondary100: "cream100",
	secondary200: "cream200",
	secondary300: "cream300",
	secondary400: "cream400",
	secondary500: "cream500",

	tertiary100: "pink100",
	tertiary200: "pink200",
	tertiary300: "pink300",
	tertiary400: "pink400",

	quaternary100: "plum100",
	quaternary200: "plum200",
	quaternary300: "plum300",
	quaternary400: "plum400",

	gradientBreezy: "gradientBreezy",
} as const satisfies Record<string, keyof typeof rawColors>

const blog1FormRaw = {
	formLabel: "neongreen100",
	formInputBackground: "accentGreenDark",
	formInputText: "white100",
	formInputPlaceholder: "accentGreenLight",
	formInputBorder: "transparent",
	formInputFocusRing: "evergreen300",
	formError: "pink400",
	formValid: "white100",
	formDropdownBackground: "evergreen600",
} as const satisfies Record<string, keyof typeof rawColors>

// ---------------------------------------------------------------------------
// CSS variable generation — rawColors is the single source of truth for values
// ---------------------------------------------------------------------------

const variables = Object.entries(rawColors).map(([key, value]) => ({
	key,
	value,
	variable: createVar(`generated-color-${key}`),
}))

globalStyle(":root", {
	vars: Object.fromEntries(
		variables.map(({ value, variable }) => [variable, value as unknown as string]),
	),
})

const flatColors = Object.fromEntries(
	variables.map(({ key, variable }) => [key, variable]),
) as Record<keyof typeof rawColors, `var(--${string})`>

export const colors = {
	white: flatColors.white,
	red: flatColors.red,
	green: flatColors.green,
	blue: flatColors.blue,
	black: flatColors.black,
	blog1: {
		...Object.fromEntries(
			Object.entries(blog1Raw).map(([semantic, raw]) => [semantic, flatColors[raw]]),
		),
		...Object.fromEntries(
			Object.entries(blog1FormRaw).map(([semantic, raw]) => [semantic, flatColors[raw]]),
		),
	} as { [K in keyof typeof blog1Raw | keyof typeof blog1FormRaw]: `var(--${string})` },
}
