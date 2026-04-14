import { keyframes } from "@vanilla-extract/css"

export const preloaderExit = keyframes({
	to: {
		opacity: 0,
	},
})

export const logoPulse = keyframes({
	"0%, 100%": {
		opacity: 1,
	},
	"50%": {
		opacity: 0.5,
	},
})

export const logoOutro = keyframes({
	"0%": {
		transform: "scale(1)",
		opacity: 1,
	},
	"30%": {
		transform: "scale(1.2)",
		opacity: 1,
	},
	"100%": {
		transform: "scale(0)",
		opacity: 0,
	},
})
