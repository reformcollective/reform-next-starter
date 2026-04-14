# Blog Template: blog-1

This is a self-contained blog template. Each template has its own scoped Sanity schemas, app routes, and components. Multiple templates can coexist in the same project (e.g. a blog and a resources hub).

## Adopting this template for a project

### 1. Choose a name

Decide on a short slug for this blog instance. Examples: `blog`, `resources`, `news`.
This name is used throughout — in Sanity type names, route folders, and the hub slug.

### 2. Rename the app route folder

```
app/blog-1/  →  app/blog/
```

All internal imports within the folder use relative paths so no changes are needed inside.

### 3. Rename the Sanity schema folder

```
sanity/schemas/blog/blog-1/  →  sanity/schemas/blog/blog/
```

### 4. Rename Sanity type names

In every file inside the schema folder, rename the type prefixes:

| Old | New (example) |
|-----|---------------|
| `blog1Post` | `post` (or `blogPost`, `resourcesPost`, etc.) |
| `blog1Author` | `author` |
| `blog1Category` | `category` |
| `blog1Hub` | `blogHub` |

Files to update:
- `postType.tsx` — `name: "blog1Post"` and any `to: [{ type: "blog1Post" }]` references
- `authorType.tsx` — `name: "blog1Author"`
- `categoryType.tsx` — `name: "blog1Category"`
- `blockContentType.tsx` — `name: "blog1BlockContent"`
- `publishWithReadTime.ts` — references `blog1Post`
- `sanity/schemas/singletons/blog-1.tsx` — rename file and update `name: "blog1Hub"` and `to: [{ type: "blog1Post" }]`

### 5. Update sanity.config.ts

- Update imports to point to the renamed schema folder
- Update the `blog1Types` array to use the new type names
- Update the structure `blog1Item` to use the new type names and titles
- Update `singletonPlugin([..., "blog1Hub"])` to use the new hub type name
- Update `document.actions` if it references `"blog1Post"`

### 6. Update the sitemap

In `app/sitemap.ts`, update the GROQ query:
```ts
*[_type == "blog1Post" ...]  →  *[_type == "post" ...]
```

### 7. Update brand colors and fonts

In `app/styles/colors.css.ts`, replace the `blog1*` placeholder color tokens with project brand colors.

In `app/styles/text.ts`, replace `sampleMetrics` with the correct capsize metrics for the project font. Get metrics from [seek-oss.github.io/capsize](https://seek-oss.github.io/capsize/).

### 8. Set the hub slug in Sanity Studio

Go to Studio → Blog → Hub Settings and generate/set the slug to match the route (e.g. `blog`).

---

## Adding a second blog template

Copy the entire `blog-1` folder, give it a new prefix (e.g. `resources`), and follow the steps above with that prefix. Both templates can live in the same project with separate routes, Sanity types, and Studio structure sections.
