/**
 * This config is used to set up Sanity Studio that's mounted on the `app/(sanity)/studio/[[...tool]]/page.tsx` route
 */

import { assist } from "@sanity/assist"
import { visionTool } from "@sanity/vision"
import { env } from "env"
import gsap from "gsap/all"
import { pageStructure, singletonPlugin } from "library/sanity/singletonPlugin"
import { defineConfig, type PluginOptions } from "sanity"
import {
	type DocumentLocation,
	defineDocuments,
	defineLocations,
	presentationTool,
} from "sanity/presentation"
import { structureTool } from "sanity/structure"
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash"
import { linkField } from "sanity-plugin-link-field"
import { media } from "sanity-plugin-media"
import { muxInput } from "sanity-plugin-mux-input"
import { apiVersion, dataset, projectId, studioUrl } from "@/sanity/lib/api"
import footer from "@/sanity/schemas/singletons/footer"
import header from "@/sanity/schemas/singletons/header"
import settings from "@/sanity/schemas/singletons/settings"
import youtube from "@/sanity/schemas/youtube"
import author from "./sanity/schemas/blog/author"
import post from "./sanity/schemas/blog/post"
import page from "./sanity/schemas/sanityPage"

// if GSAP tries to run during manifest generation it might fail in prod
gsap.ticker.sleep()

const homeLocation = {
	title: "Home",
	href: "/",
} satisfies DocumentLocation

const singletons = [settings, header, footer]

export default defineConfig({
	basePath: studioUrl,
	projectId,
	dataset,
	title: "TODO - give the studio a name",
	schema: {
		types: [
			// Singletons
			...singletons,
			// Blog
			author,
			post,
			// Other Schemas
			youtube,
			page,
		],
	},
	beta: { create: { startInCreateEnabled: false } },
	plugins: [
		presentationTool({
			resolve: {
				mainDocuments: defineDocuments([
					{
						route: "/blog/:category/:slug", // multi-slug example
						filter: `_type == "post" && slug.current == $slug && category.slug.current == $category`,
					},
					{
						route: "/pages/*",
						filter: `_type == "page"`,
					},
				]),
				locations: {
					...Object.fromEntries(
						singletons.map((singleton) => [
							singleton.name,
							defineLocations({
								locations: [homeLocation],
								message: "This document is used on all pages",
								tone: "caution",
							}),
						]),
					),
					post: defineLocations({
						select: {
							title: "title",
							slug: "slug.current",
						},
						resolve: (doc) => ({
							locations: doc?.slug
								? [
										{
											title: doc?.title || "Untitled",
											href: `/posts/${doc?.slug}`,
										},
									]
								: [],
						}),
					}),
					page: defineLocations({
						select: {
							title: "title",
							slug: "slug.current",
						},
						resolve: (doc) => ({
							locations: doc?.slug
								? [
										{
											title: doc?.title || "Untitled",
											href: `/${doc.slug}`,
										},
									]
								: [],
						}),
					}),
				},
			},
			previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
		}),
		structureTool({
			structure: pageStructure(singletons),
			defaultDocumentNode: (S) => {
				return S.document().views([S.view.form()])
			},
		}),
		linkField(),
		// Configures the global "new document" button, and document actions, to suit the Settings document singleton
		singletonPlugin(singletons.map((singleton) => singleton.name)),
		// Add an image asset source for Unsplash
		unsplashImageAsset(),
		// View all images in the Studio
		media(),
		// Videos with MUX
		muxInput({
			max_resolution_tier: "2160p",
		}),
		// Sets up AI Assist with preset prompts
		// https://www.sanity.io/docs/ai-assist
		assist(),
		// Vision lets you query your content with GROQ in the studio
		// https://www.sanity.io/docs/the-vision-plugin
		env.NODE_ENV === "development" &&
			visionTool({ defaultApiVersion: apiVersion }),
	].filter(Boolean) as PluginOptions[],
})
