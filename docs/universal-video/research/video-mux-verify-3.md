# Mux playback feature verification (round 3)

Date of checks: 2026-10-27. Assets: P = DS00Spx1CV902MCtPj5WknGlR102V5HFkDe (Big Buck Bunny style, 1920x1080, 134.4 s, 60000/1001 fps, untagged), D = MECFZgEm102d01XMx5ME1A28pAe34Z02eSL (674x674 demo, tagged bt709/tv).
Docs source: Mux publishes every guide as raw markdown at `https://www.mux.com/docs/guides/<slug>.md` (index: `https://www.mux.com/llms.txt`; docs.mux.com/llms.txt is 404). Source source: muxinc/elements cloned at HEAD (Oct 23 2026): `@mux/mux-video` 0.31.6, `@mux/playback-core` 0.36.1 (npm latest confirmed 0.31.6), deps `media-tracks ~0.3.5`, `castable-video ~1.1.17`, `custom-media-element ~1.4.7`, hls.js ~1.7.0.
Legend: LIVE = request I ran; DOC = text fetched from mux.com docs; SRC = read in elements source; NOT VERIFIED = could not check.

## 0. Corrections to the premise

- `placeholder`, `default-duration`, `nohotkeys`/`hotkeys`, `playbackrates` (no hyphen), `thumbnail-time`, `thumbnail-token`, `storyboard-token`, `storyboard-src`, `default-hidden-captions`, `forward/backward-seek-offset`, `no-volume-pref`, `theme` are attributes of `<mux-player>` (SRC mux-player/src/base.ts `PlayerAttributes`), NOT of `<mux-video>`. `<mux-video>` has no such attributes. They map to media-chrome UI (`placeholdersrc` on `media-poster-image`, `defaultduration` on time display, hotkeys). Since we want the media-chrome-free element, we must re-implement these in our own component.
- `<mux-video>` own attribute list (SRC mux-video/src/base.ts `Attributes`): beacon-collection-domain, custom-domain, debug, disable-tracking, disable-cookies, disable-pseudo-ended, max-reconnect-retries, drm-token, playback-token, env-key, max-resolution, min-resolution, max-auto-resolution, rendition-order, program-start-time, program-end-time, asset-start-time, asset-end-time, metadata-url, playback-id, player-software-name/version, player-init-time, prefer-cmcd, prefer-playback, start-time, stream-type, target-live-window, live-edge-offset, type, logo, cap-rendition-to-player-size, initial-bandwidth-estimate-kbps, initial-estimate-segments, min-preload-segments. Plus `metadata-*` (e.g. `metadata-video-title`) and native attributes from custom-media-element: autopictureinpicture, disablepictureinpicture, disableremoteplayback, autoplay, controls, controlslist, crossorigin, loop, muted, playsinline, poster, preload, src (SRC node_modules custom-media-element@1.4.7 dist).
- JS-only on mux-video (no attribute): `tokens` object ({playback, drm, thumbnail, storyboard}), `metadata`, `addChapters()/chapters/activeChapter`, `addCuePoints()`, `errorTranslator`, `_hlsConfig`, `extraSourceParams` (via toMuxVideoURL).

## 1. Storyboard

