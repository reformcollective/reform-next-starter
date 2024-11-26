import { defineQuery } from "next-sanity"

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

// const postFields = /* groq */ `
//   _id,
//   "status": select(_originalId in path("drafts.**") => "draft", "published"),
//   "title": coalesce(title, "Untitled"),
//   "slug": slug.current,
//   excerpt,
//   coverImage,
//   "date": coalesce(date, _updatedAt),
//   "author": author->{"name": coalesce(name, "Anonymous"), picture},
// `;

export const postFields = `
  _id,
  title,
  slug,
  mainImage,
  author->{
   _id,
		fullName,
    slug
  },
  categories,
  metadataDescription,
  articleText[]{
    ...,
    _type == "reference" => @->{
      _id,
      _type,
      title
    }
  },
  featuredArticle,
  publishDate,
  contentfulArchived
`

export const morePostsFields = `
  _id,
  title,
  slug,
  mainImage,
  `

export const heroQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) [0] {
    content,
    ${postFields}
  }
`)

export const moreStoriesQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${morePostsFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content,
    ${postFields}
  }
`)

export const authorQuery = defineQuery(`
  *[_type == "author" && slug.current == $slug] [0] {
    fullName,
    roleAndCompany,
    photo,
    slug
  }
`)

export const postsQuery = defineQuery(`*[_type == "post"]{
	_id,
	title,
	slug,
	mainImage,
	author->{
		_id,
		fullName,
    slug
	},
	categories,
	metadataDescription,
	articleText[]{
		...,
		markDefs[]{
			...,
			_type == "link" => {
				"href": @.href,
				"target": @.target
			}
		},
		_type == "reference" => @->{
			_type,
			_id,
			title
		}
	},
	featuredArticle,
	publishDate,
	contentfulArchived
}`)

export const categoryQuery = defineQuery(`
	*[_type == "post"] {
		"categories": categories[]->title
	}
`)
