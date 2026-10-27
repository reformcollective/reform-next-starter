# Video poster copy: verification report (2026-10-27)

Caveat on method: provider pages were fetched through a summarizing fetch tool, so "quotes" below are the fragments it returned from the page, not a raw dump. Where it returned paraphrase I say so. Nothing here is legal advice.

## PART 1: Provider terms

### YouTube

Sources: https://developers.google.com/youtube/terms/api-services-terms-of-service ; https://developers.google.com/youtube/terms/developer-policies ; https://developers.google.com/youtube/terms/required-minimum-functionality ; https://www.youtube.com/t/terms ; https://developers.google.com/youtube/terms/branding-guidelines

(1) Storing a copy of a thumbnail

- Verified (API data in general, Developer Policies III.E.4): "API Clients may store all other types of Authorized Data not identified in section (III.E.4.b)" and must keep it "for no longer than 30 calendar days." Also III.E.4.d: "API Clients may temporarily store limited amounts of Non-Authorized Data for as long as is necessary." Also III.E intro: "you and your API Clients have no further permissions or rights to API Data, including to temporarily stored API Data." Also III.E.4.g: "you must then delete it as soon as possible and within 7 calendar days."
- Verified: the Developer Policies fetch returned no sentence that names "thumbnail image storage" specifically. Thumbnails are mentioned only in III.F.2.a ("playlists, thumbnails, and YouTube players" must identify YouTube as the source) and III.E.4.i (players collect data "to render the video thumbnail and title, determine playability and content restrictions").
- NOT VERIFIED: whether a thumbnail URL/image from oEmbed or i.ytimg.com counts as "API Data", "Authorized Data" or "Non-Authorized Data". No fetched page classifies it.
- Verified (API ToS 16.3): "no rights or licenses are granted to reproduce or distribute audiovisual content" and "or make audiovisual content available in any manner other than through the use of the YouTube API Services." (Fragmented quote as returned.) Whether a thumbnail is "audiovisual content" is NOT VERIFIED.
- Verified (API ToS 19.5): "THE CONTENT PROVIDED AS PART OF API DATA INCLUDES VIDEOS, AUDIO, GRAPHICS, PHOTOS, TEXT."
- Verified (general YouTube Terms of Service, Permissions and Restrictions item 1): users may not "access, reproduce, download, distribute, transmit, broadcast, display, sell, license, alter, modify" content except "(a) as expressly authorized by the Service; or (b) with prior written permission from YouTube". The same page: "You may also show YouTube videos through the embeddable YouTube player."

(2) "The video thumbnail must not be altered"

- NOT VERIFIED / NOT FOUND. The exact sentence does not appear on the Developer Policies page, the Required Minimum Functionality page, the API ToS, or the Branding Guidelines as returned by the fetch tool. A web search for the exact phrase found no page containing it. I could not determine what it is about.
- Closest verified text: Required Minimum Functionality, "Autoplay and scripted playbacks": "Any YouTube thumbnail that initiates a playback must be at least 120 pixels wide and 70 pixels tall." Developer Policies I.4: "modify, interfere with, replace, or otherwise disable any functionality, data, or content made available." Developer Policies III.C.5: "must not modify or replace the text, images, information, or other content of, the search results." Developer Policies I.6: "modify, build upon, or block any portion or functionality of a YouTube player." Branding Guidelines: "You also cannot change YouTube branding images or remove, obstruct, distort, or alter any element of a YouTube trademark." (branding, not thumbnails.)
- So (b) for YouTube: no verified sentence either permits or forbids resizing/re-encoding a thumbnail; the only on-point resizing text is the 120x70 minimum for thumbnails that initiate playback.

(3) oEmbed vs API terms