All LIVE 200, GET and HEAD, both assets P and D:
- `https://image.mux.com/<id>/storyboard.png` image/png (P: 1420x1600 = 5 cols x 10 rows of 284x160 tiles, 2,525,150 bytes)
- `.../storyboard.jpg` and `.../storyboard.webp` also 200 (jpg is the default format referenced from VTT/JSON)
- `.../storyboard.vtt` text/vtt, 6251 bytes. Cue example (LIVE): `00:00:00.000 --> 00:00:02.686` then `https://image.mux.com/<id>/storyboard.jpg#xywh=0,0,284,160`
- `.../storyboard.json` application/json (LIVE): `{"url":".../storyboard.jpg","tile_width":284,"tile_height":160,"duration":134.418,"tiles":[{"start":0.000,"x":0,"y":0},{"start":2.686,"x":284,"y":0},...]}` 50 tiles for 134 s (DOC: 50 tiles under 15 min, 100 above).
- `?format=webp|jpg|png` on `.vtt` rewrites the image URL inside cues (LIVE: `storyboard.vtt?format=webp` -> `.../storyboard.webp#xywh=...`). DOC: "By default, this request will generate a jpg for the storyboard image. If you'd like to change the format to webp, you can do so by adding ?format=webp".
- `?width=640` on storyboard is ignored (LIVE: same 1420x1600). Tile size is derived from aspect ratio (DOC example 256x160; P is 284x160; D is square-ish).
- Roku: `?roku_trick_play=true` on the m3u8 adds `#EXT-X-IMAGE-STREAM-INF:BANDWIDTH=40000,RESOLUTION=284x160,CODECS="jpeg",URI=".../storyboard.m3u8?..."` (LIVE). DOC: iOS/Android use an HLS I-frame playlist; Mux says generating those "is on Mux's roadmap" (DOC create-timeline-hover-previews).
- CORS: `access-control-allow-origin: *`, OPTIONS allows GET/HEAD/OPTIONS, headers `*` (LIVE). DOC says to add `crossorigin` to the video tag for storyboard/text-track access.
- Why earlier 404: I could not reproduce. Forms that DO 404 (LIVE): wrong host `stream.mux.com/<id>/storyboard.vtt`; lowercased playback ID (`{"error":{"code":5,"message":"Invalid Playback ID"}}`); `<id>.m3u8/storyboard.png`; bare `/storyboard` (no extension, Varnish "404 Invalid Path"); `storyboard.gif`. Most likely the earlier test used one of these (wrong host, case-mangled ID, or missing extension).
- Mux Player usage (SRC mux-player/src/helpers.ts): `https://image.mux.com/<id>/storyboard.vtt?format=webp` (+`token`, `program_start_time/end_time`); with a token it requires JWT `aud === 's'`.
- Our component should: add `<track kind="metadata" label="thumbnails" src=".../storyboard.vtt?format=webp" default>` (needs crossorigin) or fetch storyboard.json and do our own sprite math (no VTT parsing needed).

## 2. Thumbnails (image.mux.com/<id>/thumbnail.<ext>)

Formats LIVE: `.jpg`/`.jpeg` 200 image/jpeg, `.png` 200, `.webp` 200 (all 1920x1080). `.avif` 404 (HTML "404 Invalid Path"), `.gif` 404 (use `animated.gif`). DOC lists only png|jpg|webp. There is no `format` query for thumbnails; the extension is the format.

Params (DOC table; each LIVE tested on P):
- `time` float seconds. Default = asset `thumbnail_time` if set, else middle of video (DOC set-a-default-thumbnail: "Mux picks a frame from the middle of the video"; `thumbnail_time` can only be PATCHed on a ready asset). LIVE: `time=500` (beyond 134.4 s) -> 200, identical bytes to `time=134.4` (clamped to end). `time=-1` -> 200 (clamped, not an error).
- `width` int32: LIVE `width=320` -> 320x180 (aspect preserved). `width=99999` -> 400 `{"error":{"code":3,"message":"Invalid width: 99999"}}` (limit not documented).
- `height` int32: LIVE `height=100` -> 178x100.
- `fit_mode` values (LIVE with width=320&height=320): `preserve` -> 320x180 (default behaviour), `stretch` -> 320x320, `crop` -> 320x320 (center crop), `smartcrop` -> 320x320, `pad` -> 320x320 (black letterbox). Invalid -> 400 `{"error":{"code":3,"message":"Unrecognized fit-mode: bogus"}}`. DOC: stretch/crop/smartcrop/pad require both width and height.
- `flip_v`, `flip_h` booleans (LIVE: both -> bytes identical to `rotate=180`; dimensions unchanged). Note param names are `flip_v`/`flip_h`, not `flip`.
- `rotate` clockwise, DOC valid 90/180/270. LIVE: 90 -> 1080x1920, 180 -> 1920x1080, `rotate=45` -> 200 but dimensions unchanged (not rejected, behaviour undocumented).
- `latest=true`: live streams only. LIVE on VOD: 400 `{"error":{"code":3,"message":"Latest only works with live streams"}}`. DOC: refreshed every 10 s.
- Unknown params are silently ignored (LIVE `foo=1` -> 200, and 21 colour-ish names all returned byte-identical output, see section 12).
- Rate limit DOC: "default limit of 1 thumbnail and 1 GIF for every 10 seconds of duration per asset. For assets under 100 seconds in duration, the limit is 10 thumbnails and 10 GIFs." I requested 25 distinct `time=` values on a 134 s asset (limit would be ~13) and all returned 200, so I could not observe enforcement (likely counts uncached distinct transforms; NOT VERIFIED where it triggers).
- Caching headers LIVE: `cache-control: max-age=604800`, `access-control-allow-origin: *`, served via Fastly (`x-cache: HIT`).
- `http HEAD` works; no Set-Cookie on image or stream hosts (LIVE).

