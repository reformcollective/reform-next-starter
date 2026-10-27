# Verification: UniversalVideo, Sanity input, Next 16.4.3 (read only)

Repo: /Users/davidcampbell/Documents/nextapps/reform-next-starter. Date 2026-10-27.
Installed: next 16.4.3 (node_modules/next/package.json), sanity 6.20.0, @sanity/client 8.11.0, react 19.3.1, @types/react 19.3.0, next-sanity ^13.4.0 (package.json:178; pnpm store also holds 13.1.1 copies, which one resolves for the app was NOT checked).
Short names: SAN = node_modules/sanity/lib ; SANTYPES = node_modules/.pnpm/sanity@6.20.0_*/node_modules/@sanity/types/lib/index.d.ts ; CLIENT = node_modules/@sanity/client/dist ; DOCS = node_modules/next/dist/docs/01-app.

## 1. Sanity custom input components (sanity 6.20.0)

### Field-level components API

- Verified. SAN/empty--oD_iDWK.d.ts:371-379:
  `interface ObjectComponents { annotation?: ComponentType<BlockAnnotationProps>; block?: ...; diff?: ComponentType<any>; field?: ComponentType<ObjectFieldProps>; inlineBlock?: ...; input?: ComponentType<ObjectInputProps>; item?: ComponentType<ObjectItemProps>; preview?: ComponentType<PreviewProps>; }`
  and ObjectDefinition gets it at empty--oD_iDWK.d.ts:656-662: `interface ObjectDefinition { /** @hidden @beta */ components?: ObjectComponents;`
- Verified. StringComponents at empty--oD_iDWK.d.ts:440-446: `input?: ComponentType<StringInputProps>;`
- Verified. Field definitions: SANTYPES:2205-2225 `interface FieldDefinitionBase { ... /** @beta */ components?: { ... field?: ComponentType<any>; input?: ComponentType<any>; ...`
- Both are tagged `@hidden @beta` in the d.ts. They are used in this repo anyway (see house pattern).

### Props

- Verified. SAN/types-DJj2bmOM.d.ts:5530 `interface ObjectInputProps<T = Record<string, any>, S extends ObjectSchemaType = ObjectSchemaType> extends BaseInputProps, Omit<ObjectFormNode<T, S>, '_allMembers' | 'displayInlineChanges'>` with (5538) `onChange: (patch: FormPatch | FormPatch[] | PatchEvent) => void;`
- Verified. BaseInputProps (5518): `renderDefault: (props: InputProps) => React.JSX.Element; displayInlineChanges: boolean;`
- Verified. BaseFormNode (4836-4854) provides `id: string`, `schemaType: S`, `path: Path` ("The path of the node in the form hierarchy."), `value: T | undefined` ("The value of the node."), `readOnly?: boolean`. ObjectFormNode (4871) adds `focusPath`, `groups`, `members`.
- Verified. StringInputProps (5829): `extends BaseInputProps, Omit<StringFormNode<S>, 'displayInlineChanges'>` with `onChange: (patch: FormPatch | FormPatch[] | PatchEvent) => void;`

### Patch helpers

- Verified. SAN/empty--oD_iDWK.d.ts:149-173 (all `@hidden @beta`): `declare function setIfMissing(value: any, path?: Path): FormSetIfMissingPatch;` `declare function insert(items: any[], position: FormInsertPatchPosition, path?: Path)`, `declare function set(value: any, path?: Path): FormSetPatch;` `declare function unset(path?: Path): FormUnsetPatch;` `diffMatchPatch`, `inc`, `dec`.
- Verified. SAN/types-DJj2bmOM.d.ts:3798 `type FormPatch = FormSetPatch | FormSetIfMissingPatch | FormUnsetPatch | FormInsertPatch | FormDiffMatchPatch;` and 3810-3817 `declare class PatchEvent { static from(input: PatchArg | PatchEvent): PatchEvent; patches; constructor(patches); prepend(...); append(...); prefixAll(segment: PathSegment): PatchEvent; }`
- Verified (source behavior): the Studio's own array-of-objects input scopes child patches to the child by prefixing, e.g. SAN/PerspectiveProvider-yROO8uCZ.js:10626 `onChange(PatchEvent.from(event_1).prepend(setIfMissing([])).prefixAll(member.name))` and 11185 `onChange(PatchEvent.from(event).prepend(setIfMissing(createProtoValue(member.field.schemaType))).prefixAll(member.name))`. So a patch emitted inside an object input is relative to that object, and the parent prefixes its path.
- NOT VERIFIED (literal statement): I did not find a doc sentence saying "onChange in an object input takes paths relative to the object". The relative-path conclusion comes from the prefixAll call sites above plus the Studio image uploader (below), which calls `set(..., ["asset"])` with a one-segment path on the image object. I did not read the body of ObjectInput (SAN/PerspectiveProvider-yROO8uCZ.js:28846) to confirm.

