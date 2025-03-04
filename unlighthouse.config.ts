/// <reference types="unlighthouse" />

export default defineUnlighthouseConfig({
	ci: {
		buildStatic: true,
		reporter: "jsonSimple",
		budget: {
			performance: 50,
			accessibility: 90,
			"best-practices": 90,
			seo: 90,
		},
	},
})
