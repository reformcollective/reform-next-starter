/**
 * This config is used to set up Sanity Studio that's mounted on the `app/(sanity)/studio/[[...tool]]/page.tsx` route
 */

import { assist } from "@sanity/assist"
import { visionTool } from "@sanity/vision"
import { env } from "app/env"
import gsap from "gsap/all"
import { pageStructure, singletonPlugin } from "library/sanity/singletonPlugin"
import { defineConfig, type PluginOptions } from "sanity"
import { presentationTool } from "sanity/presentation"
import { structureTool } from "sanity/structure"
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash"
import { linkField } from "sanity-plugin-link-field"
import { media } from "sanity-plugin-media"
import { muxInput } from "sanity-plugin-mux-input"
import { apiVersion, dataset, projectId, studioUrl } from "sanity/lib/api"
import footer from "sanity/schemas/singletons/footer"
import header from "sanity/schemas/singletons/header"
import settings from "sanity/schemas/singletons/settings"
import { youtube } from "library/sanity/reusables"
import page from "sanity/schemas/sanityPage"
import { RocketIcon } from "node_modules/@sanity/icons/dist"
import { authorType } from "sanity/schemas/blog/authorType"
import { blockContentType } from "sanity/schemas/blog/blockContentType"
import { categoryType } from "sanity/schemas/blog/categoryType"
import { postType } from "sanity/schemas/blog/postType"
import {
	getLinkableTypes,
	resolveDocumentLocations,
	resolveProductionUrl,
} from "sanity/lib/slug-resolver"
import { siteURL } from "library/siteURL"
import { codeInput } from "@sanity/code-input"

// if GSAP tries to run during manifest generation it might fail in prod
gsap.ticker.sleep()

const singletons = [settings, header, footer]

export default defineConfig({
	/**
	 * workspace properties
	 * @see https://www.sanity.io/docs/studio/configuration#k781e9f7dc1c2
	 */
	// ⬇ Required
	dataset,
	projectId,
	basePath: studioUrl,
	// ⬇ Optional
	title: "TODO - name the studio",
	subtitle: "subtitle",
	icon: RocketIcon,

	/**
	 * schema types to include
	 * @see https://www.sanity.io/docs/studio/configuration#k1ed5d17ef21e
	 */
	schema: {
		types: [
			// singletons
			...singletons,

			// reusables
			youtube,

			// blog
			authorType,
			blockContentType,
			categoryType,
			postType,

			// project schemas
			page,
		],
	},

	/**
	 * document actions and badges
	 * @see https://www.sanity.io/docs/studio/configuration#f9bb2e4a3c59
	 */
	document: {
		productionUrl: async (_, context) => {
			return resolveProductionUrl(context.document)
		},
	},

	/**
	 * plugins!
	 */
	plugins: [
		// ===============================
		// tool plugins
		// ===============================

		/**
		 * presentation tool, for live previews of draft content
		 * @see https://www.sanity.io/docs/visual-editing/configuring-the-presentation-tool
		 */
		presentationTool({
			previewUrl: {
				initial: siteURL,
				previewMode: {
					enable: "/api/draft-mode/enable",
					disable: "/api/draft-mode/disable",
				},
			},
			allowOrigins: ["http://localhost:*"],
			resolve: { locations: resolveDocumentLocations },
			title: "Live Preview",
		}),

		/**
		 * structure tool
		 * @see https://www.sanity.io/docs/studio/structure-tool
		 */
		structureTool({ structure: pageStructure(singletons), title: "All Content" }),

		/**
		 * media tool
		 * @see https://www.sanity.io/plugins/sanity-plugin-media
		 */
		media(),

		/**
		 * video tool
		 * @see https://www.sanity.io/plugins/sanity-plugin-mux-input
		 */
		muxInput({ max_resolution_tier: "2160p" }),

		/**
		 * vision tool
		 * @see https://www.sanity.io/docs/content-lake/the-vision-plugin
		 */
		env.NODE_ENV === "development" && visionTool({ defaultApiVersion: apiVersion }),

		// ===============================
		// non-tool plugins
		// ===============================

		/**
		 * adds a link field that allows you to link to other documents
		 * @see https://www.sanity.io/plugins/sanity-plugin-link-field
		 */
		linkField({
			linkableSchemaTypes: getLinkableTypes(),
		}),
		/**
		 * our custom singleton plugin
		 */
		singletonPlugin(singletons.map((singleton) => singleton.name)),
		/**
		 * adds unsplash as an image asset source
		 */
		unsplashImageAsset(),
		/**
		 * adds AI assist
		 */
		assist(),
		/**
		 * adds syntax-highlighted code input
		 */
		codeInput(),
	].filter(Boolean) as PluginOptions[],
})
