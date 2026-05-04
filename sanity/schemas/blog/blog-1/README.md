# Blog Template: blog-1

This is a self-contained blog template. Each template has its own scoped Sanity schemas, app routes, and components. Multiple templates can coexist in the same project (e.g. a blog and a resources hub).

The public URL for the blog is controlled entirely by the slug field in the Sanity hub singleton — no code changes are needed to set or change the route.

## Adopting this template for a project

### 1. Set the hub slug in Sanity Studio

Go to Studio → Blog 1 → Hub Settings and set the slug to whatever the public URL should be (e.g. `blog`, `resources`, `news`). This drives the route, sitemap, and canonical URLs automatically.

### 2. Update brand colors

In `app/styles/colors.css.ts`, replace the `blog1*` placeholder color tokens with project brand colors.

### 3. Update the grid

In `app/(blog-templates)/(blog-template-1)/[blogSlug]/layout.tsx`, update the `makeResponsiveGrid` values to match the project's design grid (column count, gutter, margin, design widths).

### 4. Delete unused templates

Delete any unused template folders under `app/(blog-templates)/` and `sanity/schemas/blog/`.

---

## Adding a second blog template

Copy the entire `(blog-template-1)` folder under `app/(blog-templates)/` and give it a new name (e.g. `(blog-template-2)`). Update the absolute imports inside it to reflect the new folder name. Copy and rename the Sanity schema folder and type names using the steps above. Set a different slug in Studio for the second hub — each template's URL is independent.
