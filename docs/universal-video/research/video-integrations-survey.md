# Video integrations survey for a UniversalVideo component (React 19 / Next 16 / Sanity)

Research date: 2026-10-27. Rule applied: only facts seen in a primary source (provider docs, package README/source, live endpoint probe). Anything else says NOT VERIFIED. No em dashes.

Method notes (so you can weigh confidence):
- npm facts come from `npm view <pkg> version license time.modified` run on 2026-10-27.
- media-elements capabilities come from reading the raw source in https://github.com/muxinc/media-elements (main branch, `packages/<name>/<name>.js`). READMEs in that repo are templates and say nothing about per-capability support, so the source is the only reliable evidence.
- Provider doc pages were read via a fetch tool that summarizes pages; where a page 404'd or was a stub I say so. Pages that returned only third-party/forum results are marked "secondary".
- oEmbed endpoints were probed live with curl.

---

## 1. Summary ranking table

Tier definitions: T1 = clean controllable API, worth full support. T2 = basic controls (some gaps). T3 = embed only, document limits. SKIP = not viable for a marketing site.

| # | Candidate | Embed form | JS control | media-elements package (npm) | Sanity input | Tier |
|---|---|---|---|---|---|---|
| 1 | Mux (VOD, signed, live) | HLS `stream.mux.com/{id}.m3u8` | Native media element (`mux-video`) | `@mux/mux-video` 0.31.6 (own element, not in media-elements repo) | `sanity-plugin-mux-input` 5.2.1 (upload) | T1 |
| 2 | Direct file / HLS / DASH (S3, R2, Vercel Blob, any CDN) | direct URL | Native `<video>` + hls.js / dash.js | `hls-video-element` 1.5.12, `dash-video-element` 0.3.3, `shaka-video-element` 0.7.2 | URL string field | T1 |
| 3 | Sanity file assets (video uploaded to Sanity) | direct file URL (`asset->url`) | Native `<video>` | n/a (use plain video) | built in `file` type; `sanity-plugin-media` 6.6.0 | T1 (file only, no ABR) |
| 4 | YouTube | iframe + IFrame API | `playVideo`, `pauseVideo`, `mute`, `seekTo`, `setVolume`, `setPlaybackRate` | `youtube-video-element` 1.9.1 | URL paste | T1 |
| 5 | Vimeo | iframe + player.js | `play`, `pause`, `setMuted`, `setCurrentTime`, `setVolume`, `requestFullscreen`, `enableTextTrack` | `vimeo-video-element` 1.7.4 | URL paste; `sanity-plugin-vimeo` 1.5.5 | T1 |
| 6 | Cloudflare Stream | iframe + SDK, or HLS manifest | `play`, `pause`, props `muted`, `volume`, `currentTime` | `cloudflare-video-element` 1.3.6 | none found on npm | T1 |
| 7 | Bunny Stream | iframe + player.js | `play`, `pause`, `mute`, `setVolume`, `setCurrentTime`, `setPlaybackRate`, `setLoop` | none | none found on npm | T1 (needs adapter) |
| 8 | api.video | iframe + player SDK | `play`, `pause`, `mute`, `seek`, `setCurrentTime`, `requestFullscreen` | none (`@api.video/player-sdk` 1.2.33 is last published 2025-05-22) | none found on npm | T1/T2 (adapter, stale SDK) |
| 9 | Wistia | script (E-v1.js) or iframe | `play`, `pause`, `mute`, `volume`, `time`, `playbackRate` | `wistia-video-element` 1.4.0 | `sanity-plugin-wistia` 1.0.2 (2022, legacy) | T1/T2 |
| 10 | PeerTube | iframe + embed API (`?api=1`) | `play`, `pause`, `seek`, `setVolume`, `setPlaybackRate`, `setCaption` | `peertube-video-element` 1.1.0 | URL paste | T2 (federated, per-instance) |
| 11 | JW Player | script lib + media JSON | full JW API (`play`, `setMute`, `seek`, `setVolume`) | `jwplayer-video-element` 1.3.5 | none found | T2 (account-specific) |
| 12 | Dailymotion | script / iframe (`geo.dailymotion.com/player.html?video=`) | `play`, `pause`, `seek`, `setVolume`, `setFullscreen`, `setSubtitles`, `setPlaybackSpeed` | `dailymotion-video-element` 0.0.1 (2025-07-14, repo field points at muxinc/media-elements but the package is not in that repo's main tree) | URL paste | T2 |
| 13 | Brightcove | script loader / iframe | Video.js API (`play`, `muted`, `currentTime`) | `brightcove-video-element` 0.1.1 (third party, 2023-06-06) | none found | T2 (account-specific) |
| 14 | Vidyard | script (embed-code) | `play`, `pause`, `seek`, `setVolume`, `toggleFullscreen`; no mute method documented | none | none | T2 |
| 15 | Twitch | iframe + embed JS | `play`, `pause`, `seek`, `setMuted`, `setVolume` | `twitch-video-element` 0.2.0 | URL paste | T2 (no playbackRate, `parent` param required) |
| 16 | TikTok | iframe `tiktok.com/player/v1/{id}` + postMessage | `play`, `pause`, `seekTo`, `mute`, `unMute`; volume not supported | `tiktok-video-element` 0.1.2 | URL paste | T2/T3 |
| 17 | Kaltura | script (`KalturaPlayer.setup`) | remote-player `play`, `pause`, `muted`, `volume`, `currentTime`; main player API NOT VERIFIED | none | none | T3 (not verified enough) |
| 18 | Cloudinary video | direct delivery URL or Cloudinary Video Player | self-hosted player has methods; hosted iframe has none | none (`cloudinary-video-player` 4.1.5 is the vendor lib) | `sanity-plugin-cloudinary` 2.1.9 | T1 as direct URL, T3 as iframe |
| 19 | Loom | iframe `useloom.com/embed/{id}`, oEmbed | no JS API documented | none | URL paste | T3 |
| 20 | Streamable | iframe `streamable.com/o/{id}` (via oEmbed) | NOT VERIFIED | none | URL paste | T3 |
| 21 | Rumble | iframe via oEmbed | NOT VERIFIED | none | URL paste | T3 |
| 22 | Spotify (audio/podcast) | iframe + IFrame API | `play`, `pause`, `resume`, `seek`; mute/volume are no-ops in the element | `spotify-audio-element` 1.0.5 | URL paste | T2 (audio) |
| 23 | Facebook video | `fb-video` div + SDK script | play/pause/mute NOT documented on the plugin page | none | URL paste | T3 |
| 24 | Instagram | `instagram_oembed` html + embed.js | only `instgrm.Embeds.process()` documented | none | URL paste | T3 |
| 25 | X / Twitter | oEmbed blockquote + `widgets.js` | none documented | none | URL paste | T3 |
| 26 | LinkedIn | iframe `linkedin.com/embed/feed/update/urn:li:share:...` (secondary sources only) | NOT VERIFIED | none | URL paste | T3 |
| 27 | Google Drive | `/preview` iframe (secondary sources only) | none verified | none | URL paste | SKIP |
| 28 | Dropbox | `raw=1` link (secondary sources only) | n/a (direct file) | none | URL paste | SKIP |
| 29 | Box | Content Preview UI Element needs an auth token | UI Element only | none | none | SKIP |
| 30 | Microsoft Stream / SharePoint | iframe, viewer needs permission (secondary) | none verified | none | none | SKIP |
| 31 | Zoom recordings | not embeddable (secondary) | n/a | none | none | SKIP |
| 32 | Reddit | oEmbed endpoint blocked for non-browser probe; no official embed docs found | n/a | none | none | SKIP |

Other media-elements packages that exist and are useful as building blocks: `castable-video` 1.1.17, `videojs-video-element` 1.4.8, `custom-media-element` 1.4.7, `media-tracks` 0.3.5, `media-chrome` 4.19.4, `super-media-element` (in repo, not queried on npm).

Additional candidates worth knowing (added because they appear in the evidence):
- `react-player` 3.4.0 (MIT, last publish 2025-11-13): wrapper that claims to play "file paths, Mux, YouTube..." per its npm description. Overlaps with your design; not evaluated further.
- `video.js` 10.2.0 (Apache-2.0, 2026-10-22), `shaka-player` 5.3.2, `hls.js` 1.7.3, `dashjs` 5.2.1: engines under the media-elements wrappers.
- player.js (Embedly spec) is the common postMessage protocol behind Bunny Stream; see Bunny entry. This is the one protocol that could give a single adapter for several hosts (Bunny verified; others NOT VERIFIED).

---

## 2. What media-elements already covers (verified in source)

Repo package list (GitHub contents API, main): castable-video, cloudflare-video-element, custom-media-element, dash-video-element, hls-video-element, jwplayer-video-element, media-played-ranges-mixin, media-tracks, peertube-video-element, shaka-video-element, spotify-audio-element, super-media-element, tiktok-video-element, twitch-video-element, videojs-video-element, vimeo-video-element, wistia-video-element, youtube-video-element.
Command: `curl -s https://api.github.com/repos/muxinc/media-elements/contents/packages`

NOT in the repo main tree: Bunny, api.video, Dailymotion, Loom, Vidyard, Brightcove, Kaltura, Streamable, Rumble, Cloudinary, Facebook, Instagram, X, LinkedIn, Drive, Dropbox, Box, Stream, Zoom, Reddit. (`dailymotion-video-element` exists on npm at 0.0.1, maintainer luwes, repository.url muxinc/media-elements, but I found no such package in main.) `brightcove-video-element` 0.1.1 is by a different maintainer (rrisland).

Per-element capability notes read from source (all implement play/pause/muted/volume/currentTime etc. as the HTMLMediaElement surface unless stated):

| Element | Backing API | What source shows |
|---|---|---|
| youtube-video | YouTube IFrame API (loads `https://www.youtube.com/iframe_api`) | `playVideo`, `pauseVideo`, `seekTo`, `mute`/`unMute`, `setVolume`, `setPlaybackRate`, `setLoop`; has `textTracks`; switches to `https://www.youtube-nocookie.com/embed` if `src` contains `-nocookie`; accepts `config` object merged into player params; sets `cc_load_policy:1, rel:0, modestbranding:1, iv_load_policy:3` by default. No `requestFullscreen` match found in a grep. |
| vimeo-video | `@vimeo/player` | play/pause, `setMuted`, `setVolume`, `setCurrentTime`, `setLoop`, `getTextTracks`/`enableTextTrack`/`disableTextTrack`, `requestFullscreen`, ratechange event. `config` object is spread into player options, so `dnt`, `background` etc. can be passed (pass-through verified in code; effect depends on Vimeo plan, see Vimeo). |
| wistia-video | Wistia `E-v1.js`, runs in light DOM, built on `super-media-element` which proxies the real inner `<video>` | `chromeless: !controls`, `silentAutoPlay: 'allow'` when autoplay, `muted: defaultMuted`, `config` spread into Wistia options. `play()` waits for load. |
| cloudflare-video | Cloudflare iframe + `sdk.latest.js` | `play`, `pause`, getters/setters for `autoplay, controls, currentTime, loop, muted, playbackRate, poster, volume`. Poster is passed as iframe param. |
| twitch-video | Twitch iframe embed | getters/setters for `autoplay, controls, currentTime, loop, muted, volume`; adds `parent` param from `location.hostname`. No `playbackRate` anywhere in the file (grep count 0). |
| tiktok-video | `https://www.tiktok.com/player/v1` + postMessage | play, pause, seek, mute/unMute. `volume` setter only logs "Volume control is not supported for TikTok videos." |
| spotify-audio | Spotify IFrame API | play, pause, resume, seek. `muted` getter returns false and setter is a no-op; `volume` getter returns 1 and setter is a no-op. No playbackRate. |
| jwplayer-video | JW cloud library `content.jwplatform.com/libraries/{playerId}.js` + `cdn.jwplayer.com/v2/media/{id}` | `src` must match `jwplayer.com/players/{videoId}-{playerId}`; media JSON fetched, JW `setup()`; controls hidden by CSS class `jw-no-controls`; inner `.jw-video` element proxied. |
| peertube-video | PeerTube embed API (`@peertube/embed-api` from unpkg) | play, pause, seek, setVolume, setPlaybackRate, getResolutions/setResolution, getCaptions/setCaption (exposed as `videoRenditions` and `textTracks`), requestFullscreen on iframe. Mute implemented as `setVolume(0)` with remembered volume. |
| hls / dash / shaka | hls.js / dash.js / Shaka | Wrap a native `<video>`; src is a manifest URL. |
| castable-video | Cast mixin | Chromecast/AirPlay mixin for a video element. |

React note (from source): wistia and jwplayer elements add a delay or light DOM nodes ("Add a small delay here so React doesn't complain about hydration mismatches"); expect extra hydration care for those two.

---

## 3. Per-candidate details

Format per candidate: (1) embed, (2) JS API, (3) muted autoplay / chromeless / gating, (4) poster, (5) privacy, (6) npm element, (7) Sanity, (8) verdict.

### 3.1 Mux (VOD, signed playback, live)
1. HLS: `https://stream.mux.com/{PLAYBACK_ID}.m3u8`. Iframe: `https://player.mux.com/{PLAYBACK_ID}`. Web component: `<mux-player playback-id="...">` and `<mux-video playback-id="...">`. Source: https://www.mux.com/docs/guides/play-your-videos
2. Native media element API via `@mux/mux-video` (HTMLMediaElement-compatible; README documents `playback-id`, `start-time`, `max-resolution`, `min-resolution`, `rendition-order`, `targetlivewindowchange` event and auto-recovery of recoverable errors, useful for live). Source: `npm view @mux/mux-video readme`.
3. Not verified here: Mux-specific autoplay/background behavior (use native `muted autoplay playsinline` on the video element). No plan gating is mentioned on the live-streaming guide, but that guide notes Mux disconnects clients after 12 hours. Source: https://www.mux.com/docs/guides/start-live-streaming
   - Signed playback: RS256 JWT with `sub` (playback id), `aud` (`v` video/captions, `t` thumbnail, `g` gif, `s` storyboard, `d` DRM), `exp` (required), `kid`; optional `playback_restriction_id`. Video URL `https://stream.mux.com/{id}.m3u8?token={JWT}`. Thumbnail `https://image.mux.com/{id}/thumbnail.{format}?token={JWT}`; for signed IDs, thumbnail options (`time`, `width`) go in JWT claims, not the URL. Do not send a token with a public playback id. Source: https://www.mux.com/docs/guides/secure-video-playback
   - Live: same playback ID usage as assets; latency modes standard (~30s), reduced (~10-15s), low (as low as ~5s); live-to-VOD switches the asset URL to on-demand after disconnect plus reconnect window.
4. Poster: `image.mux.com/{id}/thumbnail.{format}` (token needed when signed). The exact public URL form was not shown on the play-your-videos page (it links to "Get images from a video"); the signed form above is verified.
5. Privacy/cookie option: NOT VERIFIED for Mux Data (`mux-embed` 5.18.2 is the monitor SDK; opt-out settings not checked).
6. `@mux/mux-video` 0.31.6 MIT 2026-10-23; `@mux/mux-player` 3.14.1; `@mux/mux-player-react` 3.14.1; `media-chrome` 4.19.4 (published via GitHub Actions trusted publisher).
7. `sanity-plugin-mux-input` 5.2.1 MIT, modified 2026-10-26, peers `sanity ^5 || ^6.0.0-0`, react ^19.2. Adds `mux.video` type; uploads and previews videos; stores a reference to a Mux asset document; token and secret stored as a `mux.apiKey` document (`secrets.mux`); "Enable Signed Urls" option requires an access token with System permissions. Source: `npm view sanity-plugin-mux-input readme`.
8. **TIER 1.** Cleanest path, already in your stack.

### 3.2 Direct files and manifests (S3, R2, Vercel Blob, any CDN, Cloudinary delivery URLs)
1. Direct MP4/WebM URL on native `<video>`; HLS via `hls-video-element`; DASH via `dash-video-element`.
2. Native HTMLMediaElement. Full uniform API for free.
3. Muted autoplay is the native attribute set. No provider gating.
4. Poster must be supplied separately (image field or generated). `sanity-plugin-video-posters` 0.1.1 can generate a poster from a Sanity video file in the browser (see 3.3).
5. No third-party cookies.
6. `hls-video-element` 1.5.12, `dash-video-element` 0.3.3, `shaka-video-element` 0.7.2, all MIT, all published 2026-10-22 (shaka 0.7.2 on 2026-10-22).
7. Plain URL string field. Hosting facts verified:
   - Vercel Blob: available on all plans; public stores give "Anyone with the URL" direct blob URLs; files up to 5 TB; CDN caches blobs up to 1 month by default; docs say content is "Well-suited for content below the fold" and lists videos as a use case; HTTP range-request support is NOT VERIFIED in the page I read. Source: https://vercel.com/docs/vercel-blob
   - Cloudflare R2: r2.dev is "intended for non-production traffic" and rate-limited; production should use a custom domain. CORS and range requests not mentioned on that page. Source: https://developers.cloudflare.com/r2/buckets/public-buckets/
   - S3: not fetched. NOT VERIFIED.
   - Cloudinary: `https://res.cloudinary.com/demo/video/upload/<id>.mp4` delivers MP4; a `.jpg` extension on the same URL returns a frame (default middle frame). `.m3u8` / `sp_auto` URL form NOT VERIFIED on the page I read. Source: https://cloudinary.com/documentation/video_manipulation_and_delivery
8. **TIER 1.** The universal escape hatch. No ABR unless the URL is a manifest.

### 3.3 Sanity file assets
1. Direct file URL, resolved in GROQ with `asset->url`. Source: https://www.sanity.io/docs/studio/file-type
2. Native `<video>`.
3. Docs: "Content Lake treats video assets as files"; no transcoding or streaming by default; the assets page points to the Mux integration, third-party plugins and Media Library (Enterprise) for streaming. CDN URL pattern, size limits and range requests are NOT documented on the pages I read. Source: https://www.sanity.io/docs/content-lake/assets
4. Poster: separate `image` field. `sanity-plugin-video-posters` 0.1.1 (MIT, 2026-10-22) fills an `image` field with a frame from a sibling video `file` field, in the browser, no Function or ffmpeg; peers sanity ^5 || ^6.
5. No third-party cookies.
6. Native.
7. `file` type option `accept` ("video/*" or MIME), `storeOriginalFilename` default true. `sanity-plugin-media` 6.6.0 (MIT, 2026-10-27) can act as a custom asset source for both image and file selection. `sanity-plugin-video-player` 0.3.2 (third-party, 2026-10-08, peers sanity ^6, `sanity-plugin-mux-input ^5`) ships a `videoPlayer` field for Mux or file sources and maps GROQ results to native video props; it does not ship a player.
8. **TIER 1 for small marketing clips, with the caveat that there is no adaptive bitrate.** Recommend a size warning in the Studio.

### 3.4 YouTube
1. iframe `https://www.youtube.com/embed/{id}` or `https://www.youtube-nocookie.com/embed/{id}`; script `https://www.youtube.com/iframe_api`. oEmbed live probe returned an iframe src `https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed`.
2. IFrame Player API: `playVideo`, `pauseVideo`, `stopVideo`, `seekTo`, `mute`, `unMute`, `isMuted`, `setVolume` (0-100), `setPlaybackRate`, `getAvailablePlaybackRates`, `setLoop`, `getCurrentTime`, `getDuration`, `destroy`; events `onReady`, `onStateChange`, `onPlaybackRateChange`, `onError`, `onApiChange`, `onAutoplayBlocked`. Source: https://developers.google.com/youtube/iframe_api_reference
3. Page states most browsers block unmuted autoplay; `onAutoplayBlocked` exists. `controls=0` hides controls. `modestbranding` is "deprecated and has no effect". Since 2018 related videos cannot be disabled; `rel=0` limits them to the same channel. `mute` as a player param was NOT on the parameters page I read (the media-element passes `mute` anyway). No plan gating. Source: https://developers.google.com/youtube/player_parameters
4. Poster: oEmbed `thumbnail_url` (probe returned `https://i.ytimg.com/vi/{id}/hqdefault.jpg`, 480x360), no auth. Endpoint `https://www.youtube.com/oembed?url=...&format=json`.
5. Privacy-enhanced mode: replace the domain with `youtube-nocookie.com`; applies to websites only. Source: https://support.google.com/youtube/answer/171780
6. `youtube-video-element` 1.9.1 MIT 2026-10-22.
7. URL paste (no asset picker needed). `sanity-plugin-youtube-input` 0.2.0 (2023-10-10, peers sanity ^3, needs a Google API key) enriches metadata; likely stale for Studio 5/6.
8. **TIER 1.**

### 3.5 Vimeo
1. iframe `https://player.vimeo.com/video/{id}` (element base constant); player.js SDK. Unlisted videos need the full URL with the `h` parameter.
2. player.js: `play`, `pause`, `setMuted`, `setVolume` (0-1; mobile ignores it), `setCurrentTime`, `setPlaybackRate` (README says PRO and Business), `requestFullscreen`, `enableTextTrack(language, kind?, showing?)`, `getQualities/setQuality` (Plus, PRO, Business); events `play`, `pause`, `volumechange`, `fullscreenchange`, `texttrackchange`, `cuechange`, `qualitychange`. Source: https://github.com/vimeo/player.js
3. Embed params (Vimeo help): `background` (disables controls, loops, autoplays, mutes), `controls` and `quality` both require the video be hosted by a Starter, Standard, Advanced, Plus, Pro, Business, Premium or Enterprise account; `dnt`, `muted`, `autoplay` apply to all videos (no gating). Source: https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-parameters
4. Poster: oEmbed `thumbnail_url` (endpoint listed in providers.json `https://vimeo.com/api/oembed.{format}`; my live probe with a guessed video ID returned 404, so the response shape was not observed). Whether auth is needed: NOT VERIFIED (public videos appear to need none per registry; private/unlisted not tested).
5. `dnt=1`: "blocks the player from collecting session data and analytics, though some essential cookies remain." Same source as 3.
6. `vimeo-video-element` 1.7.4 MIT 2026-10-08; `@vimeo/player` 2.30.4 MIT 2026-04-29.
7. URL paste. `sanity-plugin-vimeo` 1.5.5 (MIT, 2024-05-17, peers sanity ^3, needs access token) fetches Vimeo API metadata and links; likely stale for Studio 5/6.
8. **TIER 1.**

### 3.6 Cloudflare Stream
1. iframe `https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe` (UID or signed token); SDK `https://embed.cloudflarestream.com/embed/sdk.latest.js` then `Stream(iframeEl)`; HLS `https://customer-<CODE>.cloudflarestream.com/<UID>/manifest/video.m3u8`; DASH `.../manifest/video.mpd`. Sources: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/ and https://developers.cloudflare.com/stream/viewing-videos/using-own-player/
2. Player API: methods `play()` (returns Promise), `pause()`; properties `autoplay, buffered, controls, currentTime, defaultTextTrack, duration, ended, letterboxColor, loop, muted, paused, played, preload, primaryColor, volume`; standard media events plus `stream-adstart`, `stream-adend`, `stream-adtimeout`. No `playbackRate` property on the docs page (the media-element still implements get/set `playbackRate`; whether the iframe honors it is NOT VERIFIED). Source: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/
3. Iframe query params `autoplay`, `muted`, `loop`, `controls` (default true), `preload` (default none), `poster`, `letterboxColor`. Docs: "mobile browsers generally do not support this attribute" for autoplay; set `muted` to allow autoplay. Plan gating: NOT VERIFIED.
4. Poster: `https://customer-<CODE>.cloudflarestream.com/<UID>/thumbnails/thumbnail.jpg?time=1s&height=270`; token needed for signed videos (token form NOT VERIFIED; docs link to "Securing your stream"). No oEmbed entry in providers.json.
5. Privacy option: NOT VERIFIED.
6. `cloudflare-video-element` 1.3.6 MIT 2026-10-22. Its README example `src` is `https://watch.videodelivery.net/<uid>` (an older host).
7. No Sanity plugin found on npm (`sanity-plugin-cloudflare-stream` returns 404; search was by guessed names, not exhaustive). Editor would paste a URL or UID; the customer code is a per-site config value.
8. **TIER 1.** Ready element plus HLS fallback.

### 3.7 Bunny Stream
1. iframe `https://player.mediadelivery.net/embed/{video_library_id}/{video_id}`; direct page `https://player.mediadelivery.net/play/{library}/{id}` (existing `iframe.mediadelivery.net` URLs still work per search summary of Bunny docs). Embed params: `autoplay` (default true), `muted`, `loop`, `preload` (default true), `t`, `captions`, `lang`, `playsinline` (default true), `chromecast`, `disableAirPlay`, `showSpeed`, `compactControls`, `rememberPosition`, `rememberSettings`, `levelCap`, `nativeHls`. If embed token auth is enabled the URL needs `token` and `expires`. Source: https://bunny.net/docs/stream/embedding
2. player.js: library `//assets.mediadelivery.net/playerjs/playerjs-latest.min.js`; methods `play, pause, getPaused, mute, unmute, getMuted, setVolume, getVolume, getDuration, setCurrentTime, getCurrentTime, setLoop, getLoop, setPlaybackRate, getPlaybackRate, on, off, supports`; events `ready, progress, timeupdate, play, pause, ended, seeked, playbackratechange, error`. The playback-rate methods exist only in Bunny's hosted build. Source: https://bunny.net/docs/stream/playback-api.md
3. Chromeless: no documented `controls=0` param in the list above (NOT VERIFIED). Muted autoplay via `autoplay=true&muted=true` (doc says pair them). Plan gating: NOT VERIFIED.
4. Poster: oEmbed endpoint `https://video.bunnycdn.com/OEmbed` is in providers.json (scheme `player.mediadelivery.net/*`); probe with a fake ID returned 404, response shape not observed. Thumbnail URL form was NOT on the embed doc page I read. Auth: NOT VERIFIED.
5. Privacy: `rememberSettings=false` stores nothing, "including position" (same doc). Cookie documentation NOT VERIFIED.
6. No media element. Needs a custom adapter over player.js (the methods above map almost one to one onto HTMLMediaElement). Alternatively play the HLS URL directly (HLS URL form NOT VERIFIED from the pages read).
7. No Sanity plugin found on npm (`sanity-plugin-bunny` 404; `@seshuk/payload-storage-bunny` is a Payload plugin, irrelevant). Editor pastes library ID + video ID or a URL.
8. **TIER 1** if you accept writing a ~150 line adapter. CSP note from Bunny docs (search summary): allow the player origin in `frame-src`.

### 3.8 api.video
1. iframe `//embed.api.video/vod/{videoId}` (the only form shown); SDK `new PlayerSdk(target, options)` (npm `@api.video/player-sdk` 1.2.33, MIT? license not queried, last publish 2025-05-22). Source: https://docs.api.video/sdks/player/apivideo-player-sdk
2. Methods: `play, pause, seek, setCurrentTime, setPlaybackRate, setLoop, setAutoplay, mute, unmute, setVolume, requestFullscreen, exitFullscreen, requestPictureInPicture, showSubtitles, hideSubtitles, destroy`; getters `getPaused, getPlaying, getMuted, getDuration, getCurrentTime, getVolume, getLoop, getPlaybackRate, isLiveStream`; events `play, pause, firstplay, ended, seeking, timeupdate, ratechange, qualitychange, ready, error, volumechange, resize, fullscreenchange, ...`. `seek(time)` is relative per a search summary; absolute is `setCurrentTime`.
3. Options: `autoplay`, `muted`, `hideControls` (keeps unmute button if muted), `chromeless`, `loop`, `token` for private videos, `live`. Plan gating: NOT VERIFIED.
4. Poster: not covered on the SDK page (only `hidePoster`). oEmbed not in providers.json.
5. Privacy: NOT VERIFIED.
6. No media element.
7. No Sanity plugin found (`sanity-plugin-api-video` 404).
8. **TIER 2** (rich API, but stale SDK publish, no element, small user base). Upgrade to T1 only if a client uses it.

### 3.9 Wistia
1. Script `https://fast.wistia.com/assets/external/E-v1.js` with container `wistia_embed wistia_async_<hashedId>`; iframe `https://fast.wistia.net/embed/iframe/<id>`. oEmbed `https://fast.wistia.com/oembed.{format}` in providers.json. Source: https://docs.wistia.com/docs/javascript-player-api (page says it is for the "Legacy Vulcan Player"; behavior of the current player API was not verified).
2. Methods `play()`, `pause()`, `time(val)`, `playbackRate(r)`, `mute()`, `unmute()`, `volume(val)`; events via `bind`: `play, pause, end, playbackratechange, timechange, secondchange, seek, mutechange, volumechange, silentplaybackmodechange`. "the `play()` method will never work with the iframe API on mobile". Iframe embeds lack some events.
3. `silentAutoPlay`, `chromeless`, `playButton` used by the media-element (verified in source). The doc page says options are on a separate page that returned 404 for me; plan gating NOT VERIFIED.
4. Poster: oEmbed (registry); auth NOT VERIFIED.
5. Privacy: the API page says nothing on GDPR; NOT VERIFIED.
6. `wistia-video-element` 1.4.0 MIT 2026-05-06.
7. `sanity-plugin-wistia` 1.0.2 (2022-05-17); README targets old `all:part:@sanity/base` (Studio v2). Treat as unusable. URL paste instead.
8. **TIER 1/2.** Good element; note mobile `play()` and light-DOM rendering.

### 3.10 PeerTube
1. iframe `https://<instance>/videos/embed/<uuid>?api=1`. Params `start, stop, controls, controlBar, muted, loop, autoplay, subtitle, playbackRate, p2p, warningTitle, title`. Source: https://docs.joinpeertube.org/api/embed-player
2. Embed API: `ready` (promise), `play()`, `pause()`, `seek(sec)`, `setVolume(0..1)`, `getVolume`, `setPlaybackRate`, `getPlaybackRates`, `getCaptions`, `setCaption(id)`, `setResolution`, `isPlaying`, `getCurrentTime`; events `playbackStatusUpdate` (every 0.5s), `playbackStatusChange`, `resolutionUpdate`, `volumeChange`. No documented `mute()`; the element emulates mute with `setVolume(0)`.
3. `controls=0` removes all controls, mimicking the `controls` attribute; autoplay may be blocked by browsers.
4. Poster: oEmbed exists for `peertube.tv/w/*` in the registry only (instances are per-host; discovery `None`). Generic poster resolution: NOT VERIFIED.
5. P2P toggle via `p2p` param. Other privacy: NOT VERIFIED.
6. `peertube-video-element` 1.1.0 MIT 2026-05-05.
7. URL paste (per-instance domain; needs an instance allowlist).
8. **TIER 2.**

### 3.11 JW Player
1. Cloud-hosted `https://cdn.jwplayer.com/players/{mediaId}-{playerId}.html` form is what the element parses; library `https://content.jwplatform.com/libraries/{playerId}.js`; media JSON `https://cdn.jwplayer.com/v2/media/{mediaId}` (all read from element source).
2. Web API per JW docs (secondary search summary of https://docs.jwplayer.com/players/reference): `play()`, `setMute(state)`, `getMute()`, `setVolume`, `seek(position)`, `getPosition`, `getDuration`; events with `on`/`once`/`off`; calls only after ready. Per-method details not fetched (direct fetch of the reference URL 404'd).
3. Autostart/mute/gating: NOT VERIFIED.
4. Poster: part of the media JSON (shape not inspected). Auth: NOT VERIFIED.
5. Privacy: NOT VERIFIED.
6. `jwplayer-video-element` 1.3.5 MIT 2025-11-25.
7. No Sanity plugin found. URL paste of the player URL.
8. **TIER 2.** Works via element, but requires a JW account/player id; low priority.

### 3.12 Dailymotion
1. Three web embed methods per docs: Player Embed Script, Player Library Script (programmatic), Player iFrame (no JS; `pip`, `first_time_viewable`, `advanced.enable_receive_url_location` unavailable). oEmbed (live probe) returns `<iframe src="https://geo.dailymotion.com/player.html?video=x8jc9mw&" allow="autoplay; fullscreen; picture-in-picture; web-share">`. Source: https://developers.dailymotion.com/sdk/player-sdk/web and https://www.dailymotion.com/services/oembed
2. Methods: `play, pause, seek, setFullscreen, setQuality, setPlaybackSpeed, setSubtitles, setScaleMode, setVolume, updateParams, getSettings, getState, destroy, on, off`. The methods page lists no `setMute`; mute appears to be via `setVolume` (a search result said Android SDK 2.1.2 removed `setMute` and recommends `setVolume(0.0)`; web equivalent NOT VERIFIED). Events: `PLAYER_START, PLAYER_END, VIDEO_PLAY, VIDEO_PAUSE, VIDEO_PLAYING, VIDEO_SEEKSTART, VIDEO_SEEKEND, VIDEO_TIMECHANGE, VIDEO_DURATIONCHANGE, PLAYER_VOLUMECHANGE, PLAYER_PLAYBACKSPEEDCHANGE, VIDEO_SUBTITLESCHANGE, PLAYER_ERROR` and many ad events. Sources: https://developers.dailymotion.com/reference/web-sdk-player-methods and .../web-sdk-player-events.md
3. Runtime params documented: `video, playlist, customConfig, scaleMode, startTime, loop, autoplay`. `mute`, `controls` and privacy params are NOT documented there. Ads/monetization is a core product feature (ad events), so expect ads in embeds.
4. Poster: oEmbed `thumbnail_url` (probe: `https://s2.dmcdn.net/v/.../x720`), no auth.
5. Privacy/cookie option: NOT VERIFIED.
6. `dailymotion-video-element` 0.0.1 (2025-07-14), license field empty in my query, source not found in the repo main tree. Treat as unproven.
7. URL paste. No Sanity plugin checked.
8. **TIER 2.** API is good, element is v0.0.1, ads present.

### 3.13 Brightcove
1. oEmbed `https://oembed.brightcove.com/` for `players.brightcove.net/*/*/index.html?videoId=*` (registry). Script loader npm `@brightcove/player-loader` 1.8.1 (Apache-2.0, 2026-10-26); `@brightcove/react-player-loader` 1.5.1.
2. Brightcove Player is Video.js based: `videojs.getPlayer(id)`, `player.ready()`, `muted()` getter/setter, `currentTime()` getter/setter, `play()`; events follow HTML5 media events (search summary of https://docs.brightcove.com/brightcove-player/1.x/Player.html; direct fetch of the player-api page 404'd).
3-5. Autoplay, gating, privacy: NOT VERIFIED.
6. `brightcove-video-element` 0.1.1 (third party, 2023-06-06, stale). `videojs-video-element` 1.4.8 (MIT, 2026-05-06) in media-elements could wrap a Brightcove player; NOT tested.
7. No Sanity plugin found.
8. **TIER 2.** Enterprise, account-specific; support on demand.

### 3.14 Vidyard
1. `@vidyard/embed-code` 4.3.26 (MIT, 2026-09-28, repo Vidyard/vidyard-player-sdk). oEmbed `https://api.vidyard.com/dashboard/v1.1/oembed` (registry; my probe with a fake URL returned 406 "Invalid content-type", so a `format` or Accept needs care).
2. Methods: `play, pause, resume, seek(sec), scrubbing, setVolume(0..1), toggleFullscreen, enableCaption, disableCaption, currentTime, setPlaybackSpeed, setAudioTrack, playVideoAtIndex`. No mute method documented. Events: `ready, play, pause, beforeSeek, seek, playerComplete, videoComplete, timeupdate (~100ms), volumeChange, metadata`. GDPR: `VidyardV4.api.GDPR.consent()`. Source: https://knowledge.vidyard.com/hc/en-us/articles/360019034753
3. Autoplay/iOS notes: not on that page (a legacy page has a caveat that play does not affect players on iOS, per search summary only).
4. Poster: NOT VERIFIED.
5. Consent: GDPR methods above.
6. No media element. 7. No Sanity plugin found.
8. **TIER 2.** Controls usable; mute via volume 0; mostly B2B.

### 3.15 Kaltura
1. Script `https://cdnapisec.kaltura.com/p/{partnerId}/embedPlaykitJs/uiconf_id/{uiConfId}`, `KalturaPlayer.setup({targetId, provider:{partnerId, uiConfId}, playback:{autoplay:true}})`, `loadMedia({entryId})`. Source: https://developer.kaltura.com/player/web
2. API doc (github kaltura-player-js docs/api.md) lists `play, pause, volume, currentTime, muted, playbackRate` under remote player and `enterFullscreen/exitFullscreen, loadMedia` on KalturaPlayer. The page did not list playback events (NOT VERIFIED). npm `@playkit-js/kaltura-player-js` 3.17.103 (2026-10-18; license not queried).
3-5. NOT VERIFIED. 6. No element. 7. No Sanity plugin found.
8. **TIER 3** (insufficient verification; account-specific).

### 3.16 Twitch
1. iframe `https://player.twitch.tv/?video=v<id>` or `?channel=<name>`; `parent` is required (one per embedding domain); min size 400x300. Source: https://dev.twitch.tv/docs/embed/video-and-clips/
2. Methods `play, pause, seek(sec)` (not for live), `setMuted`, `setVolume(0..1)`, `getCurrentTime` (VOD only); events `READY, PLAY, PAUSE, PLAYING, SEEK, ENDED, ONLINE, OFFLINE, CAPTIONS, PLAYBACK_BLOCKED`. No playback rate.
3. `autoplay` defaults to true but needs size and visibility; mobile needs interaction; `muted` param exists; `PLAYBACK_BLOCKED` fires after unmuted autoplay. Gating: none seen.
4. Poster: no oEmbed (no registry match for twitch in my filter); NOT VERIFIED.
5. Privacy: NOT VERIFIED.
6. `twitch-video-element` 0.2.0 MIT 2026-04-21.
7. URL paste.
8. **TIER 2.**

### 3.17 TikTok
1. iframe `https://www.tiktok.com/player/v1/{post_id}` with params (`controls, progress_bar, play_button, volume_control, fullscreen_button, timestamp, rel, native_context_menu, closed_caption` default on; `loop, autoplay, music_info, description, muted` default off). Source: https://developers.tiktok.com/doc/embed-player
2. postMessage (needs `x-tiktok-player` flag): `play, pause, seekTo, mute, unMute`; events `onPlayerReady, onStateChange, onCurrentTime, onMute, onVolumeChange, onPlayerError`. Volume setting is not a command; the element confirms volume is unsupported.
3. TikTok "may apply usage limits to embedded players on a per-domain basis."
4. Poster: oEmbed `https://www.tiktok.com/oembed?url=...` live probe returned an iframe `https://www.tiktok.com/player/v1/<id>?embed_from=oembed&...&autoplay=1&muted=1` (no thumbnail field in the probed response), no auth.
5. NOT VERIFIED. 6. `tiktok-video-element` 0.1.2 MIT 2025-11-25. 7. URL paste.
8. **TIER 2/3** (vertical aspect, rate limits, no volume).

### 3.18 Spotify
1. IFrame API: `createController`, `loadEntity(uri, preferVideo, startAt)`, `play, pause, resume, togglePlay, restart, seek, destroy`; events `ready, playback_started, playback_update`. Source: https://developer.spotify.com/documentation/embeds/references/iframe-api. oEmbed `https://open.spotify.com/oembed` (registry).
2-3. Page says Safari blocks autoplay; login/preview limits not mentioned (NOT VERIFIED). Mute and volume: the element makes them no-ops.
6. `spotify-audio-element` 1.0.5 MIT 2026-10-22. 7. URL paste.
8. **TIER 2 (audio)**.

### 3.19 Cloudinary video
1. (a) Direct delivery `https://res.cloudinary.com/<cloud>/video/upload/<id>.mp4`; (b) self-hosted Cloudinary Video Player (`cloudinary-video-player` 4.1.5 MIT 2026-10-26); (c) hosted iframe `https://player.cloudinary.com/embed/?cloud_name=...&public_id=...` (camelCase options converted to snake_case). Source: https://cloudinary.com/documentation/video_player_how_to_embed
2. Self-hosted player: `volume()`, `mute()`, `duration()`, `currentTime()`, play/pause/stop/next/previous; events not covered on that page. Hosted iframe: "Methods and events: Not available."
3. Standard HTML5 attributes for autoplay/muted/controls on the video tag. Poster via `poster` attribute or `posterOptions`.
4. Poster: `.jpg` extension on the video URL (default middle frame).
5. Privacy: NOT VERIFIED.
6. No media-elements package.
7. `sanity-plugin-cloudinary` 2.1.9 (MIT, 2026-10-16, peers sanity ^5 || ^6): three plugins (`cloudinaryAssetSourcePlugin`, `cloudinarySchemaPlugin`, `cloudinaryReferencePlugin`); README has a "Video" section stating video assets get a player preview in the Studio and are stored with `resource_type: "video"`, `url`, `secure_url`. The older `sanity-plugin-asset-source-cloudinary` 0.1.2 (2022) is stale.
8. **TIER 1 as direct URL into the file/HLS path; TIER 3 if only the hosted iframe is available.**

### 3.20 Loom
1. iframe `https://www.useloom.com/embed/<id>` per Loom's autoplay help page (also seen as `loom.com/embed/<id>` in search summaries). oEmbed `https://www.loom.com/v1/oembed` is in providers.json (my probe with a made-up share ID returned 404, inconclusive). SDK `@loomhq/loom-embed` 1.7.0 (ISC, 2025-01-29): its docs list an `oembed` method and options `width, height, gifThumbnail`. Sources: https://support.atlassian.com/loom/docs/make-embedded-videos-autoplay-or-play-at-a-specific-time/ and https://developers.loom.com/docs/embed-sdk/api
2. Player JS API: NOT documented (the SDK page says so by omission; I found none).
3. Params documented: `autoplay=1|true`, `t=80s`. Search summary of the other Loom help page adds `muted`, `hide_owner`, `hideEmbedTopBar` (secondary, treat as unverified). Autoplay "may not work on all sites or browsers."
4. Poster: via oEmbed / SDK `gifThumbnail` (shape NOT observed).
5-6. NOT VERIFIED / none. 7. URL paste.
8. **TIER 3.**

### 3.21 Streamable
1. oEmbed `https://api.streamable.com/oembed.json?url=https://streamable.com/moo` (live probe, no auth) returned `<iframe class="streamable-embed" src="https://streamable.com/o/moo" ... width=852 height=480 allowfullscreen>`.
2. JS API: NOT VERIFIED.
4. Poster: oEmbed `thumbnail_url` is a signed CloudFront URL containing `Expires=...&Signature=...`, so it expires and must not be cached long-term (observed in the probe).
8. **TIER 3.**

### 3.22 Rumble
1. oEmbed `https://rumble.com/api/Media/oembed.{format}` in registry; my probe with a fake URL returned 404 "Media not found" (inconclusive). Iframe form `rumble.com/embed/<id>` only from secondary sources.
2-5. NOT VERIFIED (no official docs found).
8. **TIER 3.**

### 3.23 Facebook video
1. `fb-video` div with `data-href` plus the Facebook JS SDK; `embed_html` Graph property is deprecated ("recommend to not use"). The video post must be public. Attributes `data-allowfullscreen`, `data-autoplay` (muted; not on mobile), `data-lazy`, `data-show-captions`. Source: https://developers.facebook.com/docs/plugins/embedded-video-player/
2. JS player methods: NOT documented on that page. 
4. Poster: live probe of `https://graph.facebook.com/v16.0/oembed_video?url=...` returned HTTP 200 without a token, but the `html` is a `<script async src="https://connect.facebook.net/en_US/sdk.js...">` plus div and no thumbnail field. (Facebook docs on whether a token is now required were not read; the probe may change.)
8. **TIER 3.** Script injection means you cannot treat the `html` as an iframe.

### 3.24 Instagram
1. `GET https://graph.facebook.com/v26.0/instagram_oembed?url=<post URL>`; html references `embed.js`; `omitscript=true` to load it yourself; `instgrm.Embeds.process()` is the only JS function documented. Whether an access token or app review is required is NOT stated on the page. Source: https://developers.facebook.com/docs/instagram-platform/oembed
2. No playback control documented. 8. **TIER 3.**

### 3.25 X / Twitter
1. oEmbed `https://publish.twitter.com/oembed?url=...` (live probe followed a 301 and returned `type: rich`, html = `<blockquote class="twitter-tweet">` + `<script async src="https://platform.x.com/widgets.js">`; no auth needed for the probe).
2. No video control API documented (docs page returned HTTP 402 to my fetch). 8. **TIER 3.**

### 3.26 LinkedIn
1. "Embed this post" in the post menu produces an iframe `linkedin.com/embed/feed/update/urn:li:share:...` (height 712 width 504). Only third-party guides found; the post must be public. No official page retrieved. Not in providers.json. 8. **TIER 3** (NOT VERIFIED).

### 3.27 Reddit
Only secondary sources found; Reddit's oEmbed endpoint returned a "Blocked" page to a curl probe with a browser-like UA; official embed docs not retrieved (one fetch was refused by the tool). Source video is DASH with separate audio (secondary). **SKIP.**

### 3.28 Google Drive, Dropbox, Box, Microsoft Stream/SharePoint, Zoom
All found only in secondary sources except Box:
- Drive: `/preview` iframe, needs "Anyone with the link"; resolution cap and throttling claims are third-party. No Drive player JS API found. **SKIP** (no official source found; Drive API docs page I read does not discuss embedding).
- Dropbox: `dl=0` to `raw=1` trick, forum-only, no built-in embed, bandwidth limits cited by a moderator in a forum. The official oEmbed page 404'd. **SKIP.**
- Box: Content Preview UI Element needs a token (OAuth or JWT); the simple iframe "does not support client-side interaction ... play/pause interactivity for videos" (Box docs per search summary https://developer.box.com/guides/embed/ui-elements/preview/). **SKIP.**
- Microsoft Stream on SharePoint: Microsoft replies in forums say public anonymous embed codes are not supported ("We don't support anyone public anonymous embed codes for videos"); embed does not grant permission; 2025 forum still asks for it. Registry lists old `web.microsoftstream.com/oembed` (the classic Stream). **SKIP.**
- Zoom recordings: Zoom dev forum staff say iframing play/share URLs is not supported; use `download_url` and host elsewhere (2019-2021 posts). **SKIP.**

---

## 4. Sanity-side feasibility summary

| Source | Editor input | Plugin (verified on npm) | Notes |
|---|---|---|---|
| Mux | Upload in Studio | `sanity-plugin-mux-input` 5.2.1 | Signed playback supported by plugin option; requires System-permission token |
| Sanity file | Upload / asset picker | built-in `file` type (`accept: video/*`), `sanity-plugin-media` 6.6.0 as asset source | No transcoding. `asset->url` in GROQ |
| Poster for file videos | auto frame | `sanity-plugin-video-posters` 0.1.1 | browser-side |
| Mux or file field with playback props | schema helper | `sanity-plugin-video-player` 0.3.2 (third party) | No player shipped; ignores your UniversalVideo shape unless you adopt it |
| Cloudinary | picker | `sanity-plugin-cloudinary` 2.1.9 | image and video previews |
| YouTube | paste URL | `sanity-plugin-youtube-input` 0.2.0 (2023) | needs Google API key; peers sanity ^3 |
| Vimeo | paste URL or API browse | `sanity-plugin-vimeo` 1.5.5 (2024) | needs access token; peers sanity ^3 |
| Wistia | paste URL | `sanity-plugin-wistia` 1.0.2 (2022) | Studio v2 era; unusable |
| Cloudflare Stream, Bunny, api.video, JW, Brightcove, generic oEmbed | paste URL / id | none found with the exact names tried (E404); `npm search "sanity oembed"` returned nothing relevant | search not exhaustive |

Conclusion: URL paste is the only uniform editor experience across providers. Asset-picker/upload exists for Mux (official-grade), Sanity files, and Cloudinary.

---

## 5. oEmbed as a generic fallback

Facts (primary: https://oembed.com/):
- Consumer request: `url` (required), `maxwidth`, `maxheight`, `format` (json or xml).
- Response types: `photo`, `video`, `link`, `rich`. A `video` response requires `html`, `width`, `height`.
- Discovery: providers may advertise with `<link rel="alternate" type="application/json+oembed">` (or `text/xml+oembed`) in the page head, or equivalent Link headers.
- Registry: https://oembed.com/providers.json had 393 providers on 2026-10-27; each endpoint carries `schemes` and a `discovery` flag. Relevant entries found: YouTube, Vimeo, Dailymotion, Loom, Wistia, Vidyard, Brightcove, bunny.net, Streamable, Rumble, PeerTube.TV, Spotify, TikTok, Facebook (oembed_video), Instagram, Twitter, Reddit, Microsoft Stream, SoundCloud, TED. My filter found NO entries for Cloudflare Stream, Cloudinary, Mux, JW Player, Kaltura, Twitch, Dropbox, Box, Google Drive, Zoom, LinkedIn.
- Spec security text (verbatim): "When a consumer displays HTML (as with video embeds), there's a vector for XSS attacks from the provider." and "it is recommended that consumers display the HTML in an `iframe`, hosted from another domain." and "This ensures that the HTML cannot access cookies from the consumer domain." Also: filter URL schemes to `http`, `https` or `mailto`.

What the live probes showed (2026-10-27) that matters for design:
- Iframe-based html: YouTube, Dailymotion, Streamable, TikTok.
- Script-based html (cannot be treated as an iframe): Facebook (`sdk.js` + div), X (`widgets.js` + blockquote), Instagram (embed.js per docs).
- Thumbnails can be signed and expiring (Streamable).
- Some endpoints reject non-browser clients (Reddit "Blocked") or need specific Accept/format (Vidyard 406).
- None of the oEmbed responses give a control API. oEmbed gives you an iframe and a thumbnail, never play/pause.

Assessment (my recommendation, grounded in the above; sandbox semantics themselves are not re-verified here, check MDN before shipping):
- Sound as a Tier 3 fallback ("embed only, no controller, no facade events") for unknown providers.
- Do not inject the returned `html`. Parse it server-side, extract a single `<iframe src>` only, and render your own iframe element. Reject any response with a `<script>`, or fall back to a link card (this excludes X, Facebook, Instagram widgets).
- Allowlist: restrict by the registry `schemes` and by an explicit host allowlist per site, https only. This also is the SSRF guard for any server-side `url` resolution; discovery (fetching arbitrary pages to find `<link>` tags) widens SSRF risk, so use registry endpoints only and skip discovery.
- Render with `sandbox`, `referrerpolicy`, `loading="lazy"`, explicit `allow`, and a CSP `frame-src` list; the oEmbed spec's own rationale is that the iframe origin differs from yours. Provider iframes often need `allow-scripts allow-same-origin` to function; that combination is only safe because the origin is cross-site.
- Cache `title`, `thumbnail_url` at edit time (Sanity document) and proxy/re-host the thumbnail, since provider thumbnail URLs can expire (Streamable).
- Uniform controller: not available. The component should report `capabilities: none` for oEmbed sources and no-op the controller methods.

---

## 6. Recommended tiering for UniversalVideo

- T1 (full controller, ship): Mux, native file/HLS/DASH (includes Sanity files, S3/R2/Blob/Cloudinary direct URLs), YouTube, Vimeo, Cloudflare Stream, Bunny Stream (write a player.js adapter), Wistia.
- T2 (basic controls, add on demand): api.video, PeerTube, JW Player, Dailymotion, Brightcove, Vidyard, Twitch, TikTok, Spotify.
- T3 (embed only, document limits): Loom, Streamable, Rumble, Facebook, Instagram, X, LinkedIn, Kaltura, plus oEmbed generic fallback.
- SKIP: Google Drive, Dropbox, Box, Microsoft Stream/SharePoint, Zoom, Reddit.

Open items I could not verify (NOT VERIFIED): Cloudflare/Bunny/api.video/Wistia/JW/Brightcove plan gating and cookie options; Mux Data privacy opt-out; Bunny HLS and thumbnail URL forms; Cloudinary `.m3u8` URL form; Sanity file CDN URL form, size limits and range support; Vercel Blob and S3 range support; Rumble, LinkedIn, Reddit, Google Drive official docs; Dropbox official docs; Kaltura playback events and Brightcove method signatures (reference pages 404'd or were summarized); `dailymotion-video-element` license and source.

---

## 7. Sources

media-elements and npm
- https://github.com/muxinc/media-elements (packages list: `https://api.github.com/repos/muxinc/media-elements/contents/packages`; source files `https://raw.githubusercontent.com/muxinc/media-elements/main/packages/<name>/<name>.js`)
- npm registry via `npm view <pkg> version license time.modified readme repository.url peerDependencies` for: youtube-video-element, vimeo-video-element, wistia-video-element, spotify-audio-element, twitch-video-element, tiktok-video-element, jwplayer-video-element, videojs-video-element, hls-video-element, dash-video-element, shaka-video-element, peertube-video-element, cloudflare-video-element, dailymotion-video-element, brightcove-video-element, castable-video, custom-media-element, media-chrome, media-tracks, @mux/mux-video, @mux/mux-player, @mux/mux-player-react, mux-embed, @api.video/player-sdk, @vidyard/embed-code, @loomhq/loom-embed, @brightcove/player-loader, @playkit-js/kaltura-player-js, cloudinary-video-player, react-player, video.js, hls.js, dashjs, shaka-player, @vimeo/player, sanity-plugin-mux-input, sanity-plugin-video-player, sanity-plugin-video-posters, sanity-plugin-media, sanity-plugin-cloudinary, sanity-plugin-vimeo, sanity-plugin-youtube-input, sanity-plugin-wistia, sanity-plugin-asset-source-cloudinary

oEmbed
- https://oembed.com/ and https://oembed.com/providers.json
- Live probes: https://api.streamable.com/oembed.json, https://www.youtube.com/oembed, https://www.dailymotion.com/services/oembed, https://www.tiktok.com/oembed, https://graph.facebook.com/v16.0/oembed_video, https://publish.twitter.com/oembed

Provider docs
- Cloudflare: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/ , .../using-the-player-api/ , .../using-own-player/ ; R2: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Bunny: https://bunny.net/docs/stream/embedding , https://bunny.net/docs/stream/playback-api.md
- api.video: https://docs.api.video/sdks/player/apivideo-player-sdk
- Dailymotion: https://developers.dailymotion.com/sdk/player-sdk/web , https://developers.dailymotion.com/reference/web-sdk-player-methods , .../web-sdk-player-events.md , .../web-sdk-player-runtime-parameters.md
- Loom: https://developers.loom.com/docs/embed-sdk/api , https://support.atlassian.com/loom/docs/make-embedded-videos-autoplay-or-play-at-a-specific-time/
- Vidyard: https://knowledge.vidyard.com/hc/en-us/articles/360019034753
- Kaltura: https://developer.kaltura.com/player/web
- PeerTube: https://docs.joinpeertube.org/api/embed-player
- Mux: https://www.mux.com/docs/guides/secure-video-playback , .../play-your-videos , .../start-live-streaming
- YouTube: https://developers.google.com/youtube/iframe_api_reference , https://developers.google.com/youtube/player_parameters , https://support.google.com/youtube/answer/171780
- Vimeo: https://github.com/vimeo/player.js , https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-parameters , https://developer.vimeo.com/api/oembed/videos
- Wistia: https://docs.wistia.com/docs/javascript-player-api
- Twitch: https://dev.twitch.tv/docs/embed/video-and-clips/
- TikTok: https://developers.tiktok.com/doc/embed-player
- Spotify: https://developer.spotify.com/documentation/embeds/references/iframe-api
- Cloudinary: https://cloudinary.com/documentation/video_player_how_to_embed , https://cloudinary.com/documentation/video_manipulation_and_delivery
- Facebook: https://developers.facebook.com/docs/plugins/embedded-video-player/ ; Instagram: https://developers.facebook.com/docs/instagram-platform/oembed
- Sanity: https://www.sanity.io/docs/content-lake/assets , https://www.sanity.io/docs/studio/file-type
- Vercel Blob: https://vercel.com/docs/vercel-blob

Secondary (not primary, used only where flagged): search summaries for JW Player (https://docs.jwplayer.com/players/reference), Brightcove (https://docs.brightcove.com/brightcove-player/1.x/Player.html), Box (https://developer.box.com/guides/embed/ui-elements/preview/), Zoom dev forum (https://devforum.zoom.us/t/embed-cloud-recording-s-url-via-iframe-doesnt-seem-to-work/44561), Microsoft Tech Community threads, Dropbox forum threads, Google Drive third-party posts, LinkedIn third-party guides, Reddit third-party threads.
