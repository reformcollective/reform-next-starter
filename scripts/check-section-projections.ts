/**
 * Fails if a page section declares a field that needs resolving — an image, video, or
 * link — without a matching entry in its GROQ projection. Those fields come back as
 * unresolved references and render as nothing, with no error, so this catches the one
 * mistake the section/projection split makes easy to miss.
 *
 * Projections are written by hand on purpose: Sanity's typegen reads queries statically
 * from source, so one composed at runtime drops out of type generation entirely.
 *
 *   node --experimental-strip-types scripts/check-section-projections.ts
 */

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const SECTIONS_DIR = "sanity/schemas/sections"
const PROJECTIONS_DIR = join(SECTIONS_DIR, "projections")

/** field helpers and raw types whose values need a reform:: projection to resolve */
const MEDIA_FIELD_PATTERNS = [
	/universalImages?\(\s*\{[^}]*?name:\s*["'](\w+)["']/gs,
	/universalLinks?\(\s*\{[^}]*?name:\s*["'](\w+)["']/gs,
	/universalVideos?\(\s*\{[^}]*?name:\s*["'](\w+)["']/gs,
	/name:\s*["'](\w+)["'],\s*(?:title:\s*["'][^"']*["'],\s*)?type:\s*["'](?:image|video|file)["']/gs,
	/type:\s*["'](?:image|video|file)["'],\s*name:\s*["'](\w+)["']/gs,
]

const sectionFiles = readdirSync(SECTIONS_DIR).filter(
	(file) => file.endsWith(".ts") && file !== "index.ts",
)

const problems: string[] = []

for (const file of sectionFiles) {
	const source = readFileSync(join(SECTIONS_DIR, file), "utf8")

	const mediaFields = new Set<string>()
	for (const pattern of MEDIA_FIELD_PATTERNS) {
		for (const match of source.matchAll(pattern)) {
			if (match[1]) mediaFields.add(match[1])
		}
	}

	if (mediaFields.size === 0) continue

	let projection = ""
	try {
		projection = readFileSync(join(PROJECTIONS_DIR, file), "utf8")
	} catch {
		problems.push(
			`${SECTIONS_DIR}/${file} declares ${[...mediaFields].join(", ")} but has no projection at ${PROJECTIONS_DIR}/${file}`,
		)
		continue
	}

	const missing = [...mediaFields].filter((field) => !projection.includes(field))
	if (missing.length > 0) {
		problems.push(
			`${PROJECTIONS_DIR}/${file} is missing: ${missing.join(", ")} (declared in ${SECTIONS_DIR}/${file})`,
		)
	}
}

if (problems.length > 0) {
	console.error("Section fields that need resolving are missing from their projection:\n")
	for (const problem of problems) console.error(`  ${problem}`)
	console.error(
		"\nAdd a reform::image / reform::video / reform::link entry for each, or the field returns an unresolved reference.",
	)
	process.exit(1)
}

console.log(`Checked ${sectionFiles.length} sections — every media field has a projection.`)