### useFormValue

- Verified. SAN/VisibleWorkspacesProvider-W9xt1leX.d.ts:1002-1026. Doc: "React hook that returns the value of the field specified by a path, or the whole document when called without one." Signature (line 1026): `declare function useFormValue(path?: Path): unknown;`. Param doc: "An array notation with segments that are either strings representing field names, index integers for arrays with simple values, or objects with a _key for arrays containing objects. Defaults to the document root." Example from the file: `useFormValue(['author', 'name'])`, `useFormValue([ 'bibliography', {_key: '<key>'} ])`.
- Semantics: path is document-root based (the doc says "or the whole document when called without one"). Return is `unknown`, so it needs a cast, as the repo does.

### useClient

- Verified. SAN/useDocumentOperationEvent-DNUHFL_3.d.ts:3515 `declare function useClient(clientOptions: SourceClientOptions): SanityClient;` and 3535 `declare function useClient(): SanityClient;` (the no-arg form is marked deprecated at ~3518: "Calling `useClient()` without specifying an API version is deprecated - specify a date ... e.g. `useClient({apiVersion: \"2025-02-07\"})`"). Doc: "Automatically uses the correct project and dataset based on the current active workspace." Example in file: `const client = useClient({apiVersion: '2021-06-07'})`.

### Minimal example shape (assembled strictly from the installed types above; I did not compile or run it)

```tsx
import { type ObjectInputProps, set, unset, useClient, useFormValue } from "sanity"
// field:  defineField({ ..., components: { input: MyInput } })   // or on defineType({ type: "object", components: { input } })
function MyInput(props: ObjectInputProps) {
	const { onChange, renderDefault, value, path } = props
	const client = useClient({ apiVersion: "2025-12-11" })
	// write a sibling field of this object:
	// onChange(set("https://...", ["thumbnailUrl"]))   // or onChange(unset(["thumbnailUrl"]))
	return renderDefault(props)
}
```

- NOT VERIFIED: that `set`, `unset`, `useFormValue`, `useClient` and `ObjectInputProps` are all exported from the `sanity` entry. `useFormValue` is imported from "sanity" in this repo (sanity/schemas/blog/ReadTimeInput.tsx:2). I did not grep index.d.ts exports for the others. Dev must confirm with the type checker.

### House pattern in THIS repo

- Verified. Only one real custom input: `sanity/schemas/blog/ReadTimeInput.tsx` (read in full). It is a function component with no props, uses `useFormValue(["sections"]) as ArticleSection[] | undefined`, and renders `<p className="studio-read-time">`. Wired at `sanity/schemas/sanityPage.tsx:222`: `components: { input: ReadTimeInput },` on a `readOnly: true` string field.
- Verified. `library/sanity/reusables.tsx:618-` `calloutField` uses `components: { field: () => (<div style={{...}}>...) }`. It uses inline `style={{}}`, which the AGENTS.md convention forbids; studio-side code is the exception in this file. Studio CSS lives in `app/(sanity)/studio/[[...tool]]/style.css` (classes `studio-read-time`, `studio-code`).
- Verified. Help & Docs pane: `sanity.config.ts:29-30` imports `HelpDocPane` and `helpTree`; `sanity.config.ts:55-` `helpEntryItem` builds `S.component().id(entry.id).title(entry.title).component(HelpDocPane).options({ docId: entry.id })`. `sanity/components/help/HelpDocPane.tsx` uses `@sanity/ui` (`Box, Card, Container, Flex, Heading, Stack, Text`) with props `{ options?: { docId?: unknown } }`. Content in `sanity/components/help/helpDocs.ts`.
- Verified. The shared `video` type is at `library/sanity/reusables.tsx:328-` (fields sourceType, url, muxVideo, posterImage). It currently has no `components`.

## 2. Studio image upload (@sanity/client 8.11.0)

