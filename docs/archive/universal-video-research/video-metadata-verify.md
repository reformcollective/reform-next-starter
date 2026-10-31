# Video metadata fetch verification (live requests, 2026-10-27, via curl from a server-like client)

Legend: OK = verified live. NOT VERIFIED = not tested live. CORS column = Access-Control-Allow-Origin seen when sending `Origin: https://example.com`.

## YouTube (test id dQw4w9WgXcQ)

| field        | available keyless?  | source                                                                                                         | notes                                                                                          |
| ------------ | ------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| name         | yes                 | oEmbed `title`                                                                                                 | OK                                                                                             |
| thumbnailUrl | yes                 | oEmbed `thumbnail_url` (hqdefault 480x360) or `https://i.ytimg.com/vi/{id}/maxresdefault.jpg` (200, ACAO `*`)  | maxres is not guaranteed for every video: NOT VERIFIED for low-res uploads                     |
| description  | only via watch page | `<meta itemprop="description">` / `og:description`                                                             | text is truncated in og:description; itemprop version looked fuller but was not length-checked |
| duration     | only via watch page | `<meta itemprop="duration" content="PT3M34S">` (ISO 8601 already); also `"lengthSeconds":"213"` in player JSON | OK                                                                                             |
| uploadDate   | only via watch page | `<meta itemprop="uploadDate" content="2009-10-24T23:57:33-07:00">`, also `datePublished`, JSON `"uploadDate"`  | OK                                                                                             |
| embedUrl     | derivable           | `https://www.youtube.com/embed/{id}` (og:video:url shows same)                                                 | no request needed                                                                              |
| contentUrl   | no                  | YouTube exposes no file URL                                                                                    | omit; Google says use embedUrl if contentUrl unavailable                                       |

Requests:

- oEmbed: `GET https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json` -> 200, `access-control-allow-origin: https://example.com` (echoes Origin, `vary: Origin`). Browser-callable. Snippet: `{"title":"Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)","author_name":"Rick Astley","thumbnail_url":"https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg","html":"<iframe ... src=\"https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed\" ...>"}` (no description, duration or date in oEmbed).
- Watch page: `GET https://www.youtube.com/watch?v=dQw4w9WgXcQ` with UA `Mozilla/5.0` -> 200, 1.38 MB; with UA `curl` -> also 200, 1.38 MB, same `itemprop="duration"`. No consent interstitial from this (US) IP (`consent` count 0); EU IPs NOT VERIFIED and may get consent.youtube.com redirect. No `access-control-allow-origin` header on the watch page, so browser/Studio cannot fetch it cross-origin: it must go through a server route. Server fetch works, but it is HTML scraping, not an API: fragile, and YouTube ToS permission NOT VERIFIED (did not fetch ToS). Page has no `ld+json` script; data is in `<meta itemprop>` tags (grep found them) and inline player JSON.
- Keyed alternative: YouTube Data API v3 `videos.list?part=snippet,contentDetails` needs an API key (NOT VERIFIED live, no key available).

## Vimeo

Working video: **1084537 (Big Buck Bunny)**. IDs 76979871 and 148751763 both return 404 (also with UA header, and with 22439234 returning 200, so those two are removed/private/not embeddable, not a request-form problem).

- Request (both forms work): `GET https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F1084537` (and unencoded `url=https://vimeo.com/1084537`) -> 200, `access-control-allow-origin: *`, `access-control-allow-headers: X-Requested-With`. Browser-callable.
- Verified response (truncated): `{"type":"video","provider_name":"Vimeo","title":"Big Buck Bunny","author_name":"Blender","html":"<iframe src=\"https:\/\/player.vimeo.com\/video\/1084537?app_id=122963\" ...>","width":640,"height":360,"duration":597,"description":"Big Buck Bunny tells the story of a giant rabbit ...","thumbnail_url":"https:\/\/i.vimeocdn.com\/video\/20963649-...-d_640?region=us","thumbnail_width":640,"thumbnail_height":360,"upload_date":"2008-05-29 05:08:02","video_id":1084537}`
  | field | available keyless | |---|---|
  | name | yes `title` |
  | description | yes `description` |
  | duration | yes `duration` in seconds (597) -> convert to PT9M57S |
  | uploadDate | yes `upload_date` "2008-05-29 05:08:02" (no timezone; must normalize to ISO, timezone unknown, NOT VERIFIED which zone) |
  | thumbnailUrl | yes `thumbnail_url` (640 wide; `_640` suffix can be changed, size variants NOT VERIFIED) |
  | embedUrl | yes, parse `src` from `html` or build `https://player.vimeo.com/video/{id}` |
  | contentUrl | no (needs Vimeo API token + PRO/download access) |
- Player config `https://player.vimeo.com/video/1084537/config` -> 403 (with or without Referer). `https://player.vimeo.com/video/1084537` embed page -> 401 from curl. vimeo.com watch page -> 200 (11.8 KB) but no `ld+json`; only og:title/og:description meta. Not useful; oEmbed already provides everything.

## Wistia (test media e4a27b971d on home.wistia.com)

