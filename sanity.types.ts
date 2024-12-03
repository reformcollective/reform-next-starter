/**
 * ---------------------------------------------------------------------------------
 * This file has been generated by Sanity TypeGen.
 * Command: `sanity typegen generate`
 *
 * Any modifications made directly to this file will be overwritten the next time
 * the TypeScript definitions are generated. Please make changes to the Sanity
 * schema definitions and/or GROQ queries if you need to update these types.
 *
 * For more information on how to use Sanity TypeGen, visit the official documentation:
 * https://www.sanity.io/docs/sanity-typegen
 * ---------------------------------------------------------------------------------
 */

// Source: schema.json
export type SanityImagePaletteSwatch = {
	_type: "sanity.imagePaletteSwatch"
	background?: string
	foreground?: string
	population?: number
	title?: string
}

export type SanityImagePalette = {
	_type: "sanity.imagePalette"
	darkMuted?: SanityImagePaletteSwatch
	lightVibrant?: SanityImagePaletteSwatch
	darkVibrant?: SanityImagePaletteSwatch
	vibrant?: SanityImagePaletteSwatch
	dominant?: SanityImagePaletteSwatch
	lightMuted?: SanityImagePaletteSwatch
	muted?: SanityImagePaletteSwatch
}

export type SanityImageDimensions = {
	_type: "sanity.imageDimensions"
	height?: number
	width?: number
	aspectRatio?: number
}

export type Geopoint = {
	_type: "geopoint"
	lat?: number
	lng?: number
	alt?: number
}

export type Break = {
	_id: string
	_type: "break"
	_createdAt: string
	_updatedAt: string
	_rev: string
	style?: "lineBreak"
}

export type Youtube = {
	_type: "youtube"
	url?: string
}

export type Card = {
	_id: string
	_type: "card"
	_createdAt: string
	_updatedAt: string
	_rev: string
	quotation?: string
	attribution?: string
	contentfulArchived?: boolean
}

export type Post = {
	_id: string
	_type: "post"
	_createdAt: string
	_updatedAt: string
	_rev: string
	title?: string
	slug?: Slug
	mainImage?: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		_type: "image"
	}
	author?: {
		_ref: string
		_type: "reference"
		_weak?: boolean
		[internalGroqTypeReferenceTo]?: "author"
	}
	categories?: Array<string>
	metadataDescription?: string
	articleText?: Array<
		| {
				children?: Array<{
					marks?: Array<string>
					text?: string
					_type: "span"
					_key: string
				}>
				style?:
					| "h1"
					| "h2"
					| "h3"
					| "h4"
					| "h5"
					| "h6"
					| "normal"
					| "blockquote"
				listItem?: "bullet" | "number"
				markDefs?: Array<{
					href?: string
					target?: "_blank" | "_parent"
					_type: "link"
					_key: string
				}>
				level?: number
				_type: "block"
				_key: string
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
				}
				hotspot?: SanityImageHotspot
				crop?: SanityImageCrop
				_type: "image"
				_key: string
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.fileAsset"
				}
				_type: "file"
				_key: string
		  }
		| {
				style?: "lineBreak"
				_type: "break"
				_key: string
		  }
		| ({
				_key: string
		  } & Youtube)
	>
	featuredArticle?: boolean
	publishDate?: string
	contentfulArchived?: boolean
}

export type SanityFileAsset = {
	_id: string
	_type: "sanity.fileAsset"
	_createdAt: string
	_updatedAt: string
	_rev: string
	originalFilename?: string
	label?: string
	title?: string
	description?: string
	altText?: string
	sha1hash?: string
	extension?: string
	mimeType?: string
	size?: number
	assetId?: string
	uploadId?: string
	path?: string
	url?: string
	source?: SanityAssetSourceData
}

export type Author = {
	_id: string
	_type: "author"
	_createdAt: string
	_updatedAt: string
	_rev: string
	fullName?: string
	slug?: Slug
	photo?: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		_type: "image"
	}
	roleAndCompany?: string
	biography?: string
	contentfulArchived?: boolean
}

export type Slug = {
	_type: "slug"
	current?: string
	source?: string
}

export type Settings = {
	_id: string
	_type: "settings"
	_createdAt: string
	_updatedAt: string
	_rev: string
	ogImage?: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		alt?: string
		metadataBase?: string
		_type: "image"
	}
}

export type SanityImageCrop = {
	_type: "sanity.imageCrop"
	top?: number
	bottom?: number
	left?: number
	right?: number
}

export type SanityImageHotspot = {
	_type: "sanity.imageHotspot"
	x?: number
	y?: number
	height?: number
	width?: number
}

