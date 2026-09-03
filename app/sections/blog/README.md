# Blog

## What changed

The blog used to live in its own route folder, separate from the rest of the site. That
created two problems.

**Only one blog was possible.** The code asked Sanity for "the blog" and took the first
result. Adding a second one — a press section, say — meant a developer writing new code.

**Two route folders competed for the same URLs.** The blog folder and the regular page
folder both matched a one-word URL like `/about`. Next.js silently picked one. When it
picked wrong, the losing page didn't error — it just never appeared. That's the source of
the intermittent, hard-to-diagnose problems we'd hit before.

Now the blog is built from **page sections**, like every other part of the site. One route
handles every URL, so nothing competes.

## How it works for editors

A hub and its articles are both just pages. The **Page Kind** field says which:

| Page Kind       | Example slug      | What it is                  |
| --------------- | ----------------- | --------------------------- |
| Page            | `about`           | a normal page               |
| Hub             | `blog`            | a listing page              |
| Hub Detail Page | `blog/my-article` | one article in that listing |

**An article belongs to whichever hub its slug sits under.** Set an article's slug to
`blog/my-article` and it appears on `/blog`. Change it to `press/my-article` and it moves
to `/press`. That's the whole mechanism — no separate "which blog?" field to keep in sync.

To add a second section — press, news, partners — an editor creates a page, sets Page Kind
to Hub, gives it a slug, and adds a Blog Hub section. No developer, no deploy.

A few things worth knowing:

- **"Hub" isn't blog-specific.** The same structure works for partner profiles or case
  studies. Those would use different sections, but the same Page Kind.
- **Hubs can nest.** `press` and `press/stories` can both be hubs. An article belongs to
  the closest hub above it, so it appears in one listing, not both.
- **Page Kind guides, it doesn't restrict.** It decides which sections appear under the
  "Designed for..." tab and warns if a page's content looks mismatched. Editors can still
  add any section when they need to.
- **Two pages can't share a slug.** Sanity blocks it, because two pages can't share a URL.

## How it works in code

Everything renders through `app/[[...slug]]/page.tsx`. It looks up the URL in Sanity, gets
a page, and renders its sections in order. Blog pages take exactly the same path as any
other page.

**Two sections do the work:**

- `BlogHub.tsx` — the listing, with search, filters, and a featured article
- `BlogArticle.tsx` — the article body

Shared components live in `app/sections/blog/components/`, and the queries in `queries.ts`.

**Two things to be careful about:**

**Section media needs a projection.** If you add a field holding an image, video, or link,
add its projection in `sanity/schemas/sections/projections/`. Without it the field returns
an unresolved reference and renders as nothing. Plain text and boolean fields need nothing.

**Those projections must stay plain strings.** Sanity generates our types by reading the
source code, so it can't follow anything computed at runtime. Building a query with
`.map()` or `.join()` silently drops it from type generation, and the page's data becomes
untyped.

## About the size of the page query

A fair question in review: now that one query serves every page, does it get too big?

**Where things stand.** Each section contributes a small block to the query, and only
sections holding an image, video, or link need one at all. Today:

| Section      | Query text         |
| ------------ | ------------------ |
| Sample       | 152 characters     |
| Blog Hub     | 341                |
| Blog Article | 170                |
| FAQ          | none needed        |
| **Total**    | **663 characters** |

The library warns at 200KB. We're at roughly 0.3% of that, and queries get their whitespace
stripped before being sent, so the real figure is smaller still.

**It grows with the number of section types, not with content.** Adding pages, articles, or
images changes nothing. Only adding new _kinds_ of section adds text — and only those with
media. At the current average, a project with 50 section types would sit around 10KB, still
far below the threshold.

**Per-request cost doesn't grow at all.** Each block is conditional on the section's type,
so a page only fetches data for the sections it actually contains. A page with one FAQ
section doesn't pay for the blog hub's queries. That's true no matter how many section
types the project defines.

**If a project ever did approach the limit**, the fix is known and contained: fetch a
page's section types first, then request only those blocks. It touches one file. We didn't
build it now because it costs an extra round trip to solve a problem no project is close to
having.

**One thing we deliberately didn't do.** An earlier version added a build-time size check.
We removed it — the library already warns, and our own limit was a number we'd guessed
rather than verified. A wrong number in a guardrail is worse than no guardrail, because the
next developer trusts it.

## Why read time isn't stored

It's calculated from the article body wherever it's shown — once in Sanity for the editor,
once on the page. Both use the same function in `app/utils/getReadTime.ts`. Storing it
would mean it goes stale the moment someone edits the body without triggering a save.

## Sample content

The starter dataset holds two hubs (`/blog` and `/press`) with five articles between them,
deliberately covering the awkward cases: one article using every rich-text feature, one
with no image, and a hub with no featured article set.

Because that dataset is shared and anyone can edit it,
`scripts/reset-to-baseline.ts` puts it back. Run it when the sample content has drifted or
been emptied and you want something testable again:

```sh
node --env-file=.env --experimental-strip-types scripts/reset-to-baseline.ts --dry-run
```

Drop `--dry-run` to write. It only touches the documents it created, and re-running is
safe — every document has a fixed id, so nothing duplicates.
