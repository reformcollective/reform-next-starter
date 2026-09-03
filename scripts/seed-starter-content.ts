/**
 * Seeds the shared starter dataset with sample content: two blog hubs and articles
 * nested under each, alongside the existing pages.
 *
 * Idempotent — every document has a fixed `_id`, so re-running replaces rather than
 * duplicates. Only touches documents whose id starts with `starter-`.
 *
 * Requires an editor-scoped token in SANITY_SEED_TOKEN.
 *
 *   node --env-file=.env --experimental-strip-types scripts/seed-starter-content.ts --dry-run
 *   node --env-file=.env --experimental-strip-types scripts/seed-starter-content.ts
 */

import { createClient, type IdentifiedSanityDocumentStub, type Transaction } from "@sanity/client"

const AUTHOR = "blog-author-reform-team"
const CATEGORY_DEV = "blog-category-dev"
const CATEGORY_DESIGN = "blog-category-design"
const PHOTO = "image-61add4858baf2a430ce3ea35698733fc9e87ff0e-3376x2252-jpg"
const OG_IMAGE = "image-c600758cd80047a8d38ab6f62763fa49dd0f0e32-1200x630-jpg"

const dryRun = process.argv.includes("--dry-run")

const token = process.env.SANITY_SEED_TOKEN
if (!token && !dryRun) {
	console.error("SANITY_SEED_TOKEN is required to write. Add it to .env, or pass --dry-run.")
	process.exit(1)
}

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
	apiVersion: "2025-12-11",
	useCdn: false,
	token,
})

const image = (asset: string, alt: string) => ({
	_type: "image",
	alt,
	willHaveAlt: "true",
	asset: { _type: "reference", _ref: asset },
})

const reference = (ref: string) => ({ _type: "reference", _ref: ref })

const text = (key: string, body: string, style = "normal") => ({
	_type: "block",
	_key: key,
	style,
	markDefs: [],
	children: [{ _type: "span", _key: `${key}s`, text: body, marks: [] }],
})

/** every block style, mark, and inline object the blog renderer supports */
const richBody = [
	text("rb0", "A Complete Article", "h1"),
	text("rb1", "With every block type", "h2"),
	text("rb2", "An inline pull quote", "blockquote"),
	{
		_type: "block",
		_key: "rb3",
		style: "normal",
		markDefs: [{ _type: "link", _key: "rb3l", href: "https://reformcollective.com" }],
		children: [
			{ _type: "span", _key: "rb3a", text: "Normal text with ", marks: [] },
			{ _type: "span", _key: "rb3b", text: "bold", marks: ["strong"] },
			{ _type: "span", _key: "rb3c", text: ", ", marks: [] },
			{ _type: "span", _key: "rb3d", text: "italic", marks: ["em"] },
			{ _type: "span", _key: "rb3e", text: ", both", marks: ["strong", "em"] },
			{ _type: "span", _key: "rb3f", text: ", and ", marks: [] },
			{ _type: "span", _key: "rb3g", text: "a link", marks: ["rb3l"] },
			{ _type: "span", _key: "rb3h", text: ".", marks: [] },
		],
	},
	{
		_type: "block",
		_key: "rb4",
		style: "normal",
		listItem: "bullet",
		level: 1,
		markDefs: [],
		children: [{ _type: "span", _key: "rb4s", text: "A bulleted list item", marks: [] }],
	},
	{ ...image(OG_IMAGE, "An inline image"), _key: "rb5" },
	{
		_type: "video",
		_key: "rb6",
		sourceType: "youtube",
		url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	},
	{
		_type: "blockquoteWithAttribution",
		_key: "rb7",
		description: "An attributed quote, rendered as its own block.",
		authorName: "Rick R",
		authorTitle: "Auteur",
	},
	text("rb8", "And a closing paragraph after the rich content."),
]

const hub = ({
	id,
	title,
	slug,
	description,
	searchMode,
	featuredPost,
}: {
	id: string
	title: string
	slug: string
	description: string
	searchMode: "client" | "server"
	featuredPost?: string
}) => ({
	_id: id,
	_type: "page" as const,
	kind: "hub" as const,
	title,
	slug: { _type: "slug", current: slug },
	description,
	ogImage: image(OG_IMAGE, ""),
	sections: [
		{
			_type: "blogHub",
			_key: `${id}-hub`,
			headerMode: "dark",
			searchMode,
			...(featuredPost ? { featuredPost: reference(featuredPost) } : {}),
		},
	],
})

const article = ({
	id,
	title,
	slug,
	preview,
	publishedAt,
	categories,
	mainImage,
	body,
}: {
	id: string
	title: string
	slug: string
	preview: string
	publishedAt: string
	categories: string[]
	mainImage?: string
	body: unknown[]
}) => ({
	_id: id,
	_type: "page" as const,
	kind: "hubDetail" as const,
	title,
	slug: { _type: "slug", current: slug },
	author: reference(AUTHOR),
	articleTextPreview: preview,
	publishedAt,
	...(categories.length > 0
		? { categories: categories.map((c, i) => ({ ...reference(c), _key: `${id}-c${i}` })) }
		: {}),
	...(mainImage ? { mainImage: image(mainImage, title) } : {}),
	sections: [{ _type: "blogArticle", _key: `${id}-body`, headerMode: "dark", body }],
})