- Verified. CLIENT/types-Bolhz2XV.d.ts:1107 (promise client) `upload(assetType: 'image', body: UploadBody, options?: UploadClientConfig): Promise<SanityImageAssetDocument>;` and 1057 (observable client) `upload(assetType: 'image', body: UploadBody, options?: UploadClientConfig): Observable<UploadEvent<{ document: SanityImageAssetDocument; }>>;`
- Verified. Body: types-Bolhz2XV.d.ts:10552 `type UploadBody = File | Blob | Buffer | NodeJS.ReadableStream;` and JSDoc "Asset content - can be a browser File instance, a Blob, a Node.js Buffer instance or a Node.js ReadableStream."
- Verified. Options, types-Bolhz2XV.d.ts:10850-10916 `interface UploadClientConfig`: `tag?: string`, `preserveFilename?: boolean` ("Whether or not to preserve the original filename (default: true)"), `filename?: string` ("Filename for this file (optional)"), `timeout?: number` ("uploads have NO timeout unless one is explicitly set here"), `contentType?: string` ("Mime type of the file"), `extract?: AssetMetadataType[]` ("Array of metadata parts to extract from asset"), `label?`, `title?`, `description?`, `creditLine?`, `source?: { id: string; name: string; url?: string }` ("Source data (when the asset is from an external service)").
- Verified. `type AssetMetadataType = 'location' | 'exif' | 'image' | 'palette' | 'lqip' | 'blurhash' | 'thumbhash' | 'none';` (types-Bolhz2XV.d.ts:10848).
- Verified. Return: `SanityImageAssetDocument extends SanityAssetDocument` (10929-10948) with `url, path, size, assetId, mimeType, sha1hash, extension, uploadId?, originalFilename?` plus `_id, _type, _rev, _createdAt, _updatedAt`, and `metadata` (`lqip?`, `blurHash?`, `thumbHash?`, `dimensions {aspectRatio,height,width}`, `palette?`).
- Verified (source): the Studio's image uploader builds the field value via patches. SAN/PerspectiveProvider-yROO8uCZ.js:5655-5660: `set$1({ _type: "reference", _ref: event.asset._id }, ["asset"])` and at ~10185 `onChange(PatchEvent.from([setIfMissing({ _type: schemaType.name })]))`. So the image value is `{ _type: "image", asset: { _type: "reference", _ref: <asset._id> } }`.
- Verified (source): how the Studio calls client. PerspectiveProvider-yROO8uCZ.js:5352-5376 `uploadSanityAsset` maps schema options into client options: `extract = options.metadata`, `preserveFilename = options.storeOriginalFilename`, then `client.observable.assets.upload(assetType, file, { tag: "asset.upload", extract, preserveFilename, label, title, description, creditLine, source })`. It first hashes the file and reuses an existing asset (`fetchExisting(client, \`sanity.${assetType}Asset\`, hash)`).
- NOT VERIFIED: the filename/contentType a Blob needs when fetched from a URL (not tested; no credentials). Whether the Studio's `useClient` instance carries write permission is a runtime matter and was not tested.
- This repo's `universalImage` (library/sanity/reusables.tsx:91-) is `type: "image"` with an `alt` text field, so a copied poster would be stored as `{_type:"image", asset:{_type:"reference",_ref}}`.

## 3. Same-origin route handler, fetch, caching, Studio mount

- Verified. DOCS/03-api-reference/03-file-conventions/route.md:8-12:
  ```
  export async function GET() {
    return Response.json({ message: 'Hello World' })
  }
  ```
  Line 22-24: "The following HTTP methods are supported: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`." Examples use `app/api/route.ts` (e.g. line 155).
- Verified. Returning headers/body with a Web Response: route.md:162-165 `return new Response('Hello, Next.js!', { status: 200, headers: { 'Set-Cookie': ... } })`. Binary via `new Response(arrayBuffer, { headers })` follows from the Web Response API; the docs page does not show an ArrayBuffer example (NOT VERIFIED as a docs quote, only the Web API shape).
- Verified (observed). Server fetch with a Referer header, run here with `node -e` equivalent (probe.mjs, Node v25.2.1):
  `fetch("https://httpbin.org/headers", { headers: { Referer: "https://example.com/x", Origin: "https://example.com", "User-Agent": "probe/1.0" } })` returned 200 and the echo contained `"Origin": "https://example.com"`, `"Referer": "https://example.com/x"`, `"User-Agent": "probe/1.0"`. So Node's undici fetch does send Referer and Origin when set. Observed on Node 25.2.1 only. Behavior inside Next's patched fetch and on the deployed runtime was NOT tested.
