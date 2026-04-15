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
// Blog 1 semantic color mappings
// ---------------------------------------------------------------------------

const blog1Raw = {
	baseLight100: rawColors.white100,
	baseDark100: rawColors.black100,
	baseDark200: rawColors.black200,

	primary100: rawColors.evergreen100,
	primary200: rawColors.evergreen200,
	primary300: rawColors.evergreen300,
	primary400: rawColors.evergreen400,
	primary500: rawColors.evergreen500,
	primary600: rawColors.evergreen600,
	primary700: rawColors.evergreen700,
	primary800: rawColors.evergreen800,
	primary900: rawColors.evergreen900,
	primaryTag: rawColors.evergreenTag,
	primaryLight100: rawColors.neongreen100,
	primaryLight200: rawColors.neongreen200,

	accent100: rawColors.accentGreenLight,
	accent200: rawColors.accentGreenDark,

	secondary100: rawColors.cream100,
	secondary200: rawColors.cream200,
	secondary300: rawColors.cream300,
	secondary400: rawColors.cream400,
	secondary500: rawColors.cream500,

	tertiary100: rawColors.pink100,
	tertiary200: rawColors.pink200,
	tertiary300: rawColors.pink300,
	tertiary400: rawColors.pink400,

	quaternary100: rawColors.plum100,
	quaternary200: rawColors.plum200,
	quaternary300: rawColors.plum300,
	quaternary400: rawColors.plum400,

	gradientBreezy: rawColors.gradientBreezy,
} as const

const blog1FormRaw = {
	formLabel: rawColors.neongreen100,
	formInputBackground: rawColors.accentGreenDark,
	formInputText: rawColors.white100,
	formInputPlaceholder: rawColors.accentGreenLight,
	formInputBorder: ["transparent"] as const,
	formInputFocusRing: rawColors.evergreen300,
	formError: rawColors.pink400,
	formValid: rawColors.white100,
	formDropdownBackground: rawColors.evergreen600,
} as const

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

// Map a rawColors array reference back to its CSS var
const valueToVar = new Map(variables.map(({ value, variable }) => [value, variable]))
const resolveVar = (value: readonly string[]): `var(--${string})` =>
	(valueToVar.get(value) ?? "var(--unresolved)") as `var(--${string})`

export const colors = {
	white: flatColors.white,
	red: flatColors.red,
	green: flatColors.green,
	blue: flatColors.blue,
	black: flatColors.black,
	blog1: {
		...Object.fromEntries(Object.entries(blog1Raw).map(([key, value]) => [key, resolveVar(value)])),
		...Object.fromEntries(
			Object.entries(blog1FormRaw).map(([key, value]) => [key, resolveVar(value)]),
		),
	} as { [K in keyof typeof blog1Raw | keyof typeof blog1FormRaw]: `var(--${string})` },
}
