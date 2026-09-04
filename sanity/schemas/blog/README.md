# Blog schemas

Supporting document types for the blog sections: authors, categories, and the rich text
type used by an article's body. The article and hub layouts themselves are page sections,
not routes — see `sanity/schemas/sections/blogHub.ts` and `blogArticle.ts`.

## How a blog is structured

Hubs and articles are both `page` documents, distinguished by the `kind` field:

| kind        | slug              | contains section |
| ----------- | ----------------- | ---------------- |
| `hub`       | `blog`            | Blog Hub         |
| `hubDetail` | `blog/my-article` | Blog Article     |

`kind` describes structure, not content: a hub can be a blog, a partner directory, or
case studies. The sections it contains decide how it looks.

A detail page belongs to the hub its slug is nested under, so a hub's URL is changed by
editing its slug and moving its detail pages to match. Any number of hubs can coexist
(`blog`, `press`, `news`) — nothing is hardcoded, and no deploy is needed to add one.

Hubs may be nested (`press` and `press/stories`); a detail page then belongs to the
deepest hub above it, and the parent hub does not list it.

## Adopting this for a project

1. Replace the `blog1*` placeholder color tokens in `app/styles/colors.css.ts` with the
   project's brand colors, and the placeholder fonts in `app/styles/text.ts`.
2. Recapture the section preview images in `sanity/schemas/sections/preview/` once the
   design is in — they are what an editor picks from in the insert menu.
3. Delete this folder, both blog sections, their projections, and `app/sections/blog/` if
   the project has no blog.
