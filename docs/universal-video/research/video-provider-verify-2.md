# Video provider verification, round 2 (2026-10-27)

Scratch data: /private/tmp/claude-501/-Users-davidcampbell-Documents-nextapps-reform-next-starter/e6b72631-5a51-408b-8260-f5e0e30420e8/scratchpad/probe-providers/ (headers *.h*, HTML, JSON, images). Nothing downloaded was executed. Parsing used python3 -I.

Caveat on doc quotes: WebFetch runs a small model over the page, so some "quotes" are its extraction and may be paraphrased. Items I re-checked against raw page text via curl are marked (raw). Others are "via WebFetch".

---------------------------------------------------------------------
## A. YouTube (jNQXAC9IVRw)

### A1. HTTP-level headers and cookies
Commands: `curl -s -A <Chrome UA> -D file -o file https://<host>/embed/jNQXAC9IVRw` and the same with `?enablejsapi=1&origin=https://example.com`, plus `curl -sI`. Hosts: www.youtube.com and www.youtube-nocookie.com. All returned HTTP/2 200 text/html.

| | www.youtube.com | www.youtube-nocookie.com |
|---|---|---|
| Set-Cookie (GET, plain) | 6 cookies (below) | NONE |
| Set-Cookie (GET, enablejsapi+origin) | same 6 | NONE |
| Set-Cookie (HEAD) | 6 (order differs) | NONE |
| X-Frame-Options | absent | absent |
| CSP frame-ancestors | absent (3 CSP headers: script-src allowlist, strict nonce script-src + base-uri + object-src, require-trusted-types-for) | absent (same 3) |
| Permissions-Policy | only `ch-ua-*=*` client hints | same |
| Other | CORP cross-origin; COOP and COEP report-only (report-to youtube_main) | same, report-to youtube_other |

youtube.com cookies observed (all Secure; HttpOnly):
- `__Secure-YNID`: domain .youtube.com, expires 25-Apr-2027, SameSite=none, Partitioned
- `YSC`: .youtube.com, session (no expiry), SameSite=none, Partitioned
- `__Secure-YEC`: emptied, Expires 31-Jan-2024 (a deletion), SameSite=lax
- `VISITOR_INFO1_LIVE`: .youtube.com, expires 25-Apr-2027, SameSite=none, Partitioned
- `VISITOR_PRIVACY_METADATA`: .youtube.com, expires 25-Apr-2027, SameSite=none, Partitioned
- `__Secure-ROLLOUT_TOKEN`: domain youtube.com, expires 25-Apr-2027, SameSite=none, Partitioned

Finding: at HTTP level the nocookie embed document sets zero cookies, while the standard embed sets six. enablejsapi/origin made no difference to either. Cookies set by JavaScript (base.js, later requests, the ytimg/ad calls, and local/session storage) CANNOT be observed with curl; that is NOT VERIFIED. Also not tested: what happens after a play click, or on the iframe once nested in a page.

### A2. External hosts in embed HTML (static, regex over the raw HTML)
Distinct hosts: www.youtube.com, support.google.com, www.gstatic.com, ssl.gstatic.com, i.ytimg.com, apis.google.com. The nocookie page additionally names www.youtube-nocookie.com. The only `rel=preconnect` the page emits: `<link rel="preconnect" href="https://i.ytimg.com">` (both hosts). Scripts and CSS are same-origin paths (`/s/player/dce23b30/player_embed_es6.vflset/en_US/base.js`, `/s/player/dce23b30/www-player.css`, `/s/_/ytembeds/...`).
Suggested preconnect list from this: https://i.ytimg.com (poster) plus the embed host itself. googlevideo.com media hosts, doubleclick, etc. are loaded at runtime by base.js and were NOT observed (NOT VERIFIED).

