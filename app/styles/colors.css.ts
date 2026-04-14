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
} as const

// ---------------------------------------------------------------------------
// Blog Template 1 Colors
// NOTE: These are placeholder colors ported from the enzo reference project.
// Replace with project brand colors when adopting this template.
// ---------------------------------------------------------------------------
export const blog1RawColors = {
	// Base
	blog1White100: ["#FFFFFF"],
	blog1Black100: ["#1C1C1C"],
	blog1Black200: ["#000000"],

	// Primary Blue-Greens (placeholder — replace with brand)
	blog1Evergreen100: ["#EFFAF5"],
	blog1Evergreen200: ["#DDF3EE"],
	blog1Evergreen300: ["#007074"],
	blog1Evergreen400: ["#015A5D"],
	blog1Evergreen500: ["#004A50"],
	blog1Evergreen600: ["#004146"],
	blog1Evergreen700: ["#003438"],
	blog1Evergreen800: ["#012F33"],
	blog1Evergreen900: ["#00272A"],
	blog1EvergreenTag: ["#5CAFB5"],

	blog1Neongreen100: ["#DCFF9F"],
	blog1Neongreen200: ["#E7FFBF"],

	// Accent
	blog1AccentGreenLight: ["#418D93"],
	blog1AccentGreenDark: ["#024E54"],

	// Secondary (placeholder — replace with brand)
	blog1Cream100: ["#FFFDF9"],
	blog1Cream200: ["#FFFAF2"],
	blog1Cream300: ["#FAF4E9"],
	blog1Cream400: ["#F3EADC"],
	blog1Cream500: ["#B6A895"],

	blog1Pink100: ["#DBC7D6"],
	blog1Pink200: ["#ECCEED"],
	blog1Pink300: ["#FEE7FF"],
	blog1Pink400: ["#FFA7EF"],

	blog1Plum100: ["#864880"],
	blog1Plum200: ["#6D3368"],
	blog1Plum300: ["#592654"],
	blog1Plum400: ["#451F41"],

	// Gradients
	blog1GradientBreezy: [
		"linear-gradient(144deg, #DCFF9F 10.87%, #EFFAF5 40.28%, #FEE7FF 69.7%, #F7F5EF 81.59%)",
	],
} as const

// Blog 1 form colors — reference blog1RawColors to stay in sync
const blog1FormColors = {
	blog1FormLabel: blog1RawColors.blog1Neongreen100,
	blog1FormInputBackground: blog1RawColors.blog1AccentGreenDark,
	blog1FormInputText: blog1RawColors.blog1White100,
	blog1FormInputPlaceholder: blog1RawColors.blog1AccentGreenLight,
	blog1FormInputBorder: ["transparent"] as const,
	blog1FormInputFocusRing: blog1RawColors.blog1Evergreen300,
	blog1FormError: blog1RawColors.blog1Pink400,
	blog1FormValid: blog1RawColors.blog1White100,
	blog1FormDropdownBackground: blog1RawColors.blog1Evergreen600,
} as const

const allColors = {
	...rawColors,
	...blog1RawColors,
	...blog1FormColors,
} as const

const variables = Object.entries(allColors).map(([key, value]) => ({
	key,
	value,
	variable: createVar(`generated-color-${key}`),
}))

globalStyle(":root", {
	vars: Object.fromEntries(
		variables.map(({ value, variable }) => [variable, value as unknown as string]),
	),
})

export const colors = Object.fromEntries(
	variables.map(({ key, variable }) => [key, variable]),
) as Record<keyof typeof allColors, `var(--${string})`>
