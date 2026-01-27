/**
 * As this file is reused in several other files, try to keep it lean and small.
 * Importing other npm packages here could lead to needlessly increasing the client bundle size, or end up in a server-only function that don't need it.
 */

import { env } from "app/env"

export const dataset = env.NEXT_PUBLIC_SANITY_DATASET

export const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID

/**
 * see https://www.sanity.io/docs/api-versioning for how versioning works
 */
export const apiVersion = "2025-12-11"

/**
 * Used to configure edit intent links, for Presentation Mode, as well as to configure where the Studio is mounted in the router.
 */
export const studioUrl = "/studio"