### A3. Official docs
Sources: https://developers.google.com/youtube/player_parameters and https://developers.google.com/youtube/iframe_api_reference
- `cc_load_policy`: "Setting the parameter's value to `1` causes closed captions to be shown by default" (via WebFetch, not deprecated).
- `modestbranding` (raw): "Note: This parameter is deprecated and has no effect." The page intro (raw) also says "some, like modestbranding, showinfo, autohide and theme, have been deprecated and are no longer functional."
- `rel` (raw): "Note: This parameter is changing on or after September 25, 2018." and "will not be able to disable related videos. Instead, if the rel parameter is set to 0, related videos will come from the same channel as the video that was just played."
- `iv_load_policy`: "setting to `3` causes video annotations to not be shown by default." (via WebFetch)
- `playsinline`: "This parameter controls whether videos play inline or fullscreen on iOS." (via WebFetch)
- `loop`: "In the case of a single video player, a setting of `1` causes the player to play the initial video again and again."; "This parameter has limited support in IFrame embeds."; playlist: set `playlist` to the same video ID, example `youtube.com/embed/VIDEO_ID?playlist=VIDEO_ID&loop=1` (raw).
- `controls`: `0` hides controls; value `2` "has been deprecated" (via WebFetch, clipped).
- `fs`: "Setting this parameter to `0` prevents the fullscreen button from displaying in the player."
- `disablekb`: "Setting the parameter's value to `1` causes the player to not respond to keyboard controls."
- `origin` (raw): "This parameter provides an extra security measure for the IFrame API and is only supported for IFrame embeds."
- `enablejsapi`: "Setting the parameter's value to `1` enables the player to be controlled via IFrame Player API calls."
- `start`: "This parameter causes the player to begin playing the video at the given number of seconds from the start of the video." `end`: "specifies the time, measured in seconds from the start of the video," (clipped).
- `mute` URL param: NOT documented. The raw player_parameters text has no `mute` parameter entry; the only "mute" hits are the keyboard shortcut "[m]: Mute or unmute the video". The API has `mute()`: "Mutes the player." (via WebFetch).
- `onAutoplayBlocked` (raw): "This event fires any time the browser blocks autoplay or scripted video playback features, collectively referred to as "autoplay"." Documented.
- `getAvailableQualityLevels` / `setPlaybackQuality`: zero matches in the raw iframe_api_reference HTML (also `loadModule`, 0 matches). Only the `onPlaybackQualityChange` event is documented. So they are not documented on this page (status as deprecated or removed: NOT VERIFIED from docs).
- Captions module (raw): "Currently, the only module that you can set options for is the captions module, which handles closed captioning in the player." `player.getOptions()` and `player.getOptions('captions')` are documented. Documented captions options are only `fontSize` and `reload`. `setOption('captions','track', ...)` is NOT documented on this page.

### A4. youtube-video-element source (read only)
File: /Users/davidcampbell/Documents/nextapps/reform-next-starter/node_modules/.pnpm/youtube-video-element@1.9.0/node_modules/youtube-video-element/dist/youtube-video-element.js
- L3: `const EMBED_BASE_NOCOOKIE = "https://www.youtube-nocookie.com/embed";`
- L66: `const embedBase = attrs.src.includes("-nocookie") ? EMBED_BASE_NOCOOKIE : EMBED_BASE;` so nocookie is chosen only if the src string contains "-nocookie"; there is no prop for it.
- L68-84 default params: `controls: attrs.controls === "" ? null : 0`, `autoplay`, `loop: attrs.loop`, `mute: attrs.muted`, `playsinline`, `preload: attrs.preload ?? "metadata"`, `enablejsapi: 1`, `cc_load_policy: 1`, `showinfo: 0`, `rel: 0`, `iv_load_policy: 3`, `modestbranding: 1`, `start: parseStartTime(attrs.src)`, then `...props.config` (L84) so any config key overrides a default.
- L75-76: `// https://developers.google.com/youtube/player_parameters#Parameters` / `// origin: globalThis.location?.origin,` the origin param is commented out and NOT sent by default (a consumer can pass `config={{origin: ...}}`).
- L130-134: `get config()` / `set config(value)` store `#config`. L37-41: `config.referrerpolicy` becomes the iframe `referrerpolicy` attribute, and the whole config is serialized into `data-config` for SSR hydration; L168 re-reads it on first load.
- Loop: L68-71 pass `loop: attrs.loop` with NO `playlist` param for a single video. L235-241: on ENDED it dispatches pause and ended, then `if (this.loop) { this.play(); }`. So looping is done in JS, not through the YouTube `loop`+`playlist` pair.
- Playlist: L8 `PLAYLIST_MATCH_SRC`; L92-95 `listType: "playlist", list: playlistId`.
- Captions: the element calls `this.api.setOption("captions", "track", active ? { languageCode: active.language } : {})` (about L160-162, inside a textTracks change handler). It relies on an option the docs do not list.
- Element package.json version 1.9.0 per pnpm folder name.

