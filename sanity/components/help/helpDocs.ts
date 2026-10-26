// TODO(END OF PROJECT): review, trim and complete these docs at the END of EVERY project, once the schema is final.
// Starter placeholder docs (e.g. the Sample Section, sections the site does not use) must be removed or replaced
// with the site's real editor instructions. Do not hand the Studio to editors with unreviewed starter docs.

/** Text fields support inline **bold** and `code`. */
export type HelpBlock =
	| { type: "h2"; text: string }
	| { type: "h3"; text: string }
	| { type: "p"; text: string }
	| { type: "note"; text: string }
	| { type: "ul"; items: string[] }
	| { type: "ol"; items: string[] }
	| { type: "table"; columns: string[]; rows: string[][] }

export type HelpDoc = {
	id: string
	title: string
	blocks: HelpBlock[]
}

/** A nested list in the Help & Docs sidebar. Mirrors the Studio sidebar's own grouping. */
export type HelpGroup = {
	/** Stable id for the sidebar list item. */
	id: string
	title: string
	items: HelpEntry[]
}

/** A doc, a nested group, or a divider between items. */
export type HelpEntry = HelpDoc | HelpGroup | "divider"

const pagesAndHubs: HelpDoc = {
	id: "pages-and-hubs",
	title: "Pages and Hubs",
	blocks: [
		{
			type: "p",
			text: "Every page on the site is a **Page** document, found under **Pages**. Its **Page Kind** decides how it relates to other pages, and pages are tied together by their **Page Slug** (the web address). There is nothing to link by hand.",
		},
		{ type: "h2", text: "The three kinds" },
		{
			type: "table",
			columns: ["Kind", "What it is", "Example slug"],
			rows: [
				["**Page**", "A normal standalone page.", "`about`"],
				["**Hub**", "A page that lists the pages nested under its slug, like a blog.", "`blog`"],
				["**Hub Detail Page**", "A page a hub lists, like one article.", "`blog/my-post`"],
			],
		},
		{
			type: "note",
			text: "The kind decides which sections the page is designed for. You can still add sections from other kinds if you need them, but the Studio will show a warning.",
		},
		{ type: "h2", text: "How a detail page finds its hub" },
		{
			type: "p",
			text: "A detail page belongs to the hub whose slug it starts with. `blog/my-post` belongs to the hub `blog`. No other setting is needed.",
		},
		{
			type: "ul",
			items: [
				"You can have as many hubs as you like, such as `blog`, `press` and `news`. Each one lists only its own pages.",
				"Hubs can be nested. If `press` and `press/stories` are both hubs, `press/stories/my-story` belongs to `press/stories`, the closest hub above it. The parent hub does not list it.",
			],
		},
		{ type: "h2", text: "Set one up" },
		{
			type: "ol",
			items: [
				"Go to **Pages**, then **Hubs**, and click **Create**.",
				"Set **Page Kind** to **Hub** and enter its **Page Slug**, such as `blog`.",
				"Add the section that shows the list. For a blog, add **Blog Hub**.",
				"Create each article the same way, with **Page Kind** set to **Hub Detail Page**.",
				"Start each article's slug with the hub's slug, such as `blog/my-post`, and add a **Blog Article** section.",
			],
		},
	],
}

const pageFields: HelpDoc = {
	id: "page-fields",
	title: "Page Settings and SEO",
	blocks: [
		{
			type: "p",
			text: "Every page has the same set of fields at the top, above its sections. They control the page's web address and how it appears in browser tabs, search results and social shares.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Page Kind**", "Page, Hub or Hub Detail Page. See **Pages and Hubs**. Required."],
				["**Page Title**", "The name of the page. Required."],
				[
					"**Page Slug**",
					"The page's web address. `about` makes a page at `/about`, and `about/us` makes `/about/us`. The slug `home` is the home page. Required.",
				],
				["**Meta Title**", "Optional. Replaces the page title in browser tabs and search results."],
				[
					"**Page Description**",
					"Used when the page is shared on social media and by some search engines. Leave it blank to use the default from **Settings**.",
				],
				[
					"**Open Graph Image**",
					"The picture shown on social cards and in search results. Leave it blank to use the default from **Settings**.",
				],
				[
					"**Hide from Search Engines**",
					"Turn on to ask search engines like Google to leave this page out. If a search engine has already found the page, turning this on will not remove it right away.",
				],
				[
					"**Sections**",
					"The content of the page, built from blocks added one after another. See **Page Sections**.",
				],
			],
		},
	],
}