### Signed URLs for images
- DOC (secure-video-playback): audiences `v` video/subtitles, `t` thumbnail, `g` gif, `s` storyboard, `d` DRM license. "For Playback IDs that use a signed policy, the thumbnail options must be specified in the JWT claims ... simply include the `width` and `time` keys in the JWT claims." "After the parameters are signed ... the resulting signed URL should only contain the `token` parameter." Bad example given: `.../thumbnail.jpg?time=25&token={token}`. So yes: `time` (and width, height, fit_mode, rotate, flip_*, and playback modifiers like `default_subtitles_lang`, `redundant_streams`, `roku_trick_play`, `max_resolution`, `min_resolution`, `rendition_order`) must be in the JWT claims body, and the URL carries only `token`.
- SRC corroborates: mux-player `getPosterURLFromPlaybackId` has comment "thumbnailTime is not supported when using a signedURL/token. Remove under these cases" and returns nothing if the token `aud` is not `t`. mux-video `toMuxVideoURL` deletes every query param except `token` when a token exists.
- LIVE on signed IDs (bos2bPV3qbFgpVPaQ900Xd5UcdM6WXTmz02WZSz01nJ00tY from elements tests): m3u8, thumbnail, storyboard.vtt and low.mp4 with no token -> 403 `{"error":{"messages":["Not Authorized"],"type":"not_authorized"}}` (image host uses `{"error":{"code":7,"message":"Not Authorized"}}`). With garbage `token=abc.def.ghi` the image host returns an HTML page "403 Expired".
- LIVE on a PUBLIC id with a token: stream m3u8 -> 400, thumbnail -> 403. DOC: "If you include a `token=` query parameter for a `public` playback ID, the URL will fail. This is intentional". So our component must only send tokens for signed IDs.
- NOT VERIFIED live: successful signed requests and whether `time` in the query alongside a token errors (no signing key available). Treat DOC as authority.

## 3. Animated GIF / WebP

`https://image.mux.com/<id>/animated.gif` and `animated.webp` (LIVE 200 for both, image/gif GIF89a 320x180 default; image/webp).
Params (DOC + LIVE): `start` (default 0), `end` (default start+5), max total duration 10 s (LIVE `start=0&end=20` -> 400 `Invalid duration, must be less than 10: 20.000000`), min 250 ms (DOC), `width` default 320 max 640 (LIVE width=1000 -> 400 `Invalid width: 1000`), `height` max 640 (LIVE `height=100` -> 178x100), `fps` default 15 max 30 (LIVE fps=30 and fps=10 accepted). Sizes LIVE: `start=2&end=6` gif 977 KB vs webp 162 KB; `width=200&fps=10` gif 293 KB vs webp 60 KB. Prefer webp. Signed: audience `g`.
No `animated.avif`. No fit_mode/flip/rotate for animated (DOC lists only start,end,width,height,fps).

## 4. Chapters and thumbnail tracks

- Chapters: no Mux-hosted chapters in the HLS manifest or image API. In `<mux-video>` they are a JS API: `addChapters([{startTime, endTime?, value}])`, `chapters`, `activeChapter`, `chapterchange` event (SRC base.ts + README events). DOC player-advanced-usage: "Both chapters and cue points will be removed if you unload the media or change the current playback ID". playback-core/src/chapters.ts also parses Apple-JSON chapter metadata (`start-time`, `titles[].language`) from in-stream metadata (SRC). Mux Robots (`robots-generate-chapters`, DOC index) can generate chapters via API; not fetched.
- Cue points: `addCuePoints`, `cuepointchange` event (SRC/README).
- "Thumbnail track": it is the storyboard as a `kind=metadata label=thumbnails` text track (section 1).

## 5. `placeholder`, `default-duration` (mux-player only)

- `placeholder`: DOC (player-customize-look-and-feel): "While the poster image loads, Mux Player will display the contents of the `placeholder=` attribute. Consider using a Data URL". Helper: `createBlurUp(playbackId, {time})` from `@mux/blurhash` returns `{blurDataURL, aspectRatio}` (DOC). SRC: wired to `media-poster-image placeholdersrc`. Not in `<mux-video>`. For us: implement our own blur placeholder (we could generate a tiny `thumbnail.webp?width=16` blur at build time/in Sanity).
- `default-duration` (SRC mux-player, number): used by media-chrome time display before metadata loads. Not meaningful without media-chrome.
- `thumbnail-time`: DOC set-a-default-thumbnail "only available if you're NOT using Signed URLs". DOC: "When `start-time` is provided, it will also be used for the `thumbnail-time` if no `thumbnail-time` is explicitly provided" (mux-player).
- Mux Player's default poster is `thumbnail.webp` (SRC `getPosterURLFromPlaybackId`), so it inherits the colour behaviour in section 12.