### Discrepancies (docs vs observed), YouTube
- Element sends `modestbranding=1` and `showinfo=0`; docs say both are deprecated with no effect (harmless but dead).
- Element sends `mute=1`; docs do not document a `mute` URL param (whether YouTube honors it was not tested).
- Element does not send `origin`; docs recommend it as an extra security measure for the JS API (not tested whether the IFrame API fills it in).
- Element relies on `setOption('captions','track')`; docs document only `fontSize` and `reload` for captions.
- Docs say rel=0 now only limits related videos to the same channel; the element's `rel: 0` comment-free default therefore does not remove related videos.
- Docs and the user's expectation that nocookie is "privacy enhanced": observed HTTP cookies are none vs six, which matches the intent at HTTP level only.

### Still NOT VERIFIED, YouTube
- JS-set cookies and storage on both hosts (needs a browser; tried only curl).
- Runtime hosts loaded by base.js (googlevideo, doubleclick, etc.).
- Whether `getAvailableQualityLevels`/`setPlaybackQuality` still work at runtime.
- Whether `mute=1` as URL param is honored.
- Whether the IFrame API adds `origin` automatically.

---------------------------------------------------------------------
## B. Vimeo (22439234)

### B1. Public check and live probes
- Public: oembed `https://vimeo.com/api/oembed.json?url=https://vimeo.com/22439234` returned JSON ("The Mountain", TSO Photography, `"is_plus":"0"`, `"account_type":"basic"`, duration 185); `https://vimeo.com/22439234` returned HTTP/2 200. Player config: `video.privacy = "anybody"`, `video.embed_permission = "public"`, `unlisted_hash = null`.
- All four URLs (`/video/22439234`, `?dnt=1`, `?background=1`, `?controls=0`) returned HTTP/2 200 text/html (23-24 KB).
- Set-Cookie on ALL four, only one: `__cf_bm=...; HttpOnly; SameSite=None; Secure; Path=/; Domain=vimeo.com; Expires=<about +30 min>` (a Cloudflare bot-management cookie). `?dnt=1` did not remove it.
- X-Frame-Options: absent on all four. CSP present (`default-src 'none'; script-src 'self' 'unsafe-inline' https://*.vimeocdn.com ...`); I only captured the first 400 chars, so a `frame-ancestors` directive was NOT checked.
- Link headers (preconnect, all four): lensflare.vimeo.com, arclight.vimeo.com, i.vimeocdn.com, f.vimeocdn.com (all `crossorigin`).
- Hosts in HTML: f.vimeocdn.com, i.vimeocdn.com, player.vimeo.com, vod-adaptive-ak.vimeocdn.com, skyfire.vimeocdn.com, vimeo.com, arclight.vimeo.com, lensflare.vimeo.com, videoapi-sprites.vimeocdn.com (plus facebook, twitter, plus.google.com, bit.ly, schema.org in share/meta strings). Preconnect-worthy: player.vimeo.com, i.vimeocdn.com, f.vimeocdn.com (matches the Link header), and the CDN hosts vod-adaptive-ak.vimeocdn.com / skyfire.vimeocdn.com (HLS/DASH).