- Verified. Route Handler caching, DOCS/01-getting-started/15-route-handlers.md:51: "Route Handlers are not cached by default. You can, however, opt into caching for `GET` methods. Other supported HTTP methods are **not** cached. To cache a `GET` method, use a [route config option](...) such as `export const dynamic = 'force-static'` in your Route Handler file." Version history, route.md:668: "`v15.0.0-RC` | The default caching for `GET` handlers was changed from static to dynamic".
- Verified. fetch caching, DOCS/03-api-reference/04-functions/fetch.md:51-57: "**`auto no cache`** (default): Next.js fetches the resource from the remote server on every request in development, but will fetch once during `next build` because the route will be statically prerendered. If [Request-time APIs] are detected on the route, Next.js will fetch the resource on every request." "**`no-store`**: Next.js fetches the resource from the remote server on every request, even if Request-time APIs are not detected on the route." "**`force-cache`**: ..." and "> **Good to know**: Caching is opt-in."
  Implication (inference, not a quote): a thumbnail route that reads `request.url`/searchParams is request-time; `cache: "no-store"` makes the intent explicit. Cache Components are not enabled in next.config.ts and are not recommended here.
- Verified. Segment config for Route Handlers (route.md:640-653): `export const dynamic = 'auto'`, `revalidate = false`, `fetchCache = 'auto'`, `runtime = 'nodejs'`.
- Studio mount. Verified: `app/(sanity)/studio/[[...tool]]/page.tsx` is a client page: `<Portal><NextStudio config={config} /></Portal>`; `app/(sanity)/layout.tsx` only re-exports `metadata, viewport` from `next-sanity/studio` and returns children. Existing API routes live in the same group: `app/(sanity)/api/live/route.ts`, `app/(sanity)/api/draft-mode/enable/route.ts`, `.../disable/route.ts`. So a new `app/(sanity)/api/<name>/route.ts` or `app/api/<name>/route.ts` both fit; `app/api` does not exist yet.
- Verified. No `middleware.ts` or `proxy.ts` anywhere in the repo (find, excluding node_modules): nothing can intercept `/api/...` at that layer. `next.config.ts` has only `redirects: /home -> /` (and `images.qualities`), no rewrites or headers. A catch-all `app/[[...slug]]` exists; I did not verify precedence against `app/api/*` from the docs.
- NOT VERIFIED: any docs sentence about the Studio route affecting `/api` routes. I grepped DOCS for "studio" and found only unrelated "visual studio" hits. Nothing in the local Next docs says so. The Studio base path is `/studio` (`sanity/lib/api.ts:20`, `sanity.config.ts:90 basePath: studioUrl`), which does not cover `/api`.
- Library note: `library/sanity/liveProxy.ts` (re-exported by api/live/route.ts) sets `export const dynamic = "force-dynamic"`.

## 4. Remote images in Next 16.4.3 and this repo's image components

- Verified. DOCS/03-api-reference/02-components/image.md:
  - src, line 71: "An absolute external URL (must be configured with [remotePatterns](#remotepatterns))."
  - line 87-88: "> **Good to know**: For security reasons, the Image Optimization API using the default [loader](#loader) will _not_ forward headers when fetching the `src` image. If the `src` image requires authentication, consider using the [unoptimized](#unoptimized) property to disable Image Optimization."
  - remotePatterns, line 541: `remotePatterns: [new URL('https://example.com/account123/**')],` (v15.3.0 added URL objects). Object form at 551+ with `protocol, hostname, port, pathname, search`. Line 612: "Note that any allowed `remotePatterns` that respond with a redirect will follow the redirect from the remote image server without validating `remotePatterns` again on the redirect location."
  - unoptimized, line 392-411: "`true`: The source image will be served as-is from the `src` instead of changing quality, size, or format." Also settable globally via `images: { unoptimized: true }`.
  - loader, line 137: "A custom function used to generate the image URL. The function receives ... `src`, `width`, `quality`".
  - Remote image width/height, line 1246: "Since Next.js does not have access to remote files during the build process, you'll need to provide the width, height and optional blurDataURL props manually."