## 6. Captions / text tracks

- DOC add-subtitles-to-your-videos: add at asset creation as `inputs` entries `{"url", "type":"text", "text_type":"subtitles", "closed_captions": false|true, "language_code":"en", "name":"English"}` (SRT or WebVTT; "There's no limit on the number of tracks"), or later via Create Asset Track API once asset is `ready`. "Mux videos include subtitles with HLS manifest".
- Auto-generated (DOC): `generated_subtitles: [{language_code, name}]` inside the video input at creation, Whisper-based. Stable: en, es, it, pt, de, fr, auto. Beta: pl, ru, nl, ca, tr, sv, and more (list truncated in my fetch, NOT fully read). Transcript: `https://stream.mux.com/{PLAYBACK_ID}/text/{TRACK_ID}.txt` (plain text) or `.vtt` (DOC); signed: `?token={JWT}`. TRACK_ID comes from the Mux API (not discoverable from public manifest alone), so NOT VERIFIED live.
- LIVE manifest of public ID ihZa7qP1zY8oyLSQW9TS602VgwQvNdyIvlk9LInEGU2s (from elements tests): 
  `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="sub1",CHARACTERISTICS="public.accessibility.transcribes-spoken-dialog,public.accessibility.describes-music-and-sound",NAME="English",AUTOSELECT=YES,DEFAULT=NO,FORCED=NO,LANGUAGE="en",URI=".../subtitles.m3u8?..."` plus Swedish (sv) and Arabic (ar); each variant has `SUBTITLES="sub1"`. The subtitle playlist is HLS VOD of 30 s WebVTT segments (`#EXTINF:30,` -> `.../v1/subtitle/<token>/0.vtt`).
- `default_subtitles_lang` modifier (LIVE on that ID): `=sv` sets `DEFAULT=YES` on sv; `=sv-SE` also selects sv (closest match); `=fr` (not present) -> all DEFAULT=NO. DOC: "If there's no exact language match, the closest match of the same language is selected." DOC: "Video players play the default text track for autoplaying videos even when muted." With signed URLs it must be in the JWT.
- Other public manifests: 23s11nz72DsoN657h4314PjKKjsF2JG33eBQQt6B95I, VcmKA6aqzIzlg3MayLJDnbF55kX00mds028Z65QxvBYaA and qP5Eb2cj7MrNnoxBGz012pbZkMHqpIcrKMzd7ykGr01gM each have 1 English subtitles track. P and D have none (`EXT-X-MEDIA` count 0).
- In `<mux-video>`: hls.js is created with `renderTextTracksNatively: false` (SRC) and tracks surface through `video.textTracks` (media-tracks polyfill); Safari native playback shows native tracks. Our component must expose a track menu itself. `default-hidden-captions` is a mux-player attribute.

## 7. Multiple audio tracks

- DOC add-alternate-audio-tracks: set primary track `language_code`/`name` at creation, add alternates via Create Asset Track API (`type:"audio"`, `language_code`, optional `name`; asset must be `ready`; M4A/WAV/MP3 ok). "When the alternate audio track has been processed, Mux will automatically add it to the HLS playback URL."
- LIVE manifest of ihZa7qP1zY8oyLSQW9TS602VgwQvNdyIvlk9LInEGU2s: `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud1",NAME="Default",AUTOSELECT=YES,DEFAULT=YES` (muxed in video), `NAME="Spanish",LANGUAGE="es",URI=...`, `NAME="Commentary",LANGUAGE="en",URI=...`; variants carry `AUDIO="aud1"`. v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM has a single separate audio group `audio-hi-0`.
- In `<mux-video>`: via `video.audioTracks` (media-tracks polyfill, SRC dep `media-tracks`); `AudioTrackList.enabled` toggles. Native Safari supports `audioTracks` natively.

## 8. Rendition control (HLS modifiers)

