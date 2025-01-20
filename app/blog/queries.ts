import { defineQuery } from "next-sanity"

export const allPostsQuery = defineQuery(`
	*[_type == "post"]{
		...,
		author->
	}
`)

export const singlePostQuery = defineQuery(`
	*[_type == "post" && slug.current == $slug][0]{
		...,
		author->
	}
`)

export const relatedPostsQuery = defineQuery(`
	*[_type == "post" && slug.current != $slug][0...3]{
		...,
		author->
	}
`)