- Verified: neither the API ToS nor the Developer Policies contains the word "oEmbed" (fetch results: "The page contains no mention of oEmbed" and "oEmbed: No matches").
- NOT VERIFIED: whether oEmbed usage (no API key, https://www.youtube.com/oembed) is governed by the API ToS or the general YouTube Terms of Service. The API ToS defines "YouTube API Services" as "(i) the YouTube API services (e.g., YouTube Data API service..." (truncated) and I did not see oEmbed listed.

(d) Attribution: Verified, Developer Policies III.F.2.a (above) requires identifying YouTube as the source for any API Client feature that displays "playlists, thumbnails, and YouTube players". Whether it applies to oEmbed: NOT VERIFIED.
(e) Time limit: Verified, 30 calendar days for "other types of Authorized Data" (III.E.4.c) and 30-day re-verification for III.E.4.b data (quotes above), applicable to API Data. Applicability to oEmbed thumbnails: NOT VERIFIED.

### Vimeo

Sources: https://vimeo.com/terms ; https://vimeo.com/legal/service-terms/api (redirect target of developer.vimeo.com/guidelines/terms)

- (a) Verified, Terms of Service 5.4 prohibits: "Access, download, reproduce, redistribute, frame, mirror, create derivative works from" unless the Service expressly authorizes it or Vimeo gives prior written permission. Also prohibits scraping "using any automated means (such as robots, botnets, or scrapers)" except through Vimeo's APIs under the API License Addendum. Whether a thumbnail from oEmbed is "authorized": NOT VERIFIED.
- API terms (vimeo.com/legal/service-terms/api): Verified, §4.1 allows storing Vimeo Content "as necessary for your Application's legitimate operation"; §8 requires deleting Vimeo Content on termination. The fetch said the page "doesn't address" thumbnails, oEmbed or caching explicitly.
- (b) Verified: ToS 5.4 "Remove or modify any logo, watermark, or notice of proprietary rights" prohibited. API §3.4: "You may not modify, obscure, or interfere with any element of our embeddable video player". Resizing/re-encoding thumbnails: NOT VERIFIED (not addressed).
- (c) oEmbed vs API: NOT VERIFIED (oEmbed not mentioned in either page).
- (d) Attribution: Verified only that "You may not state or imply that we endorse, sponsor, or certify your Application." (§3.3). No link-back requirement found.
- (e) Time limit: Verified only token/credential limits ("You may not retain, refresh, or extend tokens beyond their authorized duration." §5.4). No time limit on content storage found.
- Note: fetch tool read the API terms section numbers from a summary; direct page read recommended before relying on them.

### Wistia

- Both https://wistia.com/terms-of-service and https://wistia.com/legal/terms-of-use returned HTTP 404; https://wistia.com/oembed also 404. NOT VERIFIED for (a) to (e). Nothing was learned from a Wistia primary source.

### Spotify

Sources: https://developer.spotify.com/terms ; https://developer.spotify.com/documentation/design

- (a) Verified, Developer Terms IV.3.2: "Do not locally cache any Spotify Content, except as strictly necessary to enhance the performance of your SDA" (permitted only for metadata, cover art and Conditional Downloads, per the fetch summary). IV.3.1: "you may not store, aggregate or create compilations or databases of Spotify Content" unless strictly necessary to operate your SDA; "Do not store Spotify Content indefinitely." Also IV.2.3(b) prohibits facilitating "stream ripping" or other ways to make permanent copies. Whether the Developer Terms apply to oEmbed (open.spotify.com/oembed) use: NOT VERIFIED (the page "does not mention oEmbed").
- (b) Verified, IV.2.2(b) prohibits "modifying, editing, altering, creating derivative works" of Spotify Content, with the exception: "You may adjust the size of metadata or cover art as necessary." Re-encoding format: NOT VERIFIED. Design guidelines: "Don't crop the artwork in any way." "Don't animate or distort it in any way." "This includes applying overlays and blurring." "You may only use the artwork provided by Spotify."
- (c) oEmbed vs API: NOT VERIFIED.
- (d) Verified (design guidelines): "you must always attribute content from Spotify with the logo." and "it must always link back to the Spotify Service."
- (e) Verified: "Do not store Spotify Content indefinitely." (no numeric limit for general content); Appendix A 5(c) "within five (5) days" applies to Spotify Personal Data on account disconnect.

### TikTok

Sources: https://www.tiktok.com/legal/page/global/terms-of-service/en (first 100000 of 185447 chars read) ; https://developers.tiktok.com/doc/embed-videos

- (a) Verified (US ToS section 7): TikTok Content "may not be downloaded, copied, reproduced, distributed" without prior written consent (as summarized by the fetch tool). Thumbnails and oEmbed are not mentioned in the portion read.
- Embed doc: Verified, "Programmatically, you may convert a TikTok's video URL into embedded video markup by using the oEmbed API." The page did not address thumbnail_url, caching or storage. The TikTok Developer Terms of Service (linked from that page) were not fetched: NOT VERIFIED for (b) to (e).

### Twitch

- https://www.twitch.com/legal/developer-agreement redirected to https://legal.twitch.com/legal/developer-agreement; the fetch returned only navigation/footer, no agreement body. NOT VERIFIED for (a) to (e). Twitch has no documented oEmbed endpoint verified here either.

## PART 2: Sanity technical facts

### 2.1 Custom inputs, patching, useFormValue

- Verified (https://www.sanity.io/docs/studio/form-components): custom components are configured "in your root studio configuration and plugins via `form.components`, and on individual schema types via the `components` property." Example shows `input: MyInput`. Recommends `props.renderDefault(props)`; "if a component in the chain doesn't call `props.renderDefault(props)`, "the chain breaks."
- Verified (https://www.sanity.io/docs/studio/form-components-reference): "onChange (input components): "Callback to update the field value. Accepts a PatchEvent, a FormPatch, or an array of patches."" and "value: The current value of the field."
- NOT VERIFIED from docs: `set(...)` usage, `PatchEvent.from(...)` examples, and `useFormValue` semantics. The pages fetched (form-components, custom-input-components, form-api-reference, form-components-reference) did not cover them. studio-hooks returned 404 style no content for these.
- Verified (installed package): `useClient`, `useFormValue` and `PatchEvent` are exported from /Users/davidcampbell/Documents/nextapps/reform-next-starter/node_modules/sanity/lib/index.d.ts (name occurrences in the export list). Signatures not extracted.

### 2.2 Asset upload with client.assets.upload and `source`

- Verified (installed @sanity/client 8.11.0, node_modules/@sanity/client/dist/types-Bolhz2XV.d.ts line ~10850 `interface UploadClientConfig`): options include `preserveFilename`, `filename`, `contentType`, `extract?: AssetMetadataType[]`, `label`, `title`, `description`, `creditLine`, and
  `source?: { id: string; name: string; url?: string }` documented as "Source data (when the asset is from an external service)", with `id`: "The (u)id of the asset within the source, i.e. 'i-f323r1E'", `name`: "The name of the source, i.e. 'unsplash'", `url`: "A url to where to find the asset, or get more info about it in the source".
- Verified (node_modules/@sanity/client/dist/index.js line 1363): `source && !isMediaLibrary && (query.sourceId = source.id, query.sourceName = source.name, query.sourceUrl = source.url)`. So `source` is sent as sourceId/sourceName/sourceUrl query params.
- Verified (HTTP reference https://www.sanity.io/docs/http-reference/assets): "sourceName: The name of the source if the asset is from an external service. Requires `sourceId`." "sourceId: The ID of the asset within the external source. Required when `sourceName` is set..." "sourceUrl: The URL of the asset within the external source. Ignored without `sourceName`." and "sourceUrl is attribution metadata, not the URL to fetch." The fetch summary stated these record where an asset came from.
- Verified (https://www.sanity.io/docs/content-lake/assets): asset `source` field "Added by a third-party integration, which sets `source.name` to its own name."
- Whether `source` is "the documented way to record provenance": Verified only that it is a documented optional upload parameter intended for assets from an external service. The word "provenance" is not used in anything I read. Using `source` for a provider thumbnail: this fits the stated purpose but no doc says so specifically (NOT VERIFIED for that exact use).
- Verified (HTTP reference) response 200: `document` with `_id`, `_rev`, `_createdAt`, `_updatedAt`, `_type` (`sanity.imageAsset`), `url`, `path`, `size`, `mimeType`, `assetId`, `extension`, `originalFilename`, `sha1hash`, `metadata` (`_type` `sanity.imageMetadata`, `dimensions` width/height/aspectRatio).
- Image field value shape `{_type:'image', asset:{_type:'reference', _ref: asset._id}}`: NOT VERIFIED from a fetched Sanity doc. It matches the repo's `ImageField` type in library/sanity/assetMetadata.ts (`asset?: SanityImageAssetReference`, `_type: "image"`), which is a generated-type fact, not a doc quote.
- client README (https://raw.githubusercontent.com/sanity-io/client/main/README.md, first 100000 of 102034 chars) says: "Assets can be uploaded using the `client.assets.upload(...)` method." Browser example uses `{contentType: 'image/png', filename: 'someText.png'}`. README does not explain `source`.
- `useClient({apiVersion})` requirement: NOT VERIFIED from docs (studio-hooks fetch gave nothing).

### 2.3 Default extracted metadata and how to request it

- Verified (content-lake/assets): "Included by default: Placeholders (lqip, blurHash) and color palette information." Dimensions and transparency (hasAlpha, isOpaque) always included; exif and location optional. "Your schema defines which metadata is included in the asset document."
- Verified (HTTP reference): `meta` param: "Array of metadata to extract from asset." default `["palette","lqip","blurhash","thumbhash"]`.
- Verified (installed client): `type AssetMetadataType = 'location' | 'exif' | 'image' | 'palette' | 'lqip' | 'blurhash' | 'thumbhash' | 'none'`; client option name is `extract`. README example: `{extract: ['palette', 'location']}` with comment "// Extract palette of colors as well as GPS location from exif".
- NOT VERIFIED: the mapping from client `extract` to the HTTP `meta` param was not read in code (line 1355 area builds `meta`; not confirmed to be derived from `extract`).
- NOT VERIFIED: the `groq` projection route for requesting metadata.

### 2.4 Sanity restriction on uploading images you do not own

- NOT VERIFIED. The assets page "doesn't address" it. The only related text is about access: dataset assets are public on the CDN even in private datasets. Sanity's general Terms of Service were not fetched.

### 2.5 Image URL resize/re-encode (https://www.sanity.io/docs/image-url)

- Verified: "Set auto=format to automatically return an image in the most optimized format supported by the browser"; format chosen from the Accept header; for non-browser clients use `fm`. `w`: "Width of the image in pixels. Scales the image to be that wide." "Small images get scaled up to the width or height you specify. To avoid this use `&fit=max`." `fit` values: clip, crop, fill, fillmax, max, scale, min. "Sanity will cache the result in the global CDN". `q` defaults to 75 for JPG and WebP. "AVIF transformations are generated asynchronously," so early requests may get WebP or JPG/PNG.
- Note: the page describes URL parameters, not the `@sanity/image-url` builder API (`.auto('format')` not documented there).

### 2.6 This repo

- library/sanity/reusables.tsx lines 328 to 378: `video` object has `sourceType` (string list: mux, youtube, vimeo, wistia, spotify, twitch, tiktok, url), `url` (type url), `muxVideo` (mux.video, hidden unless sourceType is mux), and `posterImage = universalImage({ name: "posterImage", title: "Poster Image", description: "Optional. If set, this image is shown in place of the video's default thumbnail.", withAlt: false, hidden: ({parent}) => parent?.sourceType !== "mux" })`. Verified: today posterImage is hidden for every non-mux source.
- `universalImage` (line 91): `type: "image"` with sub-fields `alt` (text), `willHaveAlt` (hidden readonly string, list ["true"] or ["false"]), `options: { aiAssist..., hotspot: true, ...}`.
- library/sanity/assetMetadata.ts lines 121 to 133: `imageProjection = { ..., "data": { lqip: asset->metadata.lqip, dominantColor: asset->metadata.palette.dominant.background, originalFilename: asset->originalFilename, size: asset->size, extension: asset->extension, url: asset->url, originalAspectRatio: asset->metadata.dimensions.aspectRatio, aspectRatio: (crop-adjusted) }}` and `videoProjection = { ..., muxVideo ..., posterImage ${imageProjection} }`. `ImageField` type (lines 8 to 22) includes `asset`, `hotspot`, `crop`, `alt`, `willHaveAlt`, `_type:"image"`, `data`.
- What a Studio upload must match (inference from the above, Verified as code facts): `posterImage` value of `_type:"image"` with `asset._ref` to a `sanity.imageAsset`; the projection needs `asset->metadata.lqip` and `asset->metadata.palette.dominant.background` and `metadata.dimensions`, so lqip and palette must be extracted (default extraction per 2.3). `alt` is not required (`withAlt:false`). The field `hidden` rule would need changing for non-mux sources (not done, read-only task).
- Versions (Verified, package.json): sanity 6.20.0, @sanity/client 8.11.0, next-sanity 13.4.0. `useClient` is in the `sanity` exports (see 2.1). `@sanity/client` is installed at the top level of node_modules.

### 2.7 Next 16 Route Handlers (node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md and 03-api-reference/03-file-conventions/route.md)

- Verified: "Route Handlers allow you to create custom request handlers for a given route using the Web Request and Response APIs." Supported methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.
- Verified: server fetch and JSON return example: `const res = await fetch('https://data.mongodb-api.com/...', {...}); const data = await res.json(); return Response.json({ data })`.
- Verified: "Route Handlers are not cached by default." GET can opt in to caching with `export const dynamic = 'force-static'`.
- Verified: request body reading via `await request.json()` and `await request.formData()`; `return new Response(stream)` with a `ReadableStream`. A raw binary example (arrayBuffer/blob) was not found in those two files: returning binary data via `new Response(body, { headers })` is NOT VERIFIED from a doc example, though `new Response(...)` and streams are shown.
- Verified: CORS headers can be set per handler ("You can set CORS headers for a specific Route Handler using the standard Web API methods"). Whether same-origin Studio at /studio needs CORS: NOT VERIFIED (not stated in docs read).
- Verified: a `route.js` cannot coexist with `page.js` at the same route; `app/api/route.js` beside `app/page.js` is valid.

## Sources

- https://developers.google.com/youtube/terms/api-services-terms-of-service
- https://developers.google.com/youtube/terms/developer-policies
- https://developers.google.com/youtube/terms/required-minimum-functionality
- https://developers.google.com/youtube/terms/branding-guidelines
- https://www.youtube.com/t/terms
- https://vimeo.com/terms
- https://vimeo.com/legal/service-terms/api
- https://developer.spotify.com/terms
- https://developer.spotify.com/documentation/design
- https://www.tiktok.com/legal/page/global/terms-of-service/en
- https://developers.tiktok.com/doc/embed-videos
- https://legal.twitch.com/legal/developer-agreement (no body returned)
- https://wistia.com/terms-of-service, https://wistia.com/legal/terms-of-use, https://wistia.com/oembed (all 404)
- https://www.sanity.io/docs/studio/form-components
- https://www.sanity.io/docs/studio/form-components-reference
- https://www.sanity.io/docs/http-reference/assets
- https://www.sanity.io/docs/content-lake/assets
- https://www.sanity.io/docs/image-url
- https://raw.githubusercontent.com/sanity-io/client/main/README.md
- /Users/davidcampbell/Documents/nextapps/reform-next-starter/node_modules/@sanity/client/dist/types-Bolhz2XV.d.ts (line ~10850), index.js (line 1363)
- /Users/davidcampbell/Documents/nextapps/reform-next-starter/node_modules/sanity/lib/index.d.ts
- /Users/davidcampbell/Documents/nextapps/reform-next-starter/library/sanity/reusables.tsx, library/sanity/assetMetadata.ts
- /Users/davidcampbell/Documents/nextapps/reform-next-starter/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md, 03-api-reference/03-file-conventions/route.md