DOC modify-playback-behavior table + LIVE on P (source 1080p; ladder 1920x1080, 1280x720, 960x540, 640x360, 480x270):
- `max_resolution` values 270p,360p,480p,540p,720p,1080p,1440p,2160p. LIVE `720p` -> 720,540,360,270 (no 1080). `480p` -> 360 and 270 only (so Mux matches by short side/height tier, 640x360 passes a "480p" cap). `2160p` -> all (source is 1080p). Invalid `999p` -> 400 `{"error":{"messages":["Unable to parse max_resolution"],"type":"invalid_parameters"}}`. DOC: unavailable value is clamped to the nearest available.
- `min_resolution` LIVE `720p` -> 1080 and 720 only. `min=1080p&max=1080p` -> single 1080 rendition.
- `rendition_order=desc` only valid value (LIVE `asc` -> 400 `Unable to parse rendition order`). DOC: by default the first listed rendition is one of the middle ones; `desc` lists highest first so players start at highest.
- `redundant_streams=true` doubles each variant with a `cdn=cloudflare` twin (LIVE; first was `cdn=fastly`).
- `default_subtitles_lang`, `roku_trick_play`, `asset_start_time`/`asset_end_time` (relative instant clip, LIVE 200 and alters rendition URLs), `program_start_time`/`program_end_time` (live only; LIVE on VOD: 400 `Assets that did not originate from a Live Stream cannot be trimmed with a date-time`). Unknown params ignored.
- Element attributes: `max-resolution`, `min-resolution`, `rendition-order` on mux-video (SRC); when a token is present they are NOT added to the URL, they must be in the JWT (SRC toMuxVideoURL, README).
- Client-side: `max-auto-resolution` (SRC/README: caps ABR to a pricing tier, all renditions stay in manifest), `cap-rendition-to-player-size` (SRC/README: default caps to player size with a 720p floor), `initial-bandwidth-estimate-kbps`, `initial-estimate-segments`, `min-preload-segments`. 4K: DOC stream-videos-in-4k needs 4K enabled at ingest; P is 1080p max so NOT VERIFIED.
- Segments (LIVE): P's rendition playlists are HLS v3 VOD MPEG-TS, 5 s segments (`content-type: video/MP2T`), hosts `manifest-*.fastly.mux.com` / `chunk-*.edgemv.mux.com`, CORS `*`. Manifest response is `cache-control: no-cache, no-store, must-revalidate`; URLs carry `expires=` (~1 week: 1793728800 = 2026-11-03) and signature.

## 9. CMCD, prefer-playback, start-time, autoplay, preload, etc. (SRC unless noted)

- `prefer-cmcd`: `query` | `header` | `none` (playback-core types). hls.js cmcd config `{useHeaders: prefer-cmcd==='header', sessionId: metadata.view_session_id, contentId: metadata.video_id}`; if unset, hls.js CMCD is off but an xhrSetup hook trims any CMCD query to only `sid`/`cid`. Only applies when MSE (hls.js) is used, not native. LIVE: Mux manifest accepts both a `CMCD=` query and `CMCD-Session`/`CMCD-Request` headers (200), preflight `access-control-allow-headers: *`, so header mode is not CORS-blocked. I found no CMCD page in Mux docs (grep of 20 guides and llms.txt): Mux docs on CMCD NOT VERIFIED.
- `prefer-playback`: `mse` | `native` (README + types). Logic `useNative()`: non-HLS -> native; native if `canPlayType('application/vnd.apple.mpegurl')` and (prefer native OR not forced MSE); forceMse = MSE supported AND (prefer mse OR `isAndroidLike || !isSafari`). So effective default: hls.js everywhere except Safari (macOS and iOS use native HLS). README prose ("tries native whenever possible") is looser than code.
- `start-time` seconds: hls.js `startPosition`; native path seeks once seekable (inSeekableRange check) (SRC index.ts ~1696). Mux Player additionally reuses it for thumbnail-time.
- `autoplay`: native attribute, plus playback-core accepts `autoplay="muted"` and `"any"` (types `AutoplayTypes`). Behaviour (SRC autoplay.ts): `any` tries play(), on failure sets muted=true and retries, restoring muted if that fails too; `muted` forces muted then plays. Live streams seek to live edge first. Browser policy still applies.
- `preload`: `""|none|metadata|auto` (SRC preload.ts). Under hls.js, `metadata` sets `maxBufferLength=1, maxBufferSize=1` and loads the manifest; `none` defers `loadSource` until play; `auto` full buffering. In native mode it just sets the attribute.
- `muted`, `loop`, `playsinline`, `controls`, `poster`, `crossorigin`, `disablepictureinpicture`, `disableremoteplayback`, `controlslist`: forwarded native attributes (custom-media-element). `crossorigin`: Mux hosts return `access-control-allow-origin: *` (LIVE) so `anonymous` works; `use-credentials` would fail against `*`. DOC says add `crossorigin` to the video tag when using storyboard/text tracks.
- `playbackrates` (mux-player, space/comma separated numbers) and `nohotkeys`/`hotkeys` are chrome-only. On `<video>` use the native `playbackRate` property; build our own rate list.
- `disable-pseudo-ended`, `max-reconnect-retries`, `live-edge-offset`, `target-live-window`, `stream-type`: live-related, not needed for VOD.
- `custom-domain`: swaps `mux.com` for your domain in `stream.`, `image.`, `license.` hosts (SRC toMuxVideoURL/toLicenseKeyURL).

