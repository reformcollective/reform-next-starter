/// <reference types="unlighthouse" />
import { defineConfig } from "unlighthouse"

export default defineConfig({
	ci: {
		budget: {
			performance: 50,
			accessibility: 90,
			"best-practices": 90,
			seo: 90,
		},
	},
})
