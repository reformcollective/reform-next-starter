import { globalStyle } from "@vanilla-extract/css"
import { rawColors } from "styles/colors"

const colorEntries: [string, [string, string] | [string]][] =
	Object.entries(rawColors)

globalStyle(":root", {
	"@supports (not (color: color(display-p3 0 0 0)))": {
		vars: Object.fromEntries(
			colorEntries.map(([key, [hex]]) => {
				return [`--${key.toLowerCase()}`, hex]
			}),
		),
	},
	"@supports (color: color(display-p3 0 0 0))": {
		vars: Object.fromEntries(
			colorEntries.map(([key, [hex, p3]]) => {
				return [`--${key.toLowerCase()}`, p3 ?? hex]
			}),
		),
	},
})
