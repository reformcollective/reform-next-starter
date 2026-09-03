import { sampleProjection } from "sanity/schemas/sections/projections/sample"

export const sectionProjection = `
	${sampleProjection}
` as const

const PROJECTION_SIZE_LIMIT = 8_000

// Sanity switches from GET to POST above ~11kB, and POST responses carry no sync tags, so
// revalidateTag would silently stop working rather than error.
if (sectionProjection.length > PROJECTION_SIZE_LIMIT) {
	throw new Error(
		`The composed section projection is ${sectionProjection.length} bytes, over the ${PROJECTION_SIZE_LIMIT} byte limit. ` +
			"Resolve each page's section types first and project only those.",
	)
}