const pageSections: HelpDoc = {
	id: "page-sections",
	title: "Page Sections",
	blocks: [
		{
			type: "p",
			text: "A page is built from **sections**, stacked from top to bottom in the order you add them. In a page's **Sections** field, click add and pick a section from the menu. Sections are grouped by the kind of page they were designed for, and the menu can show a list or a grid of previews. Drag a section to reorder it.",
		},
		{ type: "h2", text: "Header Mode (on every section)" },
		{
			type: "p",
			text: "Every section has a **Header Mode** of **Light** or **Dark**. It sets the header's color scheme while that section is scrolled behind it. Pick the one that stays readable over the section's background. The default is Light.",
		},
		{ type: "h2", text: "Sections available" },
		{
			type: "table",
			columns: ["Section", "Group", "What it is"],
			rows: [
				[
					"**Sample Section**",
					"Designed for SamplePage",
					"A starter placeholder. See **Sample Section**.",
				],
				[
					"**FAQ Section**",
					"Designed for Any Page",
					"Questions and answers in an accordion. See **FAQ Section**.",
				],
				["**Blog Hub**", "Designed for Blog", "The article list on a hub page. See **Blog Hub**."],
				["**Blog Article**", "Designed for Blog", "The body of an article. See **Blog Article**."],
			],
		},
		{ type: "h2", text: "Redirect" },
		{
			type: "p",
			text: "A **Redirect** can be added in place of a section. It has one field, a URL. If someone tries to open the page in any way, they are sent to that URL instead.",
		},
	],
}

const sampleSection: HelpDoc = {
	id: "sample-section",
	title: "Sample Section",
	blocks: [
		{
			type: "note",
			text: "This is a starter placeholder that shows each kind of field. It should be replaced by the site's real sections.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Section Title**", "A line of text."],
				["**Section Text**", "A second line of text."],
				["**Sample Video**", "A video. See **Images, Videos and Links**."],
				["**Sample Image**", "An image with alternative text. See **Images, Videos and Links**."],
				["**Sample Link**", "A link. See **Images, Videos and Links**."],
				["**Header Mode**", "Light or Dark header while this section is behind it."],
			],
		},
	],
}

const faqSection: HelpDoc = {
	id: "faq-section",
	title: "FAQ Section",
	blocks: [
		{
			type: "p",
			text: "Commonly asked questions and answers, shown as an accordion. It can be added to any page.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Kicker**", "Optional. A short label."],
				["**Title**", "The heading of the section. Required."],
				[
					"**FAQ Items**",
					"The questions, shown in the order listed. At least one is required. Each item has a **Question** (required) and an **Answer** (required).",
				],
				["**Header Mode**", "Light or Dark header while this section is behind it."],
			],
		},
		{
			type: "p",
			text: "An answer is rich text. It can have bold, italic, bulleted and numbered lists, and links. Links can go to web pages, email addresses (`mailto:`) and phone numbers (`tel:`).",
		},
	],
}

const blogHubSection: HelpDoc = {
	id: "blog-hub-section",
	title: "Blog Hub",
	blocks: [
		{
			type: "p",
			text: "Lists every article nested under this page's slug, with search. Add it to a page whose **Page Kind** is **Hub**. See **Pages and Hubs**.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				[
					"**Featured Article**",
					"Choose ONE article to feature at the top of the hub. Only Hub Detail Pages can be chosen.",
				],
				[
					"**Search Mode**",
					"**Client-side** (the default) loads all posts up front and searches titles and preview text only. It is fast. **Server-side** searches on each keystroke and also searches the full article text, but adds a short delay. Switch to server-side when you need full article search, or have so many posts that loading them all is too slow.",
				],
				["**Header Mode**", "Light or Dark header while this section is behind it."],
			],
		},
	],
}

const blogArticleSection: HelpDoc = {
	id: "blog-article-section",
	title: "Blog Article",
	blocks: [
		{
			type: "p",
			text: "Shows the article's main image and body. Add it to a page whose **Page Kind** is **Hub Detail Page**.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Body**", "The article text. See **Article Body** for what can go in it."],
				["**Header Mode**", "Light or Dark header while this section is behind it."],
			],
		},
		{
			type: "p",
			text: "The article's author, image, categories and preview text are set at the top of the page. See **Articles (Hub Detail Pages)**.",
		},
	],
}

