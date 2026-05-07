# Reform Next Starter

Starter Setup!
Remove each item from the list as you complete it.

## Local Setup

1. Clone using the template in GitHub
1. Copy the starters `.env` file to your own `.env` file (you'll update this during sanity setup or ejection)
1. Update all existing packages with `pnpm update --latest --recursive` (feel free to update the starter repository as well)
1. Update the README.md to add project-specific image and name below
1. Delete the `app/visual-tests` folder

## Online Setup

1. Configure branch rules on github (you should export and import the starter's rule set)
1. In repository settings, enable "Always suggest updating pull request branches", "Allow auto-merge", and "Automatically delete head branches"
1. Set up a Vercel build and link to sanity if available/part of project
1. Add .env variables (if any) to Vercel, Notion, and Github (beware fancy quotes) (see sanity setup).

## Design Setup

1. Add any typography to `app/styles/fonts/typography.ts`, and configure a default text color/style in `app/styles/project.tsx`
1. Add any text styles to `app/styles/text.ts` — get capsize font metrics from [seek-oss.github.io/capsize](https://seek-oss.github.io/capsize/)
1. Configure the library config according to this project's needs.
1. Update the `app/manifest.webmanifest` to include colors and metadata
1. If they exist, export the fullmark, logomark, and wordmark from figma and add them to `app/images`
1. Replace `app/favicon.ico`, `app/opengraph-image.jpg`, and `app/twitter-image.jpg` with project assets

## Sanity Setup or Removal

If this project is using a CMS, set up a new project in Sanity. If we're not sure, just leave it using the starter's project until we know (it's easy to remove if unneeded, but a pain to add back in)

### Removing Sanity

1. in `package.json`, delete any scripts that reference sanity.
1. delete `app/(sanity)`, `app/(blog-templates)`, `app/[[...slug]]`, and `sanity` folders
1. delete `.vscode/tasks.json`, `sanity.config.ts`, `sanity.types.ts`, and `sanity.cli.ts`, and any other sanity-related files in the root of the project
1. remove `SanityLive`, `SanityFetch`, and `defineQuery`, as well as any dependent code, from `app/layout.tsx`, `app/components/Header.tsx`, `app/components/Footer.tsx`, and `app/sitemap.ts`
1. add `library/sanity` and `library/UniversalImage.tsx` to the `exclude` array in `tsconfig.json` (you'll be using StaticImage instead)
1. remove any sanity-related packages from `package.json`
1. run `pnpx tsgo` and clean up any type errors or missed sanity files
1. if no env variables remain, you can also remove the `checkEnv` script from `package.json`

### Setting up Sanity

1. You'll need the following variables in your `.env` file:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` is your project ID, for example `m85xxx23`
   - `NEXT_PUBLIC_SANITY_DATASET` is your dataset name, for a new project this is `production` (if we're working on updates while the site is live we'll use `development`)
   - `SANITY_AUTH_TOKEN` is a read only access token. Generate one in Sanity under the `API` tab

## Blog Template Adoption

If this project uses a blog template, adopt it from the starter by completing these steps. Full details in `sanity/schemas/blog/blog-1/README.md`.

1. Set the hub slug in Sanity Studio (Studio → Blog 1 → Hub Settings) — this drives the public URL, sitemap, and canonical URLs
1. Replace `blog1*` placeholder color tokens in `app/styles/colors.css.ts` with project brand colors
1. Update grid values in `app/(blog-templates)/(blog-template-1)/[blogSlug]/layout.tsx` to match the design
1. Delete unused template folders under `app/(blog-templates)/` and `sanity/schemas/blog/`

<!-- Repository Cover -->
<!-- you can get a nice image by modifying the figma cover, or using the opengraph image -->
<img src="./app/opengraph-image.jpg" alt="Project Name Website Repository" width="100%" style="border-radius: 50px">
<br><br>

# Project Name

Built with Next. Install dependencies with `pnpm i` and run with `pnpm dev`

## Setup

1. Install PNPM
   You need at least pnpm 10. pnpm manages its own version, so any version >=10.x will work.

1. (Optional) Install Node
   You don't strictly need Node, since pnpm will download it for you. If you do want to install node globally, you can do so with pnpm: `pnpm env use --global lts`

1. (Optional) Configure wireit
   Wireit by default will run tasks in parallel where possible. It suppresses logs when doing so, unless there's an error. If you want to see verbose logging output, you can set an environment variable to configure the behavior. You can also disable parallel runs entirely in a similar fashion. See their readme for more details: https://github.com/google/wireit#environment-variables

   I've configured my default logger to be `WIREIT_LOGGER=metrics`

---

See [CONVENTIONS.md](CONVENTIONS.md) for code and project structure conventions.