- Verified (priority rename). image.md:292-294: "#### `priority` Starting with Next.js 16, the `priority` property has been deprecated in favor of the [`preload`](#preload) property in order to make the behavior clear." Version history line 1405: "`v16.0.0` | ... `preload` prop added, `priority` prop deprecated ...".
- Verified. preload, image.md:266-290: "A boolean that indicates if the image should be preloaded." "`true`: Preloads the image by inserting a `<link>` in the `<head>`." "When not to use it: ... When the `loading` property is used. When the `fetchPriority` property is used." "In most cases, you should use `loading="eager"` or `fetchPriority="high"` instead of `preload`."
- Verified. loading, image.md:296-310: "Defaults to lazy"; values `lazy` and `eager`. `fetchPriority` is referenced at 288, 290, 1322 as usable ("Instead, you can use [`fetchPriority="high"`]"). Other props pass through to `img` except `srcSet` (469-473).
- Verified. Plain `<img>`: DOCS/03-api-reference/05-config/03-eslint.md:114 lists `@next/next/no-img-element`: "Prevent usage of `<img>` element due to slower LCP and higher bandwidth." This repo's lint config for that rule was NOT checked (the repo uses oxlint).
- Hosts i.ytimg.com, i.vimeocdn.com, image-cdn-fa.spotifycdn.com, image.mux.com, Sanity CDN: Verified requirement only generically. Using `next/image` with these as `src` requires a `remotePatterns` entry per host (or `unoptimized`). NOT VERIFIED: whether each provider host accepts hotlinking or what dimensions each returns (no provider docs read). Current `next.config.ts` images config: only `images: { qualities: [90] }`. No remotePatterns, no loader, no unoptimized.
- Verified (repo components):
  - `library/UniversalImage.tsx` (7 lines): `export default SanityImage` from `./sanity/SanityImage`, types `Props = SanityImageProps | StaticImageProps`.
  - `library/StaticImage.tsx` (client): props `alt`, `loading?: "eager" | "lazy" | "default"`, and a union: `src: StaticImageData` with `width?, height?, sizes?, quality?, priority?: boolean, placeholder?`; or `src: string` with required `width, height` and `quality?: never; priority?: never; placeholder?: never`. Default `quality = 90`, `sizes ?? "100vw"` for static data. `prioritizeLoading`: eager if `EagerContext` true, `"default"` returns undefined, else given value, else `"lazy"`. A string `src` renders a plain styled `img` (`styled("img", defaultImageConfig)`), static data renders `next/image` (`styled(Image, ...)`), passing `priority={priority}` (the deprecated name) to next/image. `DefaultImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height" | "loading" | "alt">`, so `fetchPriority` passes through `...otherProps`.
  - `library/sanity/SanityImage.tsx`: `SanityUniversalImage` delegates string or static-import `src` to `StaticImage`, otherwise `SanityImageCore`. Core builds URLs with `@sanity/image-url` (`.quality(quality).auto("format")`, `imgSrc = base.width(1600)`, `srcSet` widths `[400, 800, 1200, 1600, 2400]`), renders a plain styled `<img>` with `loading` from `prioritizeLoading`, `alt={stegaClean(...)}`, an lqip background, hotspot object-position, and `aspectRatio` token. Props: `src: {asset?:{_ref}, crop?, hotspot?, data, alt?, willHaveAlt?}`, `loading?`, `quality?`, `width?`, `height?`, plus the DefaultImageProps passthrough (so `fetchPriority` and `sizes` pass through `rest` and are spread onto the img; there is no `sizes` prop that overrides the srcSet widths beyond what is passed). It has no `priority` prop.
  - `@types/react` 19.3.0 `ImgHTMLAttributes` has `fetchPriority?: "high" | "low" | "auto" | undefined;` (index.d.ts:3263).
  - So a provider thumbnail via these components: a string URL goes through StaticImage's plain `img` branch (needs explicit width and height, no optimization, no remotePatterns needed). A copied Sanity poster goes through SanityImage with the `reform::image` projection `data`.

## 5. Stega

