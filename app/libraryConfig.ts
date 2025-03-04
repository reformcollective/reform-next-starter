import { type Config, defaultConfig } from "library/defaultConfig"

const config: Config<"slide"> = {
	...defaultConfig,
	viewTransitions: {
		slide: function slideInOut() {
			document.documentElement.animate(
				[
					{ opacity: 1, transform: "translate(0, 0)" },
					{ opacity: 0, transform: "translate(-100px, 0)" },
				],
				{
					duration: 400,
					easing: "ease",
					fill: "forwards",
					pseudoElement: "::view-transition-old(root)",
				},
			)

			document.documentElement.animate(
				[
					{ opacity: 0, transform: "translate(100px, 0)" },
					{ opacity: 1, transform: "translate(0, 0)" },
				],
				{
					duration: 400,
					easing: "ease",
					fill: "forwards",
					pseudoElement: "::view-transition-new(root)",
				},
			)
		},
	},
	defaultViewTransition: "default",
}

export default config
