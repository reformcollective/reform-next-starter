/// <reference types="unlighthouse" />
import { defineConfig } from "unlighthouse"

export default defineConfig({
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