## 10. DRM

- DOC protect-videos-with-drm: Widevine, PlayReady, FairPlay. Requires asset `video_quality` `plus` or `premium` with an `advanced_playback_policies` entry holding a DRM configuration ID (requested through dashboard Settings -> Digital Rights Management). FairPlay needs your own Apple FPS certificate sent to Mux; Widevine/PlayReady certs are handled by Mux. Verified platforms: Chrome/Firefox (macOS/Windows), Safari macOS, Chrome Android, iOS etc. Static renditions cannot use a DRM playback ID.
- SRC: `drm-token` attribute (or `tokens.drm`) on mux-video; license URLs `https://license.<domain>/license/{fairplay|widevine|playready}/<playbackId>?token=<drm-token>`, FairPlay app cert `https://license.<domain>/appcert/fairplay/<playbackId>?token=...`. You also still pass a `playback-token` (aud `v`); DRM token is aud `d`. So mux-video itself supports DRM; no Mux Player needed.
- NOT VERIFIED live (no DRM asset available).

## 11. Mux Data

- SRC playback-core `monitor()`: Mux Data starts only if `!disableTracking && (env_key || isMuxVideoSrc)`. For a Mux-hosted src the environment is inferred, so no `env-key` is required (README: "If undefined and you are playing a Mux Video asset, the environment will be inferred"). 
- Disable: `disable-tracking` attribute (toggling reloads the media, preserving time). Yes it can be fully disabled.
- `disable-cookies`: DOC "By default, Mux plugins for HTML5-based players use a cookie to track playback across subsequent page views ... This cookie includes ... an anonymized viewer ID". SRC: re-attaches Mux Data on change and clears cookies (`clearMuxDataCookies`).
- `beacon-collection-domain`: DOC "If you have integrated a custom domain for Data collection ... `beaconCollectionDomain`" (guide `integrate-a-data-custom-domain`, not fetched; ad-blocker use case is my inference, NOT VERIFIED).
- Metadata: `metadata-video-title`, `metadata-viewer-user-id`, `metadata-video-id`, any `metadata-<field>` attribute, or `.metadata = {...}` property, or `metadata-url` (JSON fetch). User metadata wins over auto-fetched asset metadata (SRC `muxmetadata` handler). `respectDoNotTrack` default false (DOC; mux-embed option, not surfaced as an element attribute: NOT VERIFIED).
- Also `debug`, `player-init-time`, `player-software-name/version`, `errorTranslator`.
- Free-plan branding: asset metadata `com.mux.video.branding === 'mux-free-plan'` makes mux-video show a Mux logo (SRC), configurable with `logo` attribute. Worth knowing on a free Mux plan.

## 12. Static MP4 renditions and ffprobe