const articles: HelpDoc = {
	id: "articles",
	title: "Articles (Hub Detail Pages)",
	blocks: [
		{
			type: "p",
			text: "When a page's **Page Kind** is **Hub Detail Page**, extra article fields appear under the standard page settings. They are hidden for other kinds.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Author**", "Pick from the list of Blog Authors."],
				[
					"**Main Image**",
					"Shown at the top of the article and on cards in the blog hub. Alternative text is required.",
				],
				["**Categories**", "Pick up to two Blog Categories."],
				["**Published At**", "The publish date and time."],
				[
					"**Article Text Preview**",
					"A short description of the article, used on the blog hub page and at the top of the article. Line breaks are kept.",
				],
				["**Read Time**", "Worked out for you. It cannot be edited."],
			],
		},
	],
}

const articleBody: HelpDoc = {
	id: "article-body",
	title: "Article Body",
	blocks: [
		{
			type: "p",
			text: "The **Body** of a Blog Article is rich text. These are the things you can add.",
		},
		{ type: "h2", text: "Text" },
		{
			type: "ul",
			items: [
				"**Styles:** Normal, H1, H2 and Quote.",
				"**Lists:** bulleted lists.",
				"**Formatting:** Strong (bold) and Emphasis (italic).",
				"**Links:** a URL link that must start with `http://`, `https://` or `mailto:`.",
			],
		},
		{ type: "h2", text: "Extra blocks" },
		{
			type: "table",
			columns: ["Block", "What it does"],
			rows: [
				["**Image**", "A picture with alternative text. See **Images, Videos and Links**."],
				["**Video**", "A video. See **Images, Videos and Links**."],
				[
					"**Blockquote**",
					"A quote with three fields: **Quote**, **Author Name** and **Author Title**.",
				],
			],
		},
	],
}

const authors: HelpDoc = {
	id: "blog-authors",
	title: "Blog Authors",
	blocks: [
		{
			type: "p",
			text: "People who can be chosen as the **Author** of an article. Find them under **Shared Content**, then **Blog**, then **Authors**.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Name**", "The author's name and job title, for example `Jane, CEO`."],
				["**Company**", "The author's company."],
				["**Slug**", "A web-friendly version of the name. It can be generated from the name."],
				["**Image**", "The author's photo. No alternative text is needed."],
				[
					"**Bio**",
					"A short biography. Supports bold, italic, code, underline, strikethrough and links.",
				],
			],
		},
	],
}

const categories: HelpDoc = {
	id: "blog-categories",
	title: "Blog Categories",
	blocks: [
		{
			type: "p",
			text: "Topics that can be added to an article. An article can have up to two. Find them under **Shared Content**, then **Blog**, then **Categories**.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Title**", "The name of the category."],
				["**Slug**", "A web-friendly version of the title. It can be generated from the title."],
				["**Description**", "A short description of the category."],
			],
		},
	],
}

const logoSets: HelpDoc = {
	id: "logo-sets",
	title: "Logo Sets",
	blocks: [
		{
			type: "p",
			text: "A named group of logos that sections can use, so the same set can be shown in more than one place without copying it. Find them under **Shared Content**, then **Logo Sets**. A set only shows on the site once a section is set up to use it.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Title**", "An internal name for the set, such as `Partner Logos`. Required."],
				[
					"**Logos link out**",
					"Turn on for sets whose logos should be clickable, like press mentions. Sections that do not show logo links ignore it.",
				],
				[
					"**Logos**",
					"The logos in the set. At least one is required. Each logo has an image and alternative text, and, when **Logos link out** is on, an optional **Link**.",
				],
			],
		},
	],
}

const header: HelpDoc = {
	id: "header",
	title: "Header",
	blocks: [
		{
			type: "p",
			text: "The header shown at the top of the site. There is only one, and it is edited directly from the **Header** item in the main list.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [["**Text**", "The text shown in the header. Required."]],
		},
		{
			type: "p",
			text: "Its color scheme changes with each section's **Header Mode**. See **Page Sections**.",
		},
	],
}