### Player config JSON (window.playerConfig, parsed from HTML) and differences
Top keys: cdn_url, vimeo_api_url, request, player_url, video, user, view, vimeo_url, embed.
Observed differences between URLs (fields that changed, ignoring signatures/tokens/CDN URLs):
- `?dnt=1`: `embed.dnt` 0 to 1, `request.flags.dnt` 0 to 1, `request.urls.vuid_js` absent (the vuid script is dropped). Everything else equal to base.
- `?controls=0`: `embed.settings.controls` 1 to 0; nothing else changed (other chrome flags stay 1, e.g. playbar, volume).
- `?background=1`: `embed.autoplay` 1, `embed.loop` 1, `embed.muted` 1, new `embed.settings.background = 1`, and these all go to 0: controls, playbar, volume, fullscreen, title, byline, portrait, share, like, watch_later, logo, embed, cc, cc_track_menu, chapters, chromecast, airplay, audio_tracks, quality, transcript, badge (removed).
- Base: `embed.autoplay 0`, `loop 0`, `muted 0`, `playsinline 1`, `autopause 1`, `keyboard 1`, `color 00adef`, `texttrack ""`, `quality null`, `min/max/initial_quality null`, `transparent 1`, `settings.speed 1`, `settings.pip 1`, `settings.chapters 1`, `settings.cc 1`, `settings.quality 1`, `settings.badge` = Vimeo Staff Pick.
- Text tracks and chapters: `request.text_tracks` null and no chapters in this video (this sample has neither, so those fields could not be exercised).
- Quality list: `request.files` has `dash`, `hls`, `progressive` (progressive empty); hls/dash list two CDNs (akfire_interconnect_quic, fastly_skyfire) with adaptive manifests; no per-rendition list in config.
- Plan gating indicators: `user.account_type: "none"` is the viewer; the owner info is in oembed (`account_type: "basic"`, `is_plus: "0"`). There is no explicit "paid" flag in the config. IMPORTANT: this basic-account video still reflected `background=1` and `controls=0` in `embed.settings`, even though the help article says those need a paid plan (see discrepancies). Whether the player actually honors them visually was not tested.

### B2. Docs
- Help article https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-parameters (via WebFetch):
  - background: "Disable all player controls (including play/pause)." / "Set the video to loop." / "Set the video to autoplay." / "Mute the video's audio." Plan: "Video must be hosted by a Starter, Standard, Advanced, Plus, Pro, Business, Premium, or Enterprise account."
  - controls: "Hides or reveals all player elements, such as the playbar and sharing buttons, to create a chromeless experience." Same plan list.
  - dnt: "Setting this parameter to "true" blocks the player from collecting session data and analytics" ; "With DNT active, some essential cookies will still be active." Plan: "All videos".
  - autoplay: "Automatically start playback of the video." All videos. muted: "Set the video to mute on load." All videos. loop: "Play the video again when it reaches the end, infinitely." All videos.
  - playsinline: "Play video inline on mobile devices instead of automatically going into full-screen mode." and "Inline playback is enabled by default for all videos."
  - texttrack: "Displays a specified cc/subtitle track by default in the player, if available."
  - `#t`: "Used to automatically begin playback at a specific point in time." Example `#t=1m2s`; "This parameter does not require a prefixed question mark as all others do."
  - color: "Specify the color of the video controls." paid-plan list. quality: "Quality lets you specify the default playback resolution for your embedded video." paid-plan list; "Available for uploaded videos and archived events. It doesn't support live events."
  - `h`: the article has NO `h` parameter (via WebFetch). The vimeo element comments that h "is required when the Video is Unlisted".