LIVE URL probes (P and D identical pattern):
- 200 video/mp4: `https://stream.mux.com/<id>/low.mp4` (P 14,107,285 B; D 316,377), `/medium.mp4` (P 24,973,272; D 484,438), `/high.mp4` (P 72,619,954; D 426,218). `accept-ranges: bytes`, Range request -> 206, `cache-control: max-age=86400`, CORS `*`. `?download=myname` -> `content-disposition: attachment; filename="myname.mp4"` (matches DOC).
- 404 `{"error":{"messages":["MP4 does not exist"],"type":"not_found"}}`: `capped-1080p.mp4`, `highest.mp4`, `audio.m4a`, `1080p.mp4`, `720p.mp4`, `360p.mp4`, `270p.mp4`. So these assets use the legacy `mp4_support` naming (low/medium/high), not the new `static_renditions` names. DOC (enable-static-mp4-renditions): new API names are `highest.mp4` and `audio.m4a` for standard, explicit resolutions 270p..1440p for advanced ("highest" cannot be mixed with explicit resolutions; audio-only can). URL form `https://stream.mux.com/{PLAYBACK_ID}/{STATIC_RENDITION_NAME}` and `?download={SAVED_FILE_NAME}`. The DOC fetch contains no `capped-1080p` string, so that name is from the older mp4_support values and NOT VERIFIED on a live asset. Explicit-resolution file names (e.g. `720p.mp4`) are NOT VERIFIED. DOC: storage fees apply, streaming charged like HLS, DRM playback IDs cannot access them, signed IDs need a token.
- ffprobe of the files LIVE:
  - low.mp4: video h264 High, 640x360, yuv420p, 60000/1001 fps, 693,512 bps; audio aac LC 44100 Hz stereo 128,020 bps. color_range/space/transfer/primaries all `unknown`.
  - high.mp4: video h264 High, 1920x1080, yuv420p, 60000/1001 fps, 4,112,806 bps; audio aac LC 44100 stereo 192,014 bps. Colour tags all `unknown`.
  - HLS 720p segments for P: h264 yuv420p, colour tags `unknown`. D (demo) HLS and high.mp4: `color_range=tv, color_space=bt709, color_transfer=bt709, color_primaries=bt709`.
  - HLS ladder P (manifest, LIVE): 1920x1080 4.71 Mbps avc1.64002a, 1280x720 2.49 Mbps, 960x540 1.63 Mbps, 640x360 0.92 Mbps, 480x270 0.60 Mbps; audio mp4a.40.2 muxed.

## 13. The colour issue (untagged P: thumbnails lighter than video)

Findings (LIVE, measured):
1. P's source is effectively FULL-range content that is untagged. Y plane of the delivered video (high.mp4 decoded with ffmpeg, raw `gray`): values 0 to 252 (t=60), 0 to 249 (t=20), 0 to 228 (t=100); 26% of pixels at Y=0 (mostly black bars) and almost no values above 235. Tagged limited-range content never goes below 16 in normal pixels.
2. Mux's untagged pipeline treats it so, and the delivered video carries no range flag (`color_range=unknown`). Browsers assume limited range for untagged H.264 (my model, NOT VERIFIED in a browser: no browser automation per repo rules), so they expand `(Y-16)*255/219` and crush everything below 16 to black and clip highs.
3. Mux image outputs map the same Y values as `Y_img = 16 + Y_video * 219/255`: quantile match at 4 times, percentiles of video Y vs thumbnail luma, e.g. t=60: median 169 -> 161 (predicted 161.1), 75th 197 -> 185 (185.2), 95th 219 -> 204 (204.1); t=20: 129 -> 126 (126.8); and floor: video Y=0 (25% of pixels) -> thumbnail 16. So blacks are lifted from 0 to 16 (and whites compressed from 252 to ~232): the "lifted blacks / lighter / lower contrast" look. Mean luma examples, thumbnail (jpg) vs ffmpeg limited-range BT.709 decode of the video at same time: t=5 24.5 vs 9.9 (dark scene, big difference), t=20 107.3 vs 107.6, t=60 122.1 vs 123.3, t=100 68.5 vs 62.7. p1 luma: thumbnail 16 vs video decode 0 at every time. Hence mean luma differences are scene dependent (large in dark scenes), the black floor is constant.
4. The same 16-floor appears in every Mux image product (LIVE, 1st percentile luma): thumbnail.jpg 16, thumbnail.webp 16, thumbnail.png 16 (PNG YMIN raw 28 after RGB->Y, same lift), storyboard.jpg 15, animated.gif first frame 16 (min 16). animated.webp could not be decoded by my ffmpeg ("image data not found"), not measured.
5. The tagged demo D does not show the problem: thumbnail vs browser-style decode at t=2: mean luma 120.8 vs 119.2, p1 13.7 vs 11.8, p50 123.4 vs 122.2 (differences about 1 to 2 levels). D video is tagged bt709/tv. So the issue tracks the untagged, full-range source, not Mux thumbnails in general.
6. No thumbnail parameter changes it. I sent identical requests with each extra param (`color`, `color_range`, `range`, `range=pc`, `color_space`, `colorspace`, `color_primaries`, `tonemap`, `tone_map`, `hdr=false`, `sdr`, `gamma`, `levels`, `full_range`, `pix_fmt`, `transfer`, `brightness`, `contrast`, `normalize`, `quality`, `format`): all returned 200 with BYTE-IDENTICAL output to the baseline (unknown params ignored). The documented thumbnail params are only time, width, height, rotate, fit_mode, flip_v, flip_h, latest (DOC table above). No colour option exists.
7. Docs search: I fetched/grepped get-images-from-a-video, create-timeline-hover-previews, set-a-default-thumbnail, minimize-processing-time, stream-videos-in-4k, play-your-videos, control-playback-resolution, mux-player docs, plus the sitemap for "color/hdr/range". Mux documents NOTHING about full-range or untagged input. What it does say:
   - Changelog "Reject video with SMPTE-2084 (PQ)" (Mar 8 2023): "Please convert these files to 8-bit color, such as 4:2:0 mpeg(tv) range video BT.709, before sending them to ingest into Mux."
   - Changelog "Mux Video now accepts assets with HDR10 as non-standard input" (Feb 3 2026): HDR10 "will process the asset to SDR BT.709 video".
   - minimize-processing-time: standard input is "8-bit 4:2:0"; sample ffmpeg uses `-pix_fmt yuv420p` with no range/matrix flags; "SDR is preferred as Mux does not provide full HDR support."
   - Blog "Your browser and my browser see different colors" (2020) explains range/tagging mismatches generally (not read in full).