const footer: HelpDoc = {
	id: "footer",
	title: "Footer",
	blocks: [
		{
			type: "p",
			text: "The footer shown at the bottom of the site. There is only one, and it is edited directly from the **Footer** item in the main list.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				["**Text**", "The text shown in the footer. Required."],
				["**Links**", "A list of links shown in the footer. See **Images, Videos and Links**."],
			],
		},
	],
}

const settings: HelpDoc = {
	id: "settings",
	title: "Settings",
	blocks: [
		{
			type: "p",
			text: "Site-wide defaults. There is only one, and it is edited directly from the **Settings** item in the main list. Pages use these when they do not set their own.",
		},
		{
			type: "table",
			columns: ["Field", "What it does"],
			rows: [
				[
					"**Title Suffix**",
					"Added after page-specific titles in browser tabs and search results.",
				],
				[
					"**Title Separator**",
					"Placed between the page title and the title suffix. Choose `|`, `-` or `:`.",
				],
				[
					"**Default Page Description**",
					"Used when a page is shared on social media and by some search engines, unless the page has its own.",
				],
				[
					"**Default Open Graph Image**",
					"The picture shown on social cards and in search results, unless the page has its own.",
				],
				[
					"**Tag Manager**",
					"Tracking or marketing snippets, for example Google Tag Manager. Each entry has a **Label** and an **Embed**. Paste the entire tag, including the `<script>` part. This should only be changed by someone who knows what the tag does.",
				],
			],
		},
	],
}

const media: HelpDoc = {
	id: "images-videos-links",
	title: "Images, Videos and Links",
	blocks: [
		{ type: "p", text: "These field types are used in many places across the Studio." },
		{ type: "h2", text: "Images" },
		{
			type: "ul",
			items: [
				"**Alternative text** describes the image for people using screen readers and for search engines. It is required on most images and hidden on a few, such as the Open Graph Image and author photos.",
				"Images have a **hotspot**, so you can mark the important part of the picture and keep it in view when the image is cropped.",
				"Images can be uploaded, picked from the media library, or taken from Unsplash.",
			],
		},
		{ type: "h2", text: "Videos" },
		{
			type: "p",
			text: "Choose a **Source**: **Upload or Select a File** (the default), YouTube, Vimeo, Wistia, Spotify, Twitch, TikTok or **Video URL**.",
		},
		{
			type: "ul",
			items: [
				"For an uploaded file, use **Mux Video** to upload or pick a video. You can also set a **Poster Image**, which is shown in place of the video's default thumbnail.",
				"For any other source, paste the address into **Video URL**. For YouTube, Vimeo, Wistia, Spotify, Twitch and TikTok the Studio checks that the address looks right. A plain **Video URL** is not checked.",
			],
		},
		{ type: "h2", text: "Links" },
		{
			type: "p",
			text: "A link field lets you choose where it goes. The available types are internal page, external URL, email, phone, SMS, document (a file) and static page (a fixed route in the app).",
		},
		{
			type: "ul",
			items: [
				"External links must start with `http://` or `https://`.",
				"Some link fields also have a **Text** box for the visible label, and an **Open in new window** checkbox. Tick it if the link should open in a new tab; otherwise it opens in the same tab.",
			],
		},
	],
}

export const helpDocs: HelpDoc[] = [
	pagesAndHubs,
	pageFields,
	pageSections,
	sampleSection,
	faqSection,
	blogHubSection,
	blogArticleSection,
	articles,
	articleBody,
	authors,
	categories,
	logoSets,
	header,
	footer,
	settings,
	media,
]

/** Mirrors the Studio sidebar order: site-wide singletons, Pages, Shared Content, then fields shared by several sections. */
export const helpTree: HelpEntry[] = [
	settings,
	header,
	footer,
	"divider",
	{
		id: "group-pages",
		title: "Pages",
		items: [
			pagesAndHubs,
			pageFields,
			{
				id: "group-page-sections",
				title: "Page Sections",
				items: [
					pageSections,
					"divider",
					sampleSection,
					faqSection,
					blogHubSection,
					blogArticleSection,
				],
			},
			{
				id: "group-hubs",
				title: "Hubs",
				items: [articles, articleBody],
			},
		],
	},
	{
		id: "group-shared-content",
		title: "Shared Content",
		items: [
			logoSets,
			"divider",
			{
				id: "group-blog",
				title: "Blog",
				items: [authors, categories],
			},
		],
	},
	"divider",
	{
		id: "group-shared-fields",
		title: "Shared Fields",
		items: [media],
	},
]
