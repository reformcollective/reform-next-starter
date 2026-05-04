/**
 * This config is used to set up Sanity Studio that's mounted on the `app/(sanity)/studio/[[...tool]]/page.tsx` route
 */

import { assist } from "@sanity/assist"
import { RocketIcon } from "@sanity/icons"
import { visionTool } from "@sanity/vision"
import { env } from "app/env"
import gsap from "gsap/all"
import { staticLinkType } from "library/link/staticLinkType"
import { pageStructure, singletonPlugin } from "library/sanity/singletonPlugin"
import { structureTool } from "sanity/structure"
import { defineConfig, type PluginOptions } from "sanity"
import { presentationTool } from "sanity/presentation"
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash"
import { linkField } from "sanity-plugin-link-field"
import { media } from "sanity-plugin-media"
import { muxInput } from "sanity-plugin-mux-input"
import { apiVersion, dataset, projectId, studioUrl } from "sanity/lib/api"
import footer from "sanity/schemas/singletons/footer"
import header from "sanity/schemas/singletons/header"
import settings from "sanity/schemas/singletons/settings"

import { video, youtube } from "library/sanity/reusables"
import page from "sanity/schemas/sanityPage"
import { blog1AuthorType } from "sanity/schemas/blog/blog-1/authorType"
import { blog1BlockContentType } from "sanity/schemas/blog/blog-1/blockContentType"
import { blog1CategoryType } from "sanity/schemas/blog/blog-1/categoryType"
import { blog1PostType } from "sanity/schemas/blog/blog-1/postType"
import { blog1Hub } from "sanity/schemas/singletons/blog-1"
import {
	getLinkableTypes,
	resolveDocumentLocations,
	resolveProductionUrl,
} from "library/sanity/document-helpers"
import { siteURL } from "library/siteURL"
import { codeInput } from "@sanity/code-input"

// if GSAP tries to run during manifest generation it might fail in prod
gsap.ticker.sleep()

const singletons = [settings, header, footer]
const allSingletons = [...singletons, blog1Hub]

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
			...allSingletons,

			// reusables
			youtube,
			video,

			// blog-1 template schemas
			blog1AuthorType,
			blog1BlockContentType,
			blog1CategoryType,
			blog1PostType,

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
		structureTool({
			title: "All Content",
			structure: pageStructure(singletons, [
				{
					item: (S) =>
						S.listItem()
							.title("Blog 1")
							.child(
								S.list()
									.title("Blog 1")
									.items([
										S.listItem()
											.title("Hub Settings")
											.child(
												S.editor().id("blog1Hub").schemaType("blog1Hub").documentId("blog1Hub"),
											),
										S.documentTypeListItem("blog1Post").title("Posts"),
										S.documentTypeListItem("blog1Author").title("Authors"),
										S.documentTypeListItem("blog1Category").title("Categories"),
									]),
							),
					hiddenTypes: ["blog1Hub", "blog1Post", "blog1Author", "blog1Category"],
				},
			]),
		}),

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
			customLinkTypes: [staticLinkType()],
		}),
		/**
		 * our custom singleton plugin
		 */
		singletonPlugin(allSingletons.map((singleton) => singleton.name)),
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