- Verified. `sanity/lib/client.ts`: `createClient({ projectId, dataset, apiVersion, useCdn: true, stega: { studioUrl } })`; `sanity/lib/api.ts:20` `studioUrl = "/studio"`, `apiVersion = "2025-12-11"`.
- Verified. `library/sanity/live.tsx`: `defineLive({ client: libraryClient, serverToken: token, browserToken: token })`; `libraryFetch` passes `stega: disableStega ? false : undefined` (the arg doc: "Always disable stega when calling sanityFetch within generateMetadata / generateViewport / generateSitemaps / generateImageMetadata"). `library/sanity/liveProxy.ts:` `client.withConfig({ token, useCdn: false, stega: false })`.
- Verified. `stegaClean` users: `library/videos/VideoEmbed.tsx` (`stegaClean(video.sourceType) === "mux"`), `library/sanity/SanityImage.tsx` (alt), `library/link/resolve.ts`, `app/layout.tsx:63`, `library/sanity/live.client.tsx:291`.
- Verified. `VideoEmbed.getVideoSrc` cleans only `sourceType`. It returns `video.url ?? null` and `video.muxVideo?.data?.videoThumbnailUrl` without cleaning.
- Verified (installed client source) default stega filter, CLIENT/stegaEncodeSourceMap-BuP-MslV.js:23-27: `const filterDefault = ({ sourcePath, resultPath, value }) => { if (isValidDate(value) || isValidURL(value)) return !1; ... typeof endPath == "string" && (endPath.startsWith("_") || endPath.endsWith("Id")) || ... denylist.has(endPath)` and the denylist includes `url`, `type`, `lqip`, `href`, `path`, `slug`, `id`, `key`, `format`, `locale`, `status`, `theme`, `variant`. Consequences: valid http(s) URL values are not encoded, which is why `url` is safe uncleaned; `sourceType` (not in denylist, not a URL) is encoded, which is why it is cleaned. Any new free-text field (title, caption, transcript, alt, label) would be encoded and needs `stegaClean` before comparing, parsing, or putting in attributes. A stored thumbnail URL is skipped by the filter, but cleaning is harmless.
- NOT VERIFIED: that `VideoEmbed` is rendered inside a stega-enabled fetch in all pages (depends on each call site's `disableStega`).

## 6. Portable Text video block, projection, and type regeneration

- Verified. `sanity/schemas/blog/blockContentType.tsx:76`: `defineArrayMember({ type: "video" })` inside the body array.
- Verified. `sanity/schemas/sections/projections/blogArticle.ts`: `body[] { ..., _type == "image" => reform::image(@), _type == "video" => reform::video(@) }`.
- Verified. `library/sanity/assetMetadata.ts:139-140`: `const videoProjection = \`{ ..., muxVideo ${muxVideoProjection}, posterImage ${imageProjection} }\``and`fn reform::video($video) = $video ${videoProjection};`plus`fn reform::videos($videos) = $videos[] ${videoProjection};`. The leading `...`spreads all stored top-level fields, so a new plain field (for example`thumbnailUrl: string`) is returned by the projection without edits. A new copied-image field (an `image`with an asset ref) would need its own projection entry like`posterImage ${imageProjection}`to resolve`data`(lqip, url, aspectRatio) via`asset->`; without it only the raw `{asset:{_ref}}` comes back.
- Verified. Hand-written type `VideoField` in `library/sanity/assetMetadata.ts:31-55` (`sourceType`, `url`, `muxVideo`, `posterImage`) is what `VideoEmbed` consumes; new fields must be added there manually (the file comment says the three types "were directly copied from the starter's generated types").
- Verified. Rendering: `app/sections/blog/BlogRich.tsx:41` `video: ({ value }) => <StyledVideoEmbed video={value} />`, `StyledVideoEmbed = styled(VideoEmbed, [...aspect-ratio: 16 / 9 ...])` at line 173. `VideoEmbed` (library/videos/VideoEmbed.tsx) wraps `react-player` in `ClientOnly`.
- Verified. Generated types: `sanity.types.ts` contains the video type (line 205 `_type: "video";`) and the expanded queries (lines 1021, 1143 for projected video bodies, and `// Query:` comments with the whole `reform::video` function text).
- Verified. Commands, package.json wireit scripts:
  - `sanity-typegen:check`: `(sanity schema extract && sanity typegen generate) || (pnpm exec sanity schema validate)`; outputs `schema.json`, `sanity.types.ts`.
  - `next-typegen:check`: `next typegen`.
  - `typegen:check` depends on both; `oxlint` depends on `typegen:check`; `lint` depends on `stylelint`, `oxlint`, `check-projections`.
  - `check-projections`: `node --experimental-strip-types scripts/check-section-projections.ts`.
  - Watch mode: `sanity-schema:dev` = `sanity schema extract --watch --force`, `typegen:dev` = `sanity typegen generate --watch` (the `dev` script depends on `typegen:dev`).
  - `sanity.cli.ts`: `schemaExtraction.watchPatterns` = `sanity/**/*.{ts,tsx}`, `library/sanity/**/*.{ts,tsx}`, `library/link/**/*.{ts,tsx}`; `typegen.path` = `["app/**/*.{ts,tsx,js,jsx}", "library/**/*.{ts,tsx,js,jsx}"]`.
  - Per AGENTS.md the required check is `WIREIT_LOGGER=metrics pnpm lint` (includes typegen/projection checks). I ran none of these.
- Constraint from AGENTS.md: `library/` is a shared submodule and must stay generic. `library/sanity/reusables.tsx`, `assetMetadata.ts` and `VideoEmbed.tsx` are inside it. `git status` shows `M library` already modified.

## 7. Draft mode, Presentation, visual editing

- Verified. `app/(sanity)/api/draft-mode/enable/route.ts`: `export const { GET } = defineEnableDraftMode({ client: client.withConfig({ token }) })` (from `next-sanity/draft-mode`). `.../disable/route.ts`: `await disableDraftMode(); return Response.json({ message: "Draft mode disabled" }, { status: 200 })`. `library/sanity/disableDraftMode.ts`: `"use server"`; `(await draftMode()).disable()` raced with a 1 s delay.
- Verified. Presentation is enabled: `sanity.config.ts:179-190` `presentationTool({ previewUrl: { initial: siteURL, previewMode: { enable: "/api/draft-mode/enable", disable: "/api/draft-mode/disable" } }, allowOrigins: ["http://localhost:*"], resolve: { locations: resolveDocumentLocations }, title: "Live Preview" })`.
- Verified. `VisualEditing` is used, gated on draft mode: `library/sanity/live.client.tsx:262-271` `SanityVisualEditingOverlay` returns null unless `isDraftMode`, else `<VisualEditing {...props} />`. In the Studio route (`pathname.startsWith(studioUrl)`), the runtime renders only `Toaster` and `SanityRuntimeRefresh` (lines 77-88), so no visual-editing overlay mounts inside the `/studio` page itself.
- What the code implies (inferences, labeled): (a) a custom input renders in the Studio, not in the preview iframe, so stega does not touch the input's own `value` (that comes from the Studio form, not from a stega'd fetch). (b) In the Presentation preview (draft mode on), fetched strings, including any new text fields, carry stega; clean before use. A URL-shaped thumbnail value is skipped by the default filter (section 5). (c) Draft vs published: edits made by an input `onChange` patch the draft; a "Save a copy to Sanity" upload creates a published-type asset document immediately (assets are not drafted), referencing it from the draft document. NOT VERIFIED from docs.
- NOT VERIFIED: whether Studio and the `/api` route share cookies or auth; the route would be unauthenticated unless it checks something. No auth check pattern was found for such a route in this repo; existing `api/live` guards with `env.SANITY_AUTH_TOKEN` as an `internalSecret` (liveProxy.ts) but I did not read how it is used.