export type SanityImageAsset = {
	_id: string
	_type: "sanity.imageAsset"
	_createdAt: string
	_updatedAt: string
	_rev: string
	originalFilename?: string
	label?: string
	title?: string
	description?: string
	altText?: string
	sha1hash?: string
	extension?: string
	mimeType?: string
	size?: number
	assetId?: string
	uploadId?: string
	path?: string
	url?: string
	metadata?: SanityImageMetadata
	source?: SanityAssetSourceData
}

export type SanityAssetSourceData = {
	_type: "sanity.assetSourceData"
	name?: string
	id?: string
	url?: string
}

export type SanityImageMetadata = {
	_type: "sanity.imageMetadata"
	location?: Geopoint
	dimensions?: SanityImageDimensions
	palette?: SanityImagePalette
	lqip?: string
	blurHash?: string
	hasAlpha?: boolean
	isOpaque?: boolean
}

export type SanityAssistInstructionTask = {
	_type: "sanity.assist.instructionTask"
	path?: string
	instructionKey?: string
	started?: string
	updated?: string
	info?: string
}

export type SanityAssistTaskStatus = {
	_type: "sanity.assist.task.status"
	tasks?: Array<
		{
			_key: string
		} & SanityAssistInstructionTask
	>
}

export type SanityAssistSchemaTypeAnnotations = {
	_type: "sanity.assist.schemaType.annotations"
	title?: string
	fields?: Array<
		{
			_key: string
		} & SanityAssistSchemaTypeField
	>
}

export type SanityAssistOutputType = {
	_type: "sanity.assist.output.type"
	type?: string
}

export type SanityAssistOutputField = {
	_type: "sanity.assist.output.field"
	path?: string
}

export type SanityAssistInstructionContext = {
	_type: "sanity.assist.instruction.context"
	reference?: {
		_ref: string
		_type: "reference"
		_weak?: boolean
		[internalGroqTypeReferenceTo]?: "assist.instruction.context"
	}
}

export type AssistInstructionContext = {
	_id: string
	_type: "assist.instruction.context"
	_createdAt: string
	_updatedAt: string
	_rev: string
	title?: string
	context?: Array<{
		children?: Array<{
			marks?: Array<string>
			text?: string
			_type: "span"
			_key: string
		}>
		style?: "normal"
		listItem?: never
		markDefs?: null
		level?: number
		_type: "block"
		_key: string
	}>
}

export type SanityAssistInstructionUserInput = {
	_type: "sanity.assist.instruction.userInput"
	message?: string
	description?: string
}

export type SanityAssistInstructionPrompt = Array<{
	children?: Array<
		| {
				marks?: Array<string>
				text?: string
				_type: "span"
				_key: string
		  }
		| ({
				_key: string
		  } & SanityAssistInstructionFieldRef)
		| ({
				_key: string
		  } & SanityAssistInstructionContext)
		| ({
				_key: string
		  } & SanityAssistInstructionUserInput)
	>
	style?: "normal"
	listItem?: never
	markDefs?: null
	level?: number
	_type: "block"
	_key: string
}>

export type SanityAssistInstructionFieldRef = {
	_type: "sanity.assist.instruction.fieldRef"
	path?: string
}

export type SanityAssistInstruction = {
	_type: "sanity.assist.instruction"
	prompt?: SanityAssistInstructionPrompt
	icon?: string
	title?: string
	userId?: string
	createdById?: string
	output?: Array<
		| ({
				_key: string
		  } & SanityAssistOutputField)
		| ({
				_key: string
		  } & SanityAssistOutputType)
	>
}

export type SanityAssistSchemaTypeField = {
	_type: "sanity.assist.schemaType.field"
	path?: string
	instructions?: Array<
		{
			_key: string
		} & SanityAssistInstruction
	>
}

export type AllSanitySchemaTypes =
	| SanityImagePaletteSwatch
	| SanityImagePalette
	| SanityImageDimensions
	| Geopoint
	| Break
	| Youtube
	| Card
	| Post
	| SanityFileAsset
	| Author
	| Slug
	| Settings
	| SanityImageCrop
	| SanityImageHotspot
	| SanityImageAsset
	| SanityAssetSourceData
	| SanityImageMetadata
	| SanityAssistInstructionTask
	| SanityAssistTaskStatus
	| SanityAssistSchemaTypeAnnotations
	| SanityAssistOutputType
	| SanityAssistOutputField
	| SanityAssistInstructionContext
	| AssistInstructionContext
	| SanityAssistInstructionUserInput
	| SanityAssistInstructionPrompt
	| SanityAssistInstructionFieldRef
	| SanityAssistInstruction
	| SanityAssistSchemaTypeField
