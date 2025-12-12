/// <reference types="unlighthouse" />

export default defineUnlighthouseConfig({
	ci: {
		buildStatic: true,
		reporter: "jsonSimple",
		budget: {
			performance: 40, // 50 is fine, 60 is good, 70 is great, 80 is awesome, 90 is perfect
			accessibility: 90,
			"best-practices": 90,
			seo: 0, // seo is often CMS driven
		},
	},
})
