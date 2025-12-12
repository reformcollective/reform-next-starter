import { createVar, globalStyle } from "@vanilla-extract/css"

/**
 * place all your colors here!
 * the last supported color in the array will be used
 */
export const rawColors = {
  white: ["#FFF", "color(display-p3 1 1 1)"],
  red: ["#FE3712"],
  black: ["#000", "color(display-p3 0 0 0)"],
} as const

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

export const colors = Object.fromEntries(
  variables.map(({ key, variable }) => [key, variable]),
) as Record<keyof typeof rawColors, `var(--${string})`>