- oEmbed: `GET https://fast.wistia.com/oembed?url=https%3A%2F%2Fhome.wistia.com%2Fmedias%2Fe4a27b971d` -> 200, ACAO `*` (also with Origin). Returns `title` "Brendan - Make It Clap", `thumbnail_url` (960x540 jpg), `duration` 16.51 (seconds), `html` iframe `src="https://fast.wistia.net/embed/iframe/e4a27b971d"`. No description, no upload date.
- Media JSON: `GET https://fast.wistia.com/embed/medias/e4a27b971d.json` -> 200, ACAO `*`. Has `media.name`, `media.duration` 16.51, `media.createdAt` 1343234864 (unix seconds -> uploadDate), `media.seoDescription` "a Behind The Scenes @Wistia video", `media.assets[]` with `original`/`hd_mp4_video` etc. each with `url` (public mp4 deliveries, so contentUrl feasible, `public:true`), `still_image` asset. All keyless, browser-callable. Caveat: undocumented endpoint, NOT VERIFIED as a supported API; `seoDescription` may be empty for many videos.

## Cloudflare Stream (Cloudflare demo video, customer-f33zs165nr7gyfy4 / 6b9e68b07dfee8cc2d116e4c51d6a957)

- Thumbnail: `GET {base}/thumbnails/thumbnail.jpg` -> 200 image/jpeg, ACAO `*`.
- HLS: `{base}/manifest/video.m3u8` -> 200, ACAO `*`; DASH `{base}/manifest/video.mpd` contains `mediaPresentationDuration="PT30S"` (ISO 8601 duration, keyless; fetchable cross-origin presumably since same CDN, ACAO on mpd NOT VERIFIED).
- embedUrl: `{base}/iframe` pattern (NOT VERIFIED live; did not request). `{base}/lifecycle` returns 200 JSON `{"isInput":false,"videoUID":...,"live":false,"status":"disconnected"...}` with no duration/title.
- name, description, uploadDate: NOT available keyless (need Stream API token: `GET /accounts/{id}/stream/{uid}`, NOT VERIFIED). No public oEmbed found (`iframe.videodelivery.net/oembed` -> 500). Must be entered by editor or stored at upload time.
- Note: the Cloudflare/Mux/Wistia customer subdomain differs per account, so editor must supply it.

## Loom / Streamable (brief)

- Loom: `https://www.loom.com/v1/oembed?url=...` returned 404 for my guessed share id (id was made up, so NOT VERIFIED for a real video); response has ACAO `*`. Loom oEmbed is documented to return title/duration/thumbnail, NOT VERIFIED here.
- Streamable: `GET https://api.streamable.com/oembed.json?url=https://streamable.com/moo` -> 200; ACAO echoes Origin and `access-control-allow-credentials: true`; returns html, thumbnail_url, title (fields beyond that not inspected; duration/date NOT VERIFIED).

## Mux

- Installed: `sanity-plugin-mux-input` 5.2.0 (`node_modules/sanity-plugin-mux-input`, types in `dist/index.d.ts`). Document `mux.videoAsset` stores: `_createdAt`, `_updatedAt`, `status`, `assetId`, `playbackId`, `filename`, `thumbTime`, and `data?: PartialDeep<MuxAsset>`. `MuxAsset` includes `created_at` (string, unix seconds per the type comment), `status`, `duration` (number, seconds), `aspect_ratio` ("16:9" template string), `max_stored_resolution`, `playback_ids[]`, `tracks[]` (video/audio/text tracks), `static_renditions.files[]` (mp4 width/height/name when mp4_support enabled), `passthrough`. So in Studio, duration, created date, aspect ratio and playbackId are available with no network call. `data` is Partial, so treat each as possibly undefined.
- Public endpoints (test playback id a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M, public policy): `https://stream.mux.com/{id}.m3u8` 200 ACAO `*`; `https://image.mux.com/{id}/thumbnail.jpg` 200 ACAO `*`; `https://image.mux.com/{id}/storyboard.json` returns `"duration":23.857` (keyless duration fallback). MP4 contentUrl `https://stream.mux.com/{id}/{rendition}.mp4` only exists if static renditions enabled: NOT VERIFIED live. Signed playback policy IDs need a signing key: NOT VERIFIED.
- Mux has no oEmbed that I tested (NOT VERIFIED). name/description are not in Mux; use `filename` or the Sanity document's own fields.
- embedUrl for Mux: `https://player.mux.com/{playbackId}` (NOT VERIFIED live, did not request).

## Plain file URLs