## 8. Standards (primary sources)

Source for (a): https://www.w3.org/TR/WCAG22/ (fetched with curl 2026-10-27, text extracted from the section elements).

- 4.1.2 Name, Role, Value (Level A): "For all user interface components (including but not limited to: form elements, links and components generated by scripts), the name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; and notification of changes to these items is available to user agents, including assistive technologies." Note: "This success criterion is primarily for web authors who develop or script their own user interface components. For example, standard HTML controls already meet this success criterion when used according to specification."
- 1.4.3 Contrast (Minimum) (Level AA): "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for the following: Large Text: Large-scale text and images of large-scale text have a contrast ratio of at least 3:1; Incidental: Text or images of text that are part of an inactive user interface component, that are pure decoration, that are not visible to anyone, or that are part of a picture that contains significant other visual content, have no contrast requirement. Logotypes: Text that is part of a logo or brand name has no contrast requirement."
- 1.4.11 Non-text Contrast (Level AA): "The visual presentation of the following have a contrast ratio of at least 3:1 against adjacent color(s): User Interface Components: Visual information required to identify user interface components and states, except for inactive components or where the appearance of the component is determined by the user agent and not modified by the author; Graphical Objects: Parts of graphics required to understand the content, except when a particular presentation of graphics is essential to the information being conveyed."
- 2.5.7 Dragging Movements (Level AA, New in 2.2): "All functionality that uses a dragging movement for operation can be achieved by a single pointer without dragging, unless dragging is essential or the functionality is determined by the user agent and not modified by the author." Note: "This requirement applies to web content that interprets pointer actions (i.e., this does not apply to actions that are required to operate the user agent or assistive technology)."
- 2.5.8 Target Size (Minimum) (Level AA, New): "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when: Spacing: Undersized targets (those less than 24 by 24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target; Equivalent: The function can be achieved through a different control on the same page that meets this criterion; Inline: The target is in a sentence or its size is otherwise constrained by the line-height of non-target text; User Agent Control: The size of the target is determined by the user agent and is not modified by the author; Essential: A particular presentation of the target is essential or is legally required for the information being conveyed."
- 2.4.11 Focus Not Obscured (Minimum) (Level AA, New): "When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content." Note 2: "Content opened by the user may obscure the component receiving focus. If the user can reveal the focused component without advancing the keyboard focus, the component with focus is not considered visually hidden due to author-created content."