8. Per-asset flags/encoding settings: none found in docs I read (asset create options seen: `video_quality`, `playback_policies`, `static_renditions`, `generated_subtitles`, `thumbnail_time`, etc.). NOT VERIFIED against the full API reference (api-reference pages not fetched).

Practical fixes (ranked, none tested end-to-end against Mux because I have no account):
- A. Fix the SOURCE before upload so it is tagged/encoded as limited-range BT.709 (Mux's stated standard). If the pixel data is truly full-range, convert, don't just retag: `ffmpeg -i in.mp4 -vf "scale=in_range=full:out_range=limited:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv ...`. Then the video, HLS and thumbnails should agree (as D does). Re-upload required; NOT VERIFIED that Mux then produces matching thumbnails for this specific file.
- B. Alternatively retag as full range (`-bsf:v h264_metadata=video_full_range_flag=1`) so players expand correctly; NOT VERIFIED whether Mux's transcode/thumbnailer honours the flag.
- C. Stop using Mux thumbnails for the poster: supply our own poster (Sanity image) or use the first video frame (video element with `preload=auto`, no poster). Always correct visually.
- D. Cosmetic: CSS `filter` on the poster only, cannot be baked exactly because lift is nonlinear at the clip points; also the repo bans inline styles unless via styled tokens. Not recommended.
- Storyboard/animated outputs have the same floor, so the same decision applies.

## 14. Verified quick-reference for the component API surface

Mux-hosted props to expose (all verified in SRC/LIVE/DOC above): playbackId, playbackToken/thumbnailToken/storyboardToken/drmToken (tokens required only for signed IDs, never for public), customDomain, maxResolution, minResolution, renditionOrder="desc", maxAutoResolution, capRenditionToPlayerSize, preferPlayback (mse|native), preferCmcd (query|header|none), startTime, assetStartTime/assetEndTime (instant clips), defaultSubtitlesLang (modifier), redundantStreams (modifier, only needs public ID or JWT claim), disableTracking, disableCookies, envKey, beaconCollectionDomain, metadata(*), autoplay (true|"muted"|"any"), preload, muted, loop, playsinline, crossorigin, poster URL builder (thumbnail time/width/height/fit_mode/rotate/flip; format by extension jpg/png/webp; signed requires claims), storyboard URL (vtt/json/png|jpg|webp, `format`), animated preview URL (gif/webp start/end/width/height/fps), text/audio track menus, chapters/cue points via JS.
Mux Player-only (re-implement ourselves): placeholder, defaultDuration, hotkeys, playbackRates, default captions-hidden, theme/controls.

## 15. NOT VERIFIED summary

Signed-token requests succeeding (no signing key); DRM playback; 4K renditions; captions via API/`generated_subtitles` and transcript URLs (need asset IDs/keys); `capped-1080p.mp4` and `{res}.mp4` names on a static_renditions asset; thumbnail rate-limit enforcement point; browser rendering of untagged P (no browser automation); Mux CMCD docs; `integrate-a-data-custom-domain` guide; full API reference for asset flags; animated.webp luma.
