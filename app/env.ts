import { createEnv } from "@t3-oss/env-nextjs"
import * as z from "zod"

export const env = createEnv({
	skipValidation: false,
	emptyStringAsUndefined: true,

	/**
	 * Unprefixed variables provided by the system
	 */
	shared: {
		NODE_ENV: z.enum(["development", "production", "test"]).optional(),
	},

	/**
	 * Serverside Environment variables, not available on the client.
	 * Will throw if you access these variables on the client.
	 */
	server: {
		SANITY_AUTH_TOKEN: z.string(),
	},

	/**
	 * Environment variables available on the client (and server).
	 *
	 * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
	 */
	client: {
		NEXT_PUBLIC_SANITY_PROJECT_ID: z.string(),
		NEXT_PUBLIC_SANITY_DATASET: z.string(),
	},

	/**
	 * Due to how Next.js bundles environment variables on Edge and Client,
	 * we need to manually destructure them to make sure all are included in bundle.
	 *
	 * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
	 */
	runtimeEnv: {
		NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
		NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
		SANITY_AUTH_TOKEN: process.env.SANITY_AUTH_TOKEN,
		NODE_ENV: process.env.NODE_ENV,
	},
})
