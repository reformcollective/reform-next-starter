import { env } from "env"
import { defineCliConfig } from "sanity/cli"

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({
	api: { projectId, dataset },
	vite: {
		resolve: {
			alias: {
				"@": __dirname,
			},
		},
	},
})