- https://developer.vimeo.com/player/sdk/embed returned only the word "Vimeo" (JS-rendered shell) and https://developer.vimeo.com/player/sdk/embedding returned 404. NOT VERIFIED from the developer site.
- player.js README (https://github.com/vimeo/player.js/blob/master/README.md, via WebFetch):
  - setPlaybackRate: "Set the playback rate of the player on a scale from `0` to `2` (available to PRO and Business accounts)."
  - setQuality: "Set the quality of the video. (available to Plus, PRO and Business accounts)"; getQualities: "Get the available qualities of the current video."
  - getChapters: "Get an array of the chapters that are on the video."
  - requestPictureInPicture: "Request the player enters picture-in-picture." (no plan note)
  - remotePlaybackPrompt: "Prompt the viewer to activate or deactivate a remote playback device, if one is available." with note "This method may require user interaction directly with the player before working properly"; getRemotePlaybackAvailability: "Checks if there is a remote playback device available."
  - Mobile volume: "Most mobile devices (including iOS and Android) do not support setting the volume"; getVolume: "Most mobile devices do not support an independent volume from the system volume."
  - Loop and ended (setLoop note): "when loop is turned on, the `ended` event will not fire."

### B3. vimeo-video-element source (read only)
File: /Users/davidcampbell/Documents/nextapps/reform-next-starter/node_modules/.pnpm/vimeo-video-element@1.7.2/node_modules/vimeo-video-element/dist/vimeo-video-element.js (uses @vimeo/player 2.29.0 present in .pnpm)
- L3-4: `EMBED_VIDEO_BASE = "https://player.vimeo.com/video"`, `EMBED_EVENT_BASE = "https://vimeo.com/event"`.
- L15-16: `data-config` attribute = `JSON.stringify(props.config)`; L18-19: `config.referrerpolicy` goes to the iframe attribute.
- L51-63 URL params: `controls: attrs.controls === "" ? null : 0`, `autoplay`, `loop`, `muted`, `playsinline`, `preload ?? "metadata"`, `transparent: false`, `autopause`, `h: hParam`, then `...props.config` (L63). So `dnt`, `background` and others are not special-cased: any key in `config` becomes a query param, overriding defaults (e.g. `config={{dnt: 1}}` gives `?dnt=1`; `config={{background: 1}}` gives `?background=1`; `config={{controls: 0}}` overrides).
- L127-132 `config` getter/setter (setter compares JSON and stores `#config`, then reloads). L162-170: the options object passed to `api.loadVideo({...options, url})` for subsequent loads ends with `...this.#config` (L170). L187-188 SSR hydration re-reads `data-config`. L198 area: `this.api = new VimeoPlayerAPI(iframe)` wraps the already-built iframe (params travel via the iframe URL, not Player constructor options).
- L329-330: `loop` attribute change calls `this.api.setLoop(this.loop)`.

### Discrepancies (docs vs observed), Vimeo
- Docs say `background` and `controls=0` need a paid plan; observed on a "basic" account video both appeared in the config exactly as requested (`settings.background=1`, `settings.controls=0`). Either the gating is applied elsewhere (player-side/visual) or is stale; NOT proven which.
- Docs say DNT blocks session data/analytics but "some essential cookies will still be active"; observed `__cf_bm` still set with `?dnt=1`; only the vuid script disappeared.
- Docs give no `h` param; the element and Vimeo's unlisted links use it.
- `quality` docs require a paid plan; config shows `quality: null` by default (untested with param).

### Still NOT VERIFIED, Vimeo
- CSP `frame-ancestors` (not captured), X-Frame-Options is observed absent.
- Behavior on a paid vs free video for background/controls/quality/color (only one free-account sample).
- text_tracks/chapters shapes (sample has none).
- developer.vimeo.com embed options page (JS-rendered / 404).
- Real-device volume, PiP, remote playback behavior.
- Cookies set by player JS after load.

---------------------------------------------------------------------
## C. Cloudflare Stream

### C1. Host probes (`curl -sI`)
| URL | Result |
|---|---|
| https://embed.videodelivery.net/embed/sdk.latest.js | 200, content-type text/javascript, content-length 18653, cf-cache-status HIT, cache-control max-age=180, etag "edf6470a868d091ad92ff9de5fc4d7ca" |
| https://embed.cloudflarestream.com/embed/sdk.latest.js | 200, identical headers, same etag, same length |
| https://iframe.videodelivery.net/ | 404 text/plain, access-control-allow-origin *, no-cache |
| https://iframe.cloudflarestream.com/ | 404 text/plain, identical |
Body of both SDK URLs downloaded and compared: same size 18653 bytes, same shasum. No redirects. Conclusion: the element's older host `embed.videodelivery.net` still serves the same SDK file as the current host. The iframe roots 404 on both hosts alike (no video UID was in the path, so this is expected and says nothing about a UID path on the videodelivery.net iframe host; a UID path on `iframe.videodelivery.net/<uid>` was NOT TESTED).

Element source: /Users/davidcampbell/Documents/nextapps/reform-next-starter/node_modules/.pnpm/cloudflare-video-element@1.3.5/node_modules/cloudflare-video-element/dist/cloudflare-video-element.js L34 `EMBED_BASE = "https://iframe.videodelivery.net"`, L35 `MATCH_SRC` accepts `cloudflarestream.com|videodelivery.net`, L36 `API_URL = "https://embed.videodelivery.net/embed/sdk.latest.js"`, L135 `loadScript(API_URL, API_GLOBAL)`.

### C2. Docs (via WebFetch)
Pages: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/ , .../using-the-stream-player/ , .../displaying-thumbnails/
- Events: there IS an event API: "We support most of the standardized media element events." (play, pause, ended, timeupdate, error); "Non-standard events are prefixed with `stream-`" (`stream-adstart`, `stream-adend`, `stream-adtimeout`).
- SDK script per docs: `https://embed.cloudflarestream.com/embed/sdk.latest.js` (the page does not mention videodelivery.net).
- Player API props: muted "Sets or returns whether the audio should be played with the video"; controls "Sets or returns whether the video should display controls (like play/pause etc.)"; preload "it is a mere hint"; defaultTextTrack "Will initialize the player with the specified language code's text track enabled." (only at init).
- Iframe URL params (player page): startTime "A timestamp that specifies the time when playback begins." (seconds or `1h12m27s`); muted "If set, the audio will be initially silenced."; controls "Shows video controls..." default true; autoplay (mobile generally unsupported); loop; poster "must be URI encoded"; letterboxColor; primaryColor; defaultTextTrack. startTime is an iframe URL param and is not on the player-API property page.
- Iframe host form: `https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe`.
- Signed URLs: "You can replace `<VIDEO_UID>` with a signed token"; the page does not describe the token mechanics and links to "Securing your Stream" (that page was not fetched: NOT VERIFIED).
- Thumbnails: `https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/thumbnails/thumbnail.jpg?time=1s&height=270`; docs defaults: time `0s`, height `640`, width `640`, fit `crop` (options crop, clip, scale, fill); animated GIF supports `duration` (5s) and `fps` (8). For signed videos "you must use a signed URL instead of video UIDs."

### C3. Live probe of docs sample (UID 6b9e68b07dfee8cc2d116e4c51d6a957, code f33zs165nr7gyfy4)
- `.../thumbnails/thumbnail.jpg?time=1s&height=270` with `Origin: https://example.com`: 200, image/jpeg, 40225 bytes, `access-control-allow-origin: *`, `cache-control: public, max-age=864000`. `sips`: 480 x 270.
- `.../thumbnails/thumbnail.jpg` (no params): 200, 67731 bytes, `sips`: 640 x 360.
- `...&fit=clip` variant: 200.
- `.../manifest/video.m3u8` with Origin header: 200, `content-type: application/vnd.apple.mpegurl`, `access-control-allow-origin: *`, `cache-control: public, max-age=600`; body is a master playlist (variants incl. 852x480, 1920x1080, 1280x720). Byte size of the manifest was not recorded.
- `.../iframe`: 200 text/html; no Set-Cookie matched in my header filter (set-cookie, x-frame, csp patterns returned nothing).

### Discrepancies (docs vs observed), Cloudflare
- Docs say default width and height are both 640 with fit=crop (implies 640x640); observed default is 640x360 (aspect preserved) and `height=270` alone gave 480x270.
- Docs name only embed.cloudflarestream.com for the SDK; observed embed.videodelivery.net serves the identical file (same etag).

### Still NOT VERIFIED, Cloudflare
- `iframe.videodelivery.net/<uid>` with a real UID.
- Signed token mechanics ("Securing your Stream" not fetched).
- Manifest byte size; behavior of `startTime`, `defaultTextTrack` at runtime.
- Whether the 18653-byte SDK event names match the docs (SDK body saved as cf_new.js but not analyzed).

---------------------------------------------------------------------
## D. Wistia

### D1. Docs (URLs and quotes, via WebFetch unless marked)
- Domain restrictions: https://docs.wistia.com/docs/using-wistias-domain-restrictions-with-a-referrer-policy
  - "This feature depends on the Wistia player being able to identify the parent document's `referer` value on load" (clipped).
  - "If the `referer` is hidden altogether from the Wistia player, it cannot verify an approved domain and the video player will not load." (the fetch model flagged this as possibly not exact; whitespace)
  - "Certain `referrer-policy` values can restrict the Wistia player's ability to perform the domain restrictions check"; "allow-listing a parent domain automatically covers all of its subdomains."
  - Compatible: no-referrer-when-downgrade, origin, origin-when-cross-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url. Not compatible: no-referrer, same-origin. The page does not address iframe vs JS embeds.
- Embed options (legacy+Aurora): https://docs.wistia.com/docs/embed-options-and-plugins
  - autoPlay: "If set to `true`, the video will play as soon as it's ready."
  - silentAutoPlay: "This option allows videos to autoplay in a muted state in contexts where normal autoplay is blocked" (clipped); needs autoPlay or the Customize setting.
  - muted: "If set to `true`, the video will start in a muted state."
  - controlsVisibleOnLoad: "controls like the big play button, playbar, volume, etc. will be visible as soon as the video is embedded" (default true; mobile only affects the big play button).
  - playbar: "If set to `false`, it is hidden."
  - playerColor: "Changes the base color of the player. Expects a hexadecimal rgb string like "ff0000" (red)"
  - time: "Set the time at which the video should start. Expects an integer value in seconds"
  - Versions: "This embed option is only available for Vulcan `E-v1` embeds, not Aurora `player.js` embeds." and "Most of this documentation is applicable to both our Aurora `player.js` and our legacy Vulcan `E-v1.js` player."
- Aurora attributes: https://docs.wistia.com/docs/player-attributes-and-properties
  - autoplay: "If set to `true` the video will play as soon as it's ready." (will not work on iOS/mobile); silent-autoplay: "Sets how sound and autoplay work together."; muted: "Enables/disables the audio mute setting of the player."; controls-visible-on-load: "Enables/disables whether the control bar is present on load before play."; play-bar-control: "Enables/disables the play bar in the control bar."; player-color: "Sets the base color of the player. Expects a six-character hexadecimal RGB string like `#2949E5`."; current-time: "Sets the current time of the media as a decimal in seconds." Captions, E-v1 and legacy are not mentioned there. Note the Aurora names differ from E-v1 names (silent-autoplay vs silentAutoPlay, play-bar-control vs playbar, current-time vs time, `#` prefix on colors).
- Aurora API overview: https://docs.wistia.com/docs/player-embed-api
  - Events named: play, pause, second-change, can-play, time-update; "Events dispatched by `<wistia-player>` can be listened for using `addEventListener` and `removeEventListener`." No percentwatchedchanged, captions or chapters events on this page.
  - "A majority of the embed options available work for both our Aurora player.js embed and our legacy Vulcan E-v1.js embed." No deprecation or migration steps; E-v1.js is only called "legacy".
- Legacy JS API: https://docs.wistia.com/docs/javascript-player-api
  - Events used with `bind`/`unbind`, including `percentwatchedchanged` ("when the value of `percentWatched()` changes") and `captionschange`.
  - Captions: only `video.plugin('captions')` scale methods (`getSubtitlesScale()`, `setSubtitlesScale(val)`); no chapters feature described.
  - "specifically for our Legacy Vulcan Player"; "There are no plans to remove the Legacy API embed syntax." It recommends a "Standard" (async) embed for new embeds.
- Answer on Aurora vs E-v1.js: the docs call E-v1.js "legacy" and Aurora (`player.js`, `<wistia-player>`) the newer player, but state no deprecation date and no migration guide. "Replaces" is implied by "legacy" but not stated outright.
- Earlier guessed URLs docs.wistia.com/docs/embed-options and /referrer-policy-and-wistias-domain-restrictions returned 404; the URLs above were found via search.

### D2. Live probe
- Public sample id: `rbsg3da4jd` ("The Wistia Player - Product Video"), taken from https://docs.wistia.com/docs/player-embed-api, whose demos use `media-id="rbsg3da4jd"`.
- `https://fast.wistia.com/embed/medias/rbsg3da4jd.json`: 200, application/json, 22305 bytes, `access-control-allow-origin: *`, `cache-control: public, no-cache`, no Set-Cookie.
- `https://fast.wistia.net/embed/iframe/rbsg3da4jd`: 200 text/html, 25130 bytes; no Set-Cookie, X-Frame-Options, CSP or Referrer-Policy header returned (filter matched none). Hosts in the HTML: embed-ssl.wistia.com, wistia.com, fast.wistia.net, fast.wistia.com, distillery.wistia.net/.com, app.wistia.com. No `rel=preconnect` emitted.
- JSON shape: top keys `media`, `options` (empty). Media fields that matter: `hashedId`, `name`, `duration` 78.6692, `aspectRatio` 1.7777, `status` 2, `protected` false, `hls_enabled` true, `playableWithoutInstantHls` true, `assets` (10), `captions`, `availableTranscripts`, `embedOptions`/`embed_options`, `originalFileStillAsset`.
- Assets: original 3840x2160, iphone_video 640x360, mp4_video 400x224, md_mp4_video 960x540, hd_mp4_video 1280x720 / 1920x1080 / 3840x2160, storyboard 2000x1792, still_image 3840x2160, extended_audio_description_mp3.
- Poster fields: `embedOptions.stillUrl` (`https://embed-ssl.wistia.com/deliveries/fc4438...png`), `originalFileStillAsset.url` (`...5b3d2a9c...jpg?video_still_time=39`, 3840x2160), `assets[type=still_image]` (3840x2160, `.bin` URL). A resized request `https://embed-ssl.wistia.com/deliveries/fc443861a91266dd5fb1a914cc51ca2c.jpg?image_crop_resized=640x360` returned 200 image/jpeg, `sips` 640 x 360.
- Captions: `media.captions` is a list with one entry having only `language` ("eng") and `text` (a plain transcript string); NO VTT/SRT URL in that entry. `availableTranscripts` is a list of 5 language objects (bcp47LanguageTag, wistiaLanguageCode, hasCaptions, hasVideoStream, ...). `embedOptions.plugin.captions` = `{language: "", onByDefault: "false", on: "true", async: "false"}`.
- Chapters: `media.chapters` null/absent. Other embedOptions keys: playerColor B23009, playerColorGradient, volumeControl, fullscreenButton, controlsVisibleOnLoad, bpbTime, vulcan, roundedPlayer, showCustomerLogo, thumbnailAltText, audioDescriptionControl, shouldShowCaptionsSettings.
- Domain restriction: this sample has none in effect for the curl request (no referer sent, 200 OK); a restricted media was not tested.

### Discrepancies (docs vs observed), Wistia
- Docs say `time` expects an integer seconds string for E-v1; Aurora docs name the same thing `current-time` (decimal seconds): naming differs by player.
- Docs describe captions API and events; the media JSON exposes caption text only as a transcript string, not caption file URLs.
- No documented preconnect hosts; observed iframe HTML emits no preconnect.

### Still NOT VERIFIED, Wistia
- Whether `E-v1.js` is slated for removal (docs silent).
- Any domain-restricted media behavior and referrer-policy failure mode (needs a restricted account).
- Caption file URLs/VTT endpoint, chapters shape (sample has none).
- Runtime cookies set by JS and which hosts the Aurora `player.js` loads (not fetched).
- Whether `distillery.wistia.net` tracking can be disabled.

---------------------------------------------------------------------
## Request budget
YouTube 6 header/body requests plus 2 doc fetches and 2 raw doc fetches; Vimeo 4 player pages, 1 oembed, 1 page HEAD, 3 doc fetches; Cloudflare 4 HEADs, 2 SDK GETs, 4 thumbnail/manifest/iframe GETs, 1 more thumbnail, 3 doc fetches; Wistia 2 probes, 1 image, about 8 doc fetches and 2 searches. All within 6 per endpoint and 80 total.