(b) fetchpriority. MDN source (mdn/content, files/en-us/web/html/reference/attributes/fetchpriority/index.md, line 16): "This attribute may be applied to {{HTMLElement("img")}}, {{HTMLElement("link")}}, and {{HTMLElement("script")}} elements. It also has an SVG counterpart." Front matter lists `html.elements.img.fetchpriority`, `html.elements.link.fetchpriority`, `html.elements.script.fetchpriority`. `<video>` is not in that list. `<video poster>` (mdn video/index.md:105-106): "`poster` - A URL for an image to be shown while the video is downloading. If this attribute isn't specified, nothing is displayed until the first frame is available, then the first frame is shown as the poster frame." Line 109: "Videos with the `loading="lazy"` attribute set will only download the `poster` resource once the video is near or within the viewport." Note: MDN here lists a `loading` attribute on `<video>` (line 76-91). NOT VERIFIED: any `fetchpriority` equivalent for `poster`; none is listed on the MDN video page I read (I grepped only for `poster`, so absence of `fetchpriority` on that page was not separately grepped). Also not verified against the WHATWG HTML spec text for the fetchpriority attribute.

(c) Baseline status. Source: web-platform-dx/web-features `features/media-session.yml.dist` and `remote-playback.yml.dist` (main branch, fetched via curl).

- Media Session: feature-level `status: baseline: false` with support chrome 73, chrome_android 57, edge 79, firefox 82, safari 15, safari_ios 15. Sub-feature `api.Navigator.mediaSession` alone is `baseline: high` (low date 2021-09-20, high date 2024-03-20); `api.MediaMetadata` and the `MediaSession` members listed as `baseline: false`. Result: NOT Baseline as a whole feature (the feature includes `chapterInfo`/`ChapterInformation` and some action types that are not widely supported). I did not open which exact members hold it back.
- Remote Playback: `status: baseline: false`; support chrome 121, chrome_android 56, edge 121, safari 13.1, safari_ios 13.4; no firefox entry. Not Baseline. MDN pages (api/remote_playback_api, api/media_session_api) carry `browser-compat` front matter only; I did not fetch the rendered MDN pages for their banners.

(d) track kinds. MDN `files/en-us/web/html/reference/elements/track/index.md:51-66`: "`kind` - How the text track is meant to be used. If omitted the default kind is `subtitles`. If the attribute contains an invalid value, it will use `metadata`." Keywords: `subtitles`, `captions`, `descriptions` ("Descriptions summarize the _video_ component of the media resource. They are intended to be synthesized as audio when the visual component is obscured, unavailable, or not usable (e.g., because the user is interacting with the application without a screen while driving, or because the user is blind)."), `chapters` ("Chapter titles are intended to be used when the user is navigating the media resource."), `metadata` ("Tracks used by scripts. Not visible to the user."). Same file: "`src` ... must have the same origin as the document unless the audio or video parent element has a `crossorigin` attribute."
WHATWG HTML spec (https://html.spec.whatwg.org/multipage/media.html, fetched via curl): "Audio descriptions can be embedded in the video stream or in text form using a WebVTT file referenced using the track element and synthesized into speech by the user agent." and "for text tracks whose kind is descriptions, the user agent is making the cues available to the user in a non-visual fashion; and for text tracks whose kind is chapters, the user agent is making available to the user a mechanism by which the user can navigate to any point in the media resource by selecting a chapter".

- NOT VERIFIED: actual browser behavior for `descriptions` and `chapters` tracks. The sources above only say what user agents are intended or required to do; I did not find browser-compat data on whether any shipping browser synthesizes speech for descriptions or shows a chapter UI.

## Items that were not run or could not be checked

- No lint, typegen, build, dev server, or Studio was run. The example in section 1 was not compiled.
- Sanity web docs (sanity.io/docs) were not consulted; every Sanity claim comes from the installed 6.20.0 and 8.11.0 packages.
- next-sanity version actually resolved by the app (13.1.1 vs 13.4.0 in the pnpm store) not checked.
- Provider thumbnail host behavior (hotlinking, referer checks, sizes) not checked; only the Referer header behavior in Node was tested, against httpbin.org.