- HEAD `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` -> 200, `content-type: video/mp4`, `content-length: 1128375`, `last-modified: Fri, 17 Oct 2025 10:23:20 GMT`, `accept-ranges: bytes`, ACAO `*`. So content-type/size/last-modified (usable as a weak uploadDate guess) readable only if CORS allows; otherwise a same-origin server route is needed.
- HEAD on `commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` -> 403 (bucket blocks it), ACAO `*`. So availability varies per host.
- Duration: not in headers. Client side: create `<video preload="metadata">` and read `video.duration` on `loadedmetadata` (works cross-origin for metadata without CORS for playback; this is standard HTMLMediaElement behavior, NOT tested live here as there is no browser). Server side: needs parsing the mp4 `moov`/`mvhd` box via range request (NOT VERIFIED).
- Sanity file asset: `cdn.sanity.io` HEAD on bare path -> 404; a real asset URL NOT VERIFIED. Sanity file assets store `size`, `mimeType`, `_createdAt` on the asset doc but no duration (NOT VERIFIED here).

## CORS summary (browser direct vs needs proxy)

| endpoint                                                                                                                                                                                                                                                                              | direct from browser/Studio?                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| YouTube oEmbed                                                                                                                                                                                                                                                                        | yes (echoes Origin)                                                     |
| YouTube watch page                                                                                                                                                                                                                                                                    | NO, no ACAO; use server route                                           |
| i.ytimg.com thumbnails                                                                                                                                                                                                                                                                | yes (ACAO `*`), only needed as URL anyway                               |
| Vimeo oEmbed                                                                                                                                                                                                                                                                          | yes (ACAO `*`)                                                          |
| Vimeo player config/page                                                                                                                                                                                                                                                              | no (403/401), not needed                                                |
| Wistia oEmbed + embed/medias JSON                                                                                                                                                                                                                                                     | yes (ACAO `*`)                                                          |
| Cloudflare Stream manifest/thumbnail                                                                                                                                                                                                                                                  | yes (ACAO `*`)                                                          |
| Mux stream/image/storyboard                                                                                                                                                                                                                                                           | yes (ACAO `*`)                                                          |
| Streamable oEmbed                                                                                                                                                                                                                                                                     | yes (echoes Origin, allow-credentials true)                             |
| Loom oEmbed                                                                                                                                                                                                                                                                           | header ACAO `*` seen on a 404 response; success response NOT VERIFIED   |
| Plain files                                                                                                                                                                                                                                                                           | host dependent; MDN sample yes, Google sample bucket header yes but 403 |
| Practical design: a single same-origin route handler that does the fetches avoids per-host CORS risk and is required for YouTube description/duration/uploadDate. Studio runs on a different origin if embedded Studio is at `/studio` same origin, then no CORS issue for the route. |

## Google VideoObject requirements (fetched https://developers.google.com/search/docs/appearance/structured-data/video, 200)

Quoted text:

- "Required properties": `name` ("The title of the video."), `thumbnailUrl` ("A URL pointing to the video's unique thumbnail image file."), `uploadDate` ("The date and time the video was first published, in ISO 8601 format. We recommend that you provide timezone information; otherwise, we will default to the timezone used by Googlebot.").
- "Recommended properties": `contentUrl` ("We recommend that your provide the contentUrl property, if possible. This is the most effective way for Google to fetch your video content files. If contentUrl isn't available, provide embedUrl as an alternative."), `creator`/`author` (+ `creator.name`, `creator.url`), `description` ("HTML tags are ignored."), `duration` ("in ISO 8601 format. For example, PT00H30M5S represents a duration of "thirty minutes and five seconds"."), `embedUrl` ("A URL pointing to a player for the specific video."), `expires`, `hasPart` (Clip), `ineligibleRegion` and others (list truncated in my fetch after `ineligibleRegion`, remaining ones NOT VERIFIED).
- Implication: name, thumbnailUrl, uploadDate are required, and uploadDate has no keyless source for Cloudflare, Mux (use asset created_at, which is upload time not publish time) or arbitrary files. Editor must be able to override every generated field.

## Global Privacy Control

- Spec: W3C GPC (https://w3c.github.io/gpc/): "This document defines a signal, transmitted over HTTP and through the DOM, that conveys a person's request to websites and services to not sell or share their personal information with third parties." Spec maturity status text (Draft vs CR) NOT VERIFIED (page grep failed).
- MDN `Navigator.globalPrivacyControl`: "Experimental: This is an experimental technology". `true` if the user explicitly does not provide consent; `false` if granted or no preference. "The value of the property reflects that of the Sec-GPC HTTP header." Header: "Sec-GPC: <preference>", value `1` means preference not to share/sell; otherwise header not sent.
- Browser support from MDN browser-compat-data (live, unpkg data.json): `navigator.globalPrivacyControl` Chrome false, Chrome Android false, Edge false, Opera false, Safari false (truncated output showed safari `version_added: false`), Firefox 120 (opt-in via Website Privacy Preference, or `privacy.globalprivacycontrol.enabled`), Firefox Android 122. The `Sec-GPC` header entry showed the same Firefox 120/122 values and false for Chrome/Edge; Safari for header not fully read. BCD flags it `experimental: true, standard_track: true`.
- Brave, DuckDuckGo and extension-based support: NOT VERIFIED (not in BCD output I read). Because Chrome/Safari do not expose the DOM property natively, treat GPC as best effort: honor it when present (server `Sec-GPC: 1` header or `navigator.globalPrivacyControl === true`), never rely on it as the only consent mechanism.