export declare const internalGroqTypeReferenceTo: unique symbol
// Source: ./sanity/lib/queries.ts
// Variable: settingsQuery
// Query: *[_type == "settings"][0]
export type SettingsQueryResult = {
	_id: string
	_type: "settings"
	_createdAt: string
	_updatedAt: string
	_rev: string
	ogImage?: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		alt?: string
		metadataBase?: string
		_type: "image"
	}
} | null
// Variable: heroQuery
// Query: *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) [0] {    content,      _id,  title,  slug,  mainImage,  author->{   _id,		fullName,    slug  },  categories,  metadataDescription,  articleText[]{    ...,    _type == "reference" => @->{      _id,      _type,      title    }  },  featuredArticle,  publishDate,  contentfulArchived  }
export type HeroQueryResult = {
	content: null
	_id: string
	title: string | null
	slug: Slug | null
	mainImage: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		_type: "image"
	} | null
	author: {
		_id: string
		fullName: string | null
		slug: Slug | null
	} | null
	categories: Array<string> | null
	metadataDescription: string | null
	articleText: Array<
		| {
				children?: Array<{
					marks?: Array<string>
					text?: string
					_type: "span"
					_key: string
				}>
				style?:
					| "blockquote"
					| "h1"
					| "h2"
					| "h3"
					| "h4"
					| "h5"
					| "h6"
					| "normal"
				listItem?: "bullet" | "number"
				markDefs?: Array<{
					href?: string
					target?: "_blank" | "_parent"
					_type: "link"
					_key: string
				}>
				level?: number
				_type: "block"
				_key: string
		  }
		| {
				style?: "lineBreak"
				_type: "break"
				_key: string
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.fileAsset"
				}
				_type: "file"
				_key: string
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
				}
				hotspot?: SanityImageHotspot
				crop?: SanityImageCrop
				_type: "image"
				_key: string
		  }
		| {
				_key: string
				_type: "youtube"
				url?: string
		  }
	> | null
	featuredArticle: boolean | null
	publishDate: string | null
	contentfulArchived: boolean | null
} | null
// Variable: moreStoriesQuery
// Query: *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {      _id,  title,  slug,  mainImage,    }
export type MoreStoriesQueryResult = Array<{
	_id: string
	title: string | null
	slug: Slug | null
	mainImage: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		_type: "image"
	} | null
}>
// Variable: postQuery
// Query: *[_type == "post" && slug.current == $slug] [0] {    content,      _id,  title,  slug,  mainImage,  author->{   _id,		fullName,    slug  },  categories,  metadataDescription,  articleText[]{    ...,    _type == "reference" => @->{      _id,      _type,      title    }  },  featuredArticle,  publishDate,  contentfulArchived  }
export type PostQueryResult = {
	content: null
	_id: string
	title: string | null
	slug: Slug | null
	mainImage: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		_type: "image"
	} | null
	author: {
		_id: string
		fullName: string | null
		slug: Slug | null
	} | null
	categories: Array<string> | null
	metadataDescription: string | null
	articleText: Array<
		| {
				children?: Array<{
					marks?: Array<string>
					text?: string
					_type: "span"
					_key: string
				}>
				style?:
					| "blockquote"
					| "h1"
					| "h2"
					| "h3"
					| "h4"
					| "h5"
					| "h6"
					| "normal"
				listItem?: "bullet" | "number"
				markDefs?: Array<{
					href?: string
					target?: "_blank" | "_parent"
					_type: "link"
					_key: string
				}>
				level?: number
				_type: "block"
				_key: string
		  }
		| {
				style?: "lineBreak"
				_type: "break"
				_key: string
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.fileAsset"
				}
				_type: "file"
				_key: string
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
				}
				hotspot?: SanityImageHotspot
				crop?: SanityImageCrop
				_type: "image"
				_key: string
		  }
		| {
				_key: string
				_type: "youtube"
				url?: string
		  }
	> | null
	featuredArticle: boolean | null
	publishDate: string | null
	contentfulArchived: boolean | null
} | null
// Variable: authorQuery
// Query: *[_type == "author" && slug.current == $slug] [0] {    fullName,    roleAndCompany,    photo,    slug  }
export type AuthorQueryResult = {
	fullName: string | null
	roleAndCompany: string | null
	photo: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		_type: "image"
	} | null
	slug: Slug | null
} | null
// Variable: postsQuery
// Query: *[_type == "post"]{	_id,	title,	slug,	mainImage,	author->{		_id,		fullName,    slug	},	categories,	metadataDescription,	articleText[]{		...,		markDefs[]{			...,			_type == "link" => {				"href": @.href,				"target": @.target			}		},		_type == "reference" => @->{			_type,			_id,			title		}	},	featuredArticle,	publishDate,	contentfulArchived}
export type PostsQueryResult = Array<{
	_id: string
	title: string | null
	slug: Slug | null
	mainImage: {
		asset?: {
			_ref: string
			_type: "reference"
			_weak?: boolean
			[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
		}
		hotspot?: SanityImageHotspot
		crop?: SanityImageCrop
		_type: "image"
	} | null
	author: {
		_id: string
		fullName: string | null
		slug: Slug | null
	} | null
	categories: Array<string> | null
	metadataDescription: string | null
	articleText: Array<
		| {
				children?: Array<{
					marks?: Array<string>
					text?: string
					_type: "span"
					_key: string
				}>
				style?:
					| "blockquote"
					| "h1"
					| "h2"
					| "h3"
					| "h4"
					| "h5"
					| "h6"
					| "normal"
				listItem?: "bullet" | "number"
				markDefs: Array<{
					href: string | null
					target: "_blank" | "_parent" | null
					_type: "link"
					_key: string
				}> | null
				level?: number
				_type: "block"
				_key: string
		  }
		| {
				style?: "lineBreak"
				_type: "break"
				_key: string
				markDefs: null
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.fileAsset"
				}
				_type: "file"
				_key: string
				markDefs: null
		  }
		| {
				asset?: {
					_ref: string
					_type: "reference"
					_weak?: boolean
					[internalGroqTypeReferenceTo]?: "sanity.imageAsset"
				}
				hotspot?: SanityImageHotspot
				crop?: SanityImageCrop
				_type: "image"
				_key: string
				markDefs: null
		  }
		| {
				_key: string
				_type: "youtube"
				url?: string
				markDefs: null
		  }
	> | null
	featuredArticle: boolean | null
	publishDate: string | null
	contentfulArchived: boolean | null
}>
// Variable: categoryQuery
// Query: *[_type == "post"] {		"categories": categories[]->title	}
export type CategoryQueryResult = Array<{
	categories: Array<null> | null
}>