const supportingDocuments: IdentifiedSanityDocumentStub<{ _type: string }>[] = [
	{
		_id: AUTHOR,
		_type: "blogAuthor",
		name: "Reform Collective Team",
		company: "Reform Collective",
		slug: { _type: "slug", current: "reform-team" },
		image: image(OG_IMAGE, ""),
	},
	{
		_id: CATEGORY_DESIGN,
		_type: "blogCategory",
		title: "Design",
		slug: { _type: "slug", current: "design" },
		description: "Design Related",
	},
	{
		_id: CATEGORY_DEV,
		_type: "blogCategory",
		title: "Dev",
		slug: { _type: "slug", current: "dev" },
		description: "Dev Related",
	},
]

const documents: IdentifiedSanityDocumentStub<{
	kind: string
	slug: { current: string }
	sections: { _type: string }[]
}>[] = [
	// --- Blog: three articles, one with the full rich body ---
	article({
		id: "starter-blog-complete",
		title: "A Complete Article",
		slug: "blog/a-complete-article",
		preview:
			"Every block type the blog renderer supports, in one article.\nUse this one to check rich text, images, video, and quotes.",
		publishedAt: "2026-08-01T09:00:00.000Z",
		categories: [CATEGORY_DESIGN, CATEGORY_DEV],
		mainImage: PHOTO,
		body: richBody,
	}),
	article({
		id: "starter-blog-design-systems",
		title: "Notes on Design Systems",
		slug: "blog/notes-on-design-systems",
		preview: "A short article with a main image and a single category.",
		publishedAt: "2026-07-15T09:00:00.000Z",
		categories: [CATEGORY_DESIGN],
		mainImage: PHOTO,
		body: [text("ds0", "A short article used to fill out the hub listing.")],
	}),
	article({
		id: "starter-blog-no-image",
		title: "An Article With No Image",
		slug: "blog/an-article-with-no-image",
		preview: "This article has no main image, so cards and the article header fall back.",
		publishedAt: "2026-07-01T09:00:00.000Z",
		categories: [CATEGORY_DEV],
		body: [text("ni0", "No main image is set on this article, on purpose.")],
	}),

	// --- Press: two articles, a second hub at the same URL level ---
	article({
		id: "starter-press-launch",
		title: "Launch Announcement",
		slug: "press/launch-announcement",
		preview: "A press release under a second hub, to prove hubs are independent.",
		publishedAt: "2026-08-20T09:00:00.000Z",
		categories: [],
		mainImage: PHOTO,
		body: [text("pl0", "An article under /press rather than /blog.")],
	}),
	article({
		id: "starter-press-in-the-news",
		title: "In The News",
		slug: "press/in-the-news",
		preview: "A second press article, with no image and no categories.",
		publishedAt: "2026-08-05T09:00:00.000Z",
		categories: [],
		body: [text("pn0", "Another article under /press.")],
	}),

	// --- Hubs last, so their featured references already exist ---
	hub({
		id: "starter-hub-blog",
		title: "Blog",
		slug: "blog",
		description: "The starter's sample blog hub.",
		searchMode: "client",
		featuredPost: "starter-blog-complete",
	}),
	hub({
		id: "starter-hub-press",
		title: "Press",
		slug: "press",
		description: "A second hub, with no featured post set.",
		searchMode: "server",
	}),
]

const internalLink = (key: string, text: string, id: string) => ({
	_type: "link",
	_key: key,
	type: "internal",
	text,
	internalLink: reference(id),
})

/**
 * Patched onto the existing footer rather than replaced, so the singleton's own fields
 * survive a re-seed.
 */
const footerLinks = [
	internalLink("fl-blog", "Blog", "starter-hub-blog"),
	internalLink("fl-blog-1", "— A Complete Article", "starter-blog-complete"),
	internalLink("fl-blog-2", "— Notes on Design Systems", "starter-blog-design-systems"),
	internalLink("fl-blog-3", "— An Article With No Image", "starter-blog-no-image"),
	internalLink("fl-press", "Press", "starter-hub-press"),
	internalLink("fl-press-1", "— Launch Announcement", "starter-press-launch"),
	internalLink("fl-press-2", "— In The News", "starter-press-in-the-news"),
]

async function main() {
	console.log(
		`${dryRun ? "DRY RUN — nothing will be written" : "WRITING"} to dataset "${process.env.NEXT_PUBLIC_SANITY_DATASET}"\n`,
	)

	for (const document of documents) {
		const sectionTypes = document.sections.map((section) => section._type).join(", ")
		console.log(
			`${document.kind === "hub" ? "HUB    " : "DETAIL "}  /${document.slug.current}`,
			`\n         id: ${document._id}`,
			`\n         sections: ${sectionTypes}`,
		)
	}

	for (const document of supportingDocuments) {
		console.log(`${document._type.padEnd(14)} ${document._id}`)
	}

	console.log(
		`\nFOOTER   ${footerLinks.length} links: ${footerLinks.map((l) => l.text).join(", ")}`,
	)

	const total = documents.length + supportingDocuments.length
	if (dryRun) {
		console.log(`\n${total} documents would be created or replaced, and the footer patched.`)
		return
	}

	const transaction: Transaction = client.transaction()
	// author and categories first, so the pages referencing them resolve
	for (const document of supportingDocuments) transaction.createOrReplace(document)
	for (const document of documents) transaction.createOrReplace(document)
	transaction.patch("footer", (patch) => patch.set({ links: footerLinks }))
	await transaction.commit()
	console.log(`\n${total} documents written, footer patched.`)
}

main().catch((error: unknown) => {
	console.error(error)
	process.exit(1)
})
