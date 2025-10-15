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
	/**
	 * basePath
	 * The path where the Studio UI is mounted in your app (usually configured
	 * from `studioUrl`). This controls the route prefix for Sanity Studio.
	 */
	basePath: studioUrl,

	/**
	 * projectId
	 * Your Sanity project identifier. This tells the Studio which project to
	 * connect to when reading/writing content.
	 */
	projectId,

	/**
	 * dataset
	 * The dataset within the Sanity project to use (for example `production`).
	 * Keep separate datasets for staging/production if desired.
	 */
	dataset,

	/**
	 * title
	 * The human-readable title for the Studio. Shown in the Studio window/tab
	 * and used as a descriptive label for administrators.
	 */
	title: "TODO - give the studio a name",

	/**
	 * schema
	 * The Sanity schema configuration: register document and object types
	 * (including singletons, blog schemas, and other content types) here.
	 */
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

	/**
	 * beta
	 * Opt-in flags for experimental Studio features. The example here disables
	 * auto-creating of documents in beta feature flows.
	 */
	beta: { create: { startInCreateEnabled: false } },

	/**
	 * plugins
	 * An array of Studio plugins that extend functionality (presentation,
	 * structure, media sources, AI assist, vision, etc). Plugins may be
	 * conditionally included (for example, only in development).
	 */
	plugins: [
		/**
		 * presentationTool
		 * Adds a presentation layer in the Studio useful for previewing and
		 * locating documents in the front-end routing surface. Key options:
		 * - resolve.mainDocuments: define routes and filters for main documents
		 * - resolve.locations: provide quick links/locations for documents
		 * - previewUrl: configuration for draft-mode preview endpoints
		 */
		presentationTool({
			resolve: {
				mainDocuments: defineDocuments([
					{
						route: "/blog/:category/:slug", // multi-slug example
						filter: `_type == "post" && slug.current == $slug && category.slug.current == $category`,
					},
					{
						route: "/:slug",
						filter: `_type == "page" && slug.current == $slug`,
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
		/**
		 * structureTool
		 * Controls the Studio's sidebar/document tree structure and default
		 * document views. Provide a `structure` (S) builder and optionally
		 * a `defaultDocumentNode` to customize per-document view nodes (e.g.
		 * show form, preview, or custom views).
		 */
		structureTool({
			structure: pageStructure(singletons),
			defaultDocumentNode: (S) => {
				return S.document().views([S.view.form()])
			},
		}),
		linkField(),
		/**
		 * singletonPlugin
		 * Configures the global "new document" button and document actions to
		 * suit the Settings document singleton. Accepts an array of singleton
		 * names and adjusts the Studio's creation/actions UI accordingly.
		 */
		singletonPlugin(singletons.map((singleton) => singleton.name)),
		/**
		 * unsplashImageAsset
		 * Adds Unsplash as an image asset source so editors can search and insert
		 * images directly from Unsplash inside the Studio.
		 */
		unsplashImageAsset(),
		/**
		 * media
		 * Provides a media browser and tools for viewing and managing images and
		 * other media assets in the Studio.
		 */
		media(),
		/**
		 * muxInput
		 * Adds MUX video input support. Configure options such as
		 * `max_resolution_tier` to control upload/processing preferences.
		 */
		muxInput({
			max_resolution_tier: "2160p",
		}),
		/**
		 * assist
		 * Sets up AI Assist in the Studio with preset prompts and helpers.
		 * See: https://www.sanity.io/docs/ai-assist
		 */
		assist(),
		/**
		 * visionTool (development only)
		 * Enables the Vision tool which lets you run GROQ queries in the Studio.
		 * Included only when NODE_ENV === 'development'.
		 */
		env.NODE_ENV === "development" &&
			visionTool({ defaultApiVersion: apiVersion }),
	].filter(Boolean) as PluginOptions[],
})
