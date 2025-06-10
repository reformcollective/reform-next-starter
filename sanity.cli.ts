import { defineCliConfig } from "sanity/cli"

export default defineCliConfig({
	vite: {
		resolve: {
			alias: {
				"@": __dirname,
			},
		},
	},
})
