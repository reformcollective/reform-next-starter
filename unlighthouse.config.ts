/// <reference types="unlighthouse" />
import { defineConfig } from "unlighthouse"

export default defineConfig({
	ci: {
		budget: {
			performance: 100,
			accessibility: 100,
			"best-practices": 100,
			seo: 100,
		},
	},
})