// Source: ./app/blog/[slug]/page.tsx
// Variable: postSlugs
// Query: *[_type == "post" && defined(slug.current)]{"slug": slug.current}
export type PostSlugsResult = Array<{
	slug: string | null
}>

// Query TypeMap
import "@sanity/client"
declare module "@sanity/client" {
	interface SanityQueries {
		'*[_type == "settings"][0]': SettingsQueryResult
		'\n  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) [0] {\n    content,\n    \n  _id,\n  title,\n  slug,\n  mainImage,\n  author->{\n   _id,\n\t\tfullName,\n    slug\n  },\n  categories,\n  metadataDescription,\n  articleText[]{\n    ...,\n    _type == "reference" => @->{\n      _id,\n      _type,\n      title\n    }\n  },\n  featuredArticle,\n  publishDate,\n  contentfulArchived\n\n  }\n': HeroQueryResult
		'\n  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {\n    \n  _id,\n  title,\n  slug,\n  mainImage,\n  \n  }\n': MoreStoriesQueryResult
		'\n  *[_type == "post" && slug.current == $slug] [0] {\n    content,\n    \n  _id,\n  title,\n  slug,\n  mainImage,\n  author->{\n   _id,\n\t\tfullName,\n    slug\n  },\n  categories,\n  metadataDescription,\n  articleText[]{\n    ...,\n    _type == "reference" => @->{\n      _id,\n      _type,\n      title\n    }\n  },\n  featuredArticle,\n  publishDate,\n  contentfulArchived\n\n  }\n': PostQueryResult
		'\n  *[_type == "author" && slug.current == $slug] [0] {\n    fullName,\n    roleAndCompany,\n    photo,\n    slug\n  }\n': AuthorQueryResult
		'*[_type == "post"]{\n\t_id,\n\ttitle,\n\tslug,\n\tmainImage,\n\tauthor->{\n\t\t_id,\n\t\tfullName,\n    slug\n\t},\n\tcategories,\n\tmetadataDescription,\n\tarticleText[]{\n\t\t...,\n\t\tmarkDefs[]{\n\t\t\t...,\n\t\t\t_type == "link" => {\n\t\t\t\t"href": @.href,\n\t\t\t\t"target": @.target\n\t\t\t}\n\t\t},\n\t\t_type == "reference" => @->{\n\t\t\t_type,\n\t\t\t_id,\n\t\t\ttitle\n\t\t}\n\t},\n\tfeaturedArticle,\n\tpublishDate,\n\tcontentfulArchived\n}': PostsQueryResult
		'\n\t*[_type == "post"] {\n\t\t"categories": categories[]->title\n\t}\n': CategoryQueryResult
		'*[_type == "post" && defined(slug.current)]{"slug": slug.current}': PostSlugsResult
	}
}
