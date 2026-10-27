# Video provider live probe, 2026-10-27

Scratch data (headers, downloads): /private/tmp/claude-501/-Users-davidcampbell-Documents-nextapps-reform-next-starter/e6b72631-5a51-408b-8260-f5e0e30420e8/scratchpad/probe/
Downloads were only measured (sips, file, ffprobe, ffmpeg signalstats), never executed. No credentials used.
Request budget note: the Mux thumbnail endpoint got 8 requests and the YouTube oEmbed endpoint 5 (required variants plus error cases), above the "3 per endpoint" guideline. Everything else is 3 or fewer.
Doc caveat: for YouTube, Vimeo, Twitch and Cloudflare (partly) I did NOT re-fetch the provider docs in this run, so "docs say" for those rows is marked as such. Docs actually fetched and read this run: Spotify, Wistia, TikTok, Cloudflare thumbnails, Mux images.

## DISCREPANCIES (claim vs actual)

| # | Provider | Claim (source) | Actual today |
|---|----------|----------------|--------------|
| 1 | Vimeo | Doc sample video https://vimeo.com/76979871 is the usual oEmbed example (developer.vimeo.com/api/oembed/videos, not re-fetched) | `404 Not Found` (text/html, 13 bytes) for plain and URL-encoded forms. Another public video (22439234) returns 200. So that sample id is dead; do not use it in tests. |
| 2 | Vimeo | Without `width`, thumbnail is some default size (not re-fetched) | Without width: thumbnail_url ends `-d_295x166`, 295x166 (measured). With `width=640`: `-d_640`, thumbnail_width 640 x 360. The `width` param changes the thumbnail, not only the iframe. |
| 3 | Vimeo | Thumbnail URLs might be signed or expiring | No signature or expiry param. Only `?region=us`. Size is a path suffix (`-d_WxH`); swapping to `-d_1280x720` returned a real 1280x720 JPEG (100025 bytes). |
| 4 | Spotify | Doc example thumbnail_url host is `i.scdn.co/image/...` (https://developer.spotify.com/documentation/embeds/reference/oembed) | Real responses use `image-cdn-fa.spotifycdn.com/image/<id>` (new host, same style of id). Hard-coded `i.scdn.co` allowlists would break. |
| 5 | Spotify | thumbnail_url/width/height are "Nullable" (same page) | Never null in my 2 samples (track and episode both 300x300). Nullable is documented, not observed. |
| 6 | TikTok | Docs example has no thumbnail_url, title or author_name (https://developers.tiktok.com/doc/embed-videos) | Confirmed: live response has NO thumbnail_url, NO title, NO author_name. Fields are exactly: version, type, width ("325" string), height ("578" string), html, provider_url, provider_name, embed_product_id, embed_type. Docs and reality agree; this deviates from the oEmbed spec examples and from older TikTok responses. width/height are strings, not numbers. |
| 7 | YouTube | Common belief that `maxresdefault`/`sddefault` exist for every video | For jNQXAC9IVRw (2005 upload) both return 404 (placeholder JPEG 120x90, 1097 bytes, content-type image/jpeg, cache max-age=30). They exist for dQw4w9WgXcQ (maxres 1280x720). A 404 still has `content-type: image/jpeg`, so `<img>` onerror or a status check is required. |
| 8 | YouTube | oEmbed thumbnail_url | Always `hqdefault.jpg` 480x360 (4:3 with letterbox bars), regardless of maxwidth/maxheight. maxwidth/maxheight only change iframe width/height (267x200 for 300x200 request, aspect preserved). |
| 9 | YouTube | oEmbed spec allows `cache_age` (https://oembed.com) | Not returned. No cache-control/expires/etag on YouTube oEmbed. Only `vary: Origin`. |
| 10 | YouTube | CORS on oEmbed | No `access-control-allow-origin` without an Origin header. With `Origin: https://example.com` it reflects that origin (`access-control-allow-origin: https://example.com`), so it is origin-reflecting, not `*`. Thumbnails (i.ytimg.com) return `*`. |
| 11 | YouTube | `vi_webp/.../maxresdefault.webp` | 404 for this id (same as jpg). `vi_webp/hqdefault.webp` works but is 480x360 (not larger), 23038 bytes vs 15921 for the jpg, i.e. webp was LARGER here. |
| 12 | Mux | `time` out of range | Negative `time=-5` and `time=99999` return 200 (clamped to a valid frame), only non-numeric `time=abc` gives 400. `width=32` is honored (32x32), no minimum enforced. |

## 1. YouTube

Doc status: no official docs fetched this run (oEmbed spec https://oembed.com used for comparison; YouTube thumbnail URLs are not formally documented on a page I fetched).

Commands:
- `curl -si "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=jNQXAC9IVRw&format=json"`
- same plus `&maxwidth=300&maxheight=200`
- same with `-H "Origin: https://example.com"`
- nonexistent: `...watch?v=aaaaaaaaaaa&format=json`, invalid: `...watch?v=xx`

Result (no maxwidth): HTTP 200, `content-type: application/json`, headers: `vary: X-Origin`, `vary: Referer`, `vary: Origin,Accept-Encoding`. NO cache-control, expires, etag, age, ratelimit.
Body: title "Me at the zoo", author_name "jawed", author_url, type "video", height 150, width 200, version "1.0", provider_name, provider_url, thumbnail_height 360, thumbnail_width 480, thumbnail_url `https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg`, html (iframe with `referrerpolicy=strict-origin-when-cross-origin`, `allow=...`).
With maxwidth=300&maxheight=200: width 267, height 200, thumbnail fields unchanged.
With Origin header: `access-control-allow-origin: https://example.com`, `access-control-expose-headers: vary,...`.
Nonexistent id and malformed id: HTTP 400, `content-type: application/json; charset=UTF-8`, body `Bad Request` (not JSON despite the header). Note: 400 not 404.

Thumbnail HEADs (jNQXAC9IVRw):

| URL | status | content-length | content-type | cache-control | other |
|-----|--------|----------------|--------------|---------------|-------|
| vi/default.jpg | 200 | 4523 | image/jpeg | public, max-age=7200 | ACAO `*`, etag "1702883835", expires +2h |
| vi/mqdefault.jpg | 200 | 8710 | image/jpeg | public, max-age=7200 | ACAO `*`, age 1308 |
| vi/hqdefault.jpg | 200 | 15921 | image/jpeg | public, max-age=7200 | ACAO `*`, age 1119 |
| vi/sddefault.jpg | 404 | 1097 | image/jpeg | public, max-age=30 | ACAO `*` |
| vi/maxresdefault.jpg | 404 | 1097 | image/jpeg | public, max-age=30 | ACAO `*` |
| vi_webp/hqdefault.webp | 200 | 23038 | image/webp | public, max-age=7200 | no ACAO header seen |
| vi_webp/maxresdefault.webp | 404 | 552 | image/webp | public, max-age=30 | |

Measured pixel dimensions (sips): hqdefault.jpg 480x360, mqdefault.jpg 320x180, sddefault.jpg (404 body) 120x90, vi_webp/hqdefault.webp 480x360, vi_webp/maxresdefault.webp (404 body) 120x90. default.jpg dimensions not measured (HEAD only; 120x90 is the usual value, NOT measured). Extra: dQw4w9WgXcQ `maxresdefault.jpg` HEAD 200, 65324 bytes, measured 1280x720.
`https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg`: HTTP 200 directly, NO redirect, same content-length 15921, same etag, ACAO `*`, `cross-origin-resource-policy: cross-origin`, `timing-allow-origin: *`.
Nonexistent id thumbnails (hqdefault and maxresdefault of aaaaaaaaaaa): HTTP 404, image/jpeg, 1097 bytes, max-age=30.

## 2. Vimeo

Doc status: developer.vimeo.com/api/oembed/videos not re-fetched. Comparisons below are against the widely known doc sample and general behavior only.

Commands:
- `curl -si -H "Origin: https://example.com" "https://vimeo.com/api/oembed.json?url=https://vimeo.com/76979871"` -> 404
- encoded form `url=https%3A%2F%2Fvimeo.com%2F76979871` -> 404
- `url=https%3A%2F%2Fvimeo.com%2F22439234` (public "The Mountain") and with `&width=640`
- `curl -si "https://i.vimeocdn.com/video/145027281-...-d_295x166?region=us"`, then the same with `-d_1280x720`
- `url=...%2F999999999999` and `https://vimeo.com/1` -> 404

404 response: `content-type: text/html; charset=UTF-8`, body `404 Not Found` (13 bytes), `access-control-allow-origin: *`, `cache-control: max-age=120, must-revalidate`, plus `set-cookie: __cf_bm=...` (Cloudflare). Same for nonexistent and for 76979871. Nothing distinguishes deleted from never-existed.

200 response (id 22439234): `content-type: application/json`, `access-control-allow-origin: *`, `access-control-allow-headers: X-Requested-With`, `cache-control: max-age=300`, `etag: "7f3fe683..."`, `expires` +5 min, set-cookie `__cf_bm`. No ratelimit headers.
Body: type "video", version, provider_name, provider_url, title, author_name, author_url, is_plus "0" (string), account_type "basic", html (iframe `player.vimeo.com/video/22439234?app_id=122963`, 426x240), width 426, height 240, duration 185, thumbnail_url `https://i.vimeocdn.com/video/145027281-cf3e3e04...-d_295x166?region=us`, thumbnail_width 295, thumbnail_height 166, thumbnail_url_with_play_button `https://i.vimeocdn.com/filter/overlay?src0=<encoded thumbnail>&src1=http%3A%2F%2Ff.vimeocdn.com%2Fp%2Fimages%2Fcrawler_play.png` (note: src1 is http, not https), upload_date, video_id (number), uri, description.
With `width=640`: width 640, height 360, thumbnail_url `...-d_640?region=us`, thumbnail_width 640, thumbnail_height 360; same etag as without width.
Thumbnail GET (`-d_295x166`): 200, image/jpeg, content-length 9175, `cache-control: max-age=2592000`, ACAO `*`, `access-control-expose-headers: X-Viewmaster-Status`, age 1109587; measured 295x166. `-d_1280x720`: 200, 100025 bytes, measured 1280x720. So the path suffix accepts arbitrary sizes (one alternate tested only; `-d_640` form came from oEmbed itself, not fetched).

## 3. Wistia

Public sample: `https://home.wistia.com/medias/e4a27b971d` from Wistia's own doc https://wistia.com/support/developers/oembed (that page also states the endpoint is host-agnostic and matches on URL path).
Commands: `curl -si -H "Origin: https://example.com" "https://fast.wistia.com/oembed?url=https://home.wistia.com/medias/e4a27b971d"` and the same on `fast.wistia.net`.
Both: HTTP 200, `content-type: application/json; charset=utf-8`, `access-control-allow-origin: *`, `cache-control: public, no-cache`, `etag: W/"5a3b66da..."` (identical on both hosts), `age: 130250` (.com, cached) vs `age: 0` (.net). No ratelimit headers.
Body (identical on both hosts): version, type "video", html (iframe `fast.wistia.net/embed/iframe/e4a27b971d` plus `<script src=".../E-v1.js" async>`), width 960, height 540, provider_name "Wistia, Inc.", provider_url, title "Brendan - Make It Clap", thumbnail_url `https://embed-ssl.wistia.com/deliveries/2d2c14e1...jpg?image_crop_resized=960x540`, thumbnail_width 960, thumbnail_height 540, player_color "174bd2", duration 16.51.
Docs example body matches live body (field set, values, html with script tag). No discrepancy found.
Thumbnail GET: 200, image/jpeg, `cache-control: max-age=31536000`, measured 960x540. Header `access-control-request-method: *` (a request-style header on a response, not a real ACAO). Not verified that ACAO is present on the image (not seen). Changing the query to `image_crop_resized=320x180` returned a 320x180 image, so size is controllable.

## 4. Spotify

Doc: https://developer.spotify.com/documentation/embeds/reference/oembed (episode sample `https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5` taken from it).
Commands: `curl -si [-H "Origin: https://example.com"] "https://open.spotify.com/oembed?url=https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"` and the episode URL. `curl -sI` without -L: HTTP 200 directly (no redirect).
Headers: HTTP 200, `content-type: application/json`, `access-control-allow-origin: *`, `x-content-type-options: nosniff`, `vary: Accept-Encoding`, `set-cookie: sp_t=...; sp_landing=...`. NO cache-control, etag, expires. No ratelimit headers.
Track body: html (iframe, height 152, `border-radius: 12px`, loading=lazy), iframe_url, width 456, height 152, version, provider_name, provider_url "https://spotify.com", type "rich", title "Never Gonna Give You Up", thumbnail_url `https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02baf89eb11ec7c657805d2da0`, thumbnail_width 300, thumbnail_height 300.
Episode body: same shape, title "My Path to Spotify: Women in Engineering ", thumbnail_url `https://image-cdn-fa.spotifycdn.com/image/ab67656300005f1ff8141e891abf749375772343`, 300x300 (docs show host `i.scdn.co` for the same id).
Track thumbnail GET: 200, image/jpeg, 33278 bytes, ACAO `*`, `cache-control: max-age=15780000`; measured 300x300.
Thumbnail nullable: never null in these two; not tested for content where it could be null.

## 5. TikTok

Doc: https://developers.tiktok.com/doc/embed-videos (sample `https://www.tiktok.com/@scout2015/video/6718335390845095173`).
Command: `curl -si -H "Origin: https://example.com" "https://www.tiktok.com/oembed?url=https://www.tiktok.com/@scout2015/video/6718335390845095173"`.
HTTP 200, `content-type: application/json; charset=utf-8`, `access-control-allow-origin: *`, `access-control-expose-headers: x-tt-traceflag,x-tt-logid`, `cache-control: max-age=0, no-cache, no-store`, `expires` = about +30 s of now (contradicts no-store but present). No etag or ratelimit headers.
Keys: version, type, width "325", height "578", html (iframe `https://www.tiktok.com/player/v1/6718335390845095173?embed_from=oembed&music_info=1&description=1&autoplay=1&muted=1`), provider_url, provider_name, embed_product_id, embed_type "video". Confirmed: no thumbnail_url, thumbnail_width, thumbnail_height, title, author_name, author_url. Matches docs example exactly.

## 6. Twitch

No token used. Commands (once each): `curl -si "https://api.twitch.tv/v5/oembed?url=https://www.twitch.tv/videos/1"` -> HTTP 404, empty body, `server: awselb/2.0` (CloudFront). `curl -sI "https://www.twitch.tv/oembed?url=https://www.twitch.tv/twitch"` -> HTTP 103 early-hints (link preconnect) shown by head; final status/body not captured, so I conclude only that no JSON oEmbed was confirmed. Helix requirement (Client-Id plus app/user token for Get Videos/Get Streams thumbnails) is from my knowledge of https://dev.twitch.tv/docs/api/reference/, NOT re-fetched or tested here. Conclusion: no unauthenticated oEmbed endpoint was found at those two guesses.

## 7. Cloudflare Stream

Doc: https://developers.cloudflare.com/stream/viewing-videos/displaying-thumbnails/ shows the form `https://customer-<code>.cloudflarestream.com/<UID>/thumbnails/thumbnail.jpg?time=1s&height=270`, supported attrs time (default 0s), height (default 640), width (default 640), fit (default crop) and a `poster` param on the iframe URL.
The docs sample (`customer-f33zs165nr7gyfy4`, UID `6b9e68b07dfee8cc2d116e4c51d6a957`) was probed once with HEAD: HTTP 200, `content-type: image/jpeg`, `content-length: 40225`, `access-control-allow-origin: *`, `cache-control: public, max-age=864000`, `access-control-allow-headers: range`. Pixel dimensions NOT measured (HEAD only). Whether this docs sample is guaranteed to stay public is unknown.

## 8. Mux

Playback id from Mux docs page https://www.mux.com/docs/guides/get-images-from-a-video: `MECFZgEm102d01XMx5ME1A28pAe34Z02eSL` (found in the page's embedded `stream.mux.com/<id>/high.mp4` demo video; the page also contains `i2601kxZN02xxWWBzkGspI97yO4CjrlX4vunqqtiFsbOw`, not used). Video is square, 674x674.
Docs say (that page): `time` defaults to thumbnail_time or the middle of the video; `width` defaults to the original width; formats png/jpg/webp.

| Request | status | content-type | content-length | cache-control | measured |
|---------|--------|--------------|----------------|---------------|----------|
| thumbnail.webp?time=0 | 200 | image/webp | 12626 | max-age=604800 | 674x674 |
| thumbnail.jpg?time=0 | 200 | image/jpeg | 49086 | max-age=604800 | 674x674 |
| thumbnail.png?time=0 | 200 | image/png | 37802 | max-age=604800 | 674x674 |
| thumbnail.webp?time=2&width=640 | 200 | image/webp | 14148 | max-age=604800 | 640x640 |
| thumbnail.jpg?time=abc | 400 | application/json | 66 | none | body `{"error":{"code":3,"message":"Invalid time, cannot parse string"}}` |
| thumbnail.jpg?time=-5 | 200 | image/jpeg | 49086 | max-age=604800 | 674x674, same size as time=0 |
| thumbnail.jpg?time=99999 | 200 | image/jpeg | 49251 | max-age=604800 | 674x674 (clamped) |
| thumbnail.jpg?time=0&width=32 | 200 | image/jpeg | 706 | max-age=604800 | 32x32 |

All have `access-control-allow-origin: *`, `x-cache: MISS`, `age: 0`. No etag, ratelimit headers seen. Error response (400) has no cache-control.
Playlist `https://stream.mux.com/<id>.m3u8`: 200, `application/vnd.apple.mpegurl`, ACAO `*`, `cache-control: no-cache, no-store, must-revalidate`; renditions 674x674, 540, 360, 270; variant URLs are signed (`expires=1793721600` = 2026-11-03 16:00 UTC, `signature=` present).

Color comparison (single video, single frame at t=0, ffmpeg 8-style decode on this machine; one sample only):
- ffprobe of stream (first video stream): codec h264 High, 674x674, pix_fmt yuv420p, color_range tv, color_space bt709, color_transfer bt709, color_primaries bt709.
- ffprobe tags of the thumbnails: jpg = mjpeg yuvj420p, range pc, space bt470bg, transfer/primaries unknown; png = rgb24, pc, transfer/primaries unknown; webp = yuv420p, range tv, space bt470bg, transfer/primaries unknown. (The stream is tagged bt709 end to end; the thumbnails carry no bt709 transfer/primaries tag.)
- Frame 0 extracted with `ffmpeg -i https://stream.mux.com/<id>.m3u8 -frames:v 1 frame0.png` (ffmpeg converts to rgb24 itself).
- signalstats after normalising every image to full-range bt709 yuv444 (`scale=out_color_matrix=bt709:out_range=full,format=yuv444p`):

| image | YMIN | YLOW | YAVG | YHIGH | YMAX | UAVG | VAVG | SATAVG |
|-------|------|------|------|-------|------|------|------|--------|
| stream frame 0 (png from ffmpeg) | 0 | 35 | 122.99 | 180 | 185 | 81.24 | 178.14 | 79.76 |
| thumbnail.jpg | 0 | 38 | 125.20 | 182 | 196 | 81.11 | 177.85 | 79.58 |
| thumbnail.png | 1 | 37 | 124.65 | 182 | 187 | 80.74 | 178.26 | 80.26 |
| thumbnail.webp | 0 | 35 | 123.27 | 181 | 192 | 81.49 | 178.05 | 79.52 |

Measured: thumbnail mean luma is 0.3 to 2.2 higher (out of 255) than frame 0; luma 5th-to-95th percentile spread (YHIGH minus YLOW) is 145 (video), 144 (jpg), 145 (png), 146 (webp); mean saturation differs by under 0.7. A second, non-normalised pass (default conversion, which is NOT apples to apples because the PNG/JPEG range and matrix tags differ) gave larger gaps for the jpg (YAVG 129.9 vs 126.2, SATAVG 84.0 vs 73.3) and is shown only because it depends on how a decoder interprets the jpg tags; I did not investigate that further.
What was NOT measured: how a browser renders the video versus the img (GPU color management, `<video>` tv-range handling), any other video, any time other than 0, difference images or per-pixel error. With these numbers on this one frame, thumbnail luma, contrast and saturation are close to the decoded video frame; I draw no further conclusion.

## NOT TESTED

- YouTube private/non-embeddable video: no known id without logging in; only nonexistent/malformed ids tested (both HTTP 400).
- YouTube docs: no official page fetched this run; default.jpg pixel size not measured.
- Vimeo docs page not re-fetched; deleted-vs-private distinction not testable (all give the same 404); the unencoded `url=` form was only tried with the dead id 76979871; `thumbnail_url_with_play_button` image not fetched.
- Twitch: Helix requirement not re-verified from docs; final status of the www.twitch.tv/oembed guess not captured.
- Cloudflare Stream: pixel dimensions and default 640 sizing not measured; only a docs-published sample was HEAD-probed.
- Spotify: null thumbnail case not observed. Wistia thumbnail CORS header not confirmed.
- Mux: default `time` (no param) and default width behavior; signed playback IDs; browser-rendered color; any video other than the one demo asset.
