# Universal video component: reliability research (2026-10-27)

Legend: CONFIRMED = fetched from a primary source this session (URL given). UNSURE = from general knowledge/not verified this session; verify before relying on it.
Limited research budget: sections 3 (codec budgets, HLS), 4 (state machine) and 5 are mostly engineering recommendations marked UNSURE where not sourced.

## 1. Autoplay policies

- Muted autoplay is always allowed in Chrome. CONFIRMED (https://developer.chrome.com/blog/autoplay/). Canonical markup: `muted playsinline autoplay`.
- Chrome: unmuted autoplay needs a user gesture or high Media Engagement Index (desktop only). CONFIRMED (same URL). Irrelevant for muted heroes.
- iOS Safari (since iOS 10, July 2016): `<video autoplay>` may autoplay without a gesture if it is `muted` or has no audio track; iPhone needs `playsinline` or it goes fullscreen; autoplay only starts while visible and pauses when scrolled out of view; if it gains audio / is unmuted without a gesture it pauses; `play()` returns a promise rejected when the rules are not met. CONFIRMED (https://webkit.org/blog/6784/new-video-policies-for-ios/).
- MDN generic rule: audible media autoplays only if muted, user interacted, site allowlisted, or Permissions-Policy `autoplay` grants it (default `self`; iframes need `allow="autoplay"`). CONFIRMED (https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- Firefox: `media.autoplay.default` default 0 (allowed), `media.autoplay.allow-muted` default true, `media.block-autoplay-until-in-foreground` default true (background tabs do not autoplay). CONFIRMED (MDN autoplay guide). Users can set blocking, so muted autoplay is not guaranteed in Firefox.
- `navigator.getAutoplayPolicy("mediaelement")` returns `allowed` / `allowed-muted` / `disallowed`; no change event, check at load. CONFIRMED (MDN autoplay guide). UNSURE: Safari support for getAutoplayPolicy (historically limited); feature-detect and fall back to trying `play()`.
- `play()` handling: always check the returned promise; `NotAllowedError` means autoplay denied, show a play button / poster; do not show a pause UI when not playing; other errors are load/decode errors. CONFIRMED (Chrome blog + MDN). Also treat `AbortError` (play interrupted by a new load/pause) as benign and ignore it. UNSURE (standard HTML spec behavior, not fetched).
- iOS Low Power Mode: the WebKit 2016 article does not mention it. UNSURE of all of the following: in LPM iOS Safari blocks autoplay of even muted inline video (play() rejects with NotAllowedError), and there is NO web API to detect LPM. Pattern: never detect, just react to the `play()` rejection (or no `playing` event within ~1-2 s) and show poster plus a visible play button; a first user touch anywhere often lets `play()` succeed, so a one-time `pointerdown`/`touchend` listener that retries `play()` is a common workaround. Do not spoof detection with UA sniffing.
- Data Saver: `navigator.connection.saveData` is a Chromium-only, "limited availability" (not Baseline) API; feature-detect with `navigator.connection?.saveData`. CONFIRMED that availability is limited (https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API); Chromium-only is UNSURE (MDN page did not render the table). Chrome autoplay blog does not mention data saver. Recommendation: if saveData is true, or `effectiveType` is `2g`/`slow-2g`, render poster only with a play button, `preload="none"`.
- `prefers-reduced-motion: reduce`: not fetched this session. Recommendation (WCAG 2.2.2 also requires a pause/stop mechanism for auto-playing motion over 5 s, UNSURE not fetched): for decorative background video, show poster only under reduce, or start paused with a visible play/pause control. Read via `matchMedia("(prefers-reduced-motion: reduce)")` and listen for `change`; for SSR avoid hydration mismatch by letting CSS hide/show (see section 4) or reading in an effect.

## 2. Poster and first-frame strategy

- `poster` is shown until first frame is available; with `loading="lazy"` the poster also defers until near viewport. CONFIRMED (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video).
- LCP: for `<video>`, the candidate is the poster load time or first-frame presentation time, whichever is EARLIER. CONFIRMED (https://web.dev/articles/lcp). Implication: a heavy poster or a late-decoding video makes LCP late. Make the poster a small, well-compressed AVIF/WebP/JPEG served by the normal image pipeline.
- Recommended hero pattern (UNSURE on browser nuances, standard practice): render an `<img>` (Next `Image` with `priority`, which emits fetchpriority=high and a preload) absolutely positioned behind/over the `<video>`, with the `<video>` having NO `poster` attribute (or the same URL). Reasons: you control crossfade, `object-fit`, blur placeholder, and the `<img>` is a reliably detected LCP candidate; `poster` on `<video>` is less controllable (cannot fade, differing `object-fit` handling between browsers, may letterbox).
- Avoid the "faded poster" look: the usual cause is poster color/encoding differing from the video's first frame (color range/gamma, different crop, higher compression). Extract the poster from the exact first frame of the same encode (ffmpeg `-frames:v 1`), same aspect ratio and crop, high quality (not heavily blurred) and do not overlay with opacity. Never put the poster under a semi-transparent overlay that the video does not also have.
- When to remove the poster: do not remove on `loadeddata`/`canplay` (frame may not be painted yet, causing a flash of empty/black). Best signal is the first presented frame: `video.requestVideoFrameCallback()` (Baseline 2024, newly available; CONFIRMED https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback), falling back to the `playing` event (fires once playback actually starts) when rVFC is absent. Then fade poster out over ~200-400 ms via CSS opacity transition (class toggle, no inline styles), and unmount/`visibility:hidden` it after `transitionend`. For muted-autoplay-blocked cases the poster simply stays.
- Event semantics (UNSURE, HTML spec, not fetched): `loadeddata` = first frame available for current position; `canplay` = can start but may stall; `playing` = playback actually progressing. rVFC is the most precise "frame is on screen" signal.
- CLS: reserve space with CSS `aspect-ratio` on the wrapper (from CMS width/height) and `width`/`height` attributes; MDN warns unloaded video has size 0 and lazy ones reflow. CONFIRMED (MDN video page). Use `object-fit: cover` for backgrounds.
- Blurhash/LQIP: a tiny inline blur (base64 ~ 20-40 px, or CSS background color from dominant color) in the wrapper avoids empty box while the real poster loads; fade the real `<img>` in on `onLoad`. UNSURE specifics; standard practice. Dominant-color fill is cheaper than blurhash decode in JS.
- Preload the LCP poster: use `<Image priority>`; do NOT preload the video file for LCP (a video file is not an LCP bytes issue; the poster is). If poster is a CSS/`poster` attribute only, add `<link rel="preload" as="image" fetchpriority="high">` (React 19 `preload()` from `react-dom`). UNSURE on exact Next 16 behavior; verify in `node_modules/next/dist/docs/`.

## 3. Loading strategy

- `preload`: `none` = don't preload; `metadata` = duration/dimensions; `auto`/"" = may download the whole file; it is only a hint; spec advises `metadata`; `autoplay` overrides `preload`; with `loading="lazy"` preload applies only when near viewport. CONFIRMED (MDN video page).
- `loading="lazy"` on `<video>`: documented by MDN (defers until browser-calculated distance, only when JS enabled, lazy videos excluded from window `load`, affects autoplay/poster/preload). CONFIRMED that MDN documents it. UNSURE of cross-browser shipping status (MDN content was not showing a compat table); treat as progressive enhancement and keep the IntersectionObserver path as the source of truth.
- Recommended per use case (UNSURE, engineering judgment):
  - Above-fold hero loop: `autoplay muted loop playsinline`, `preload="auto"`, poster `<img>` priority. Keep it as the only eager video.
  - Below-fold loop: render wrapper + poster only; IntersectionObserver with ~200-400 px rootMargin sets `src`/`<source>` and `preload="auto"`, plays when intersecting, pauses when not; optionally removes `src` + `load()` after long absence to free memory.
  - Interactive video with controls: `preload="metadata"` (or `none` on Data Saver), poster visible, load on first interaction.
- MP4 faststart (moov atom at front, `ffmpeg -movflags +faststart`) is needed for progressive playback to start before the full download. UNSURE (not fetched, widely documented). Server must support HTTP Range (206) so seeking/partial loads work; verify the CDN/blob host returns `Accept-Ranges: bytes`.
- Codecs: H.264 MP4 (High/Main profile, yuv420p, AAC removed for silent loops) is the universal baseline; add AV1/VP9 WebM `<source>` BEFORE it only if you measure wins and have the encode pipeline; HEVC is Safari-centric and licensing/support uneven. Order `<source>` by preference with `type` including codecs so browsers skip unsupported ones. UNSURE on current support matrix (not fetched; check caniuse).
- Budgets for background loops (UNSURE, rules of thumb): strip audio track entirely (also helps iOS autoplay since no-audio video may autoplay, CONFIRMED by WebKit article); 1080p max (720p often enough for blurred/overlayed backgrounds), 24-30 fps, 8-15 s loop; target <= ~1.5-3 MB per hero loop on desktop, <= ~1 MB mobile variant (serve a smaller encode via `<source media>` / separate asset); bitrate ~1-2.5 Mbps for 1080p H.264 with `-crf 23-28`; make mobile variant a separate file.
- HLS vs MP4: for short muted loops progressive MP4 is almost always better (single request, no JS, instant start). HLS is worth it for long/interactive videos needing adaptive bitrate and seeking on poor networks. Safari/iOS play HLS natively (`video.canPlayType("application/vnd.apple.mpegurl")`); elsewhere load `hls.js` with dynamic `import("hls.js")` only when an HLS source is needed and user is near/at the video. Destroy the instance on cleanup. UNSURE on hls.js size (~ tens of KB gzipped to ~100+ KB; check bundlephobia).

## 4. Reliability patterns

State machine (UNSURE, recommended design): states `idle` (no src) -> `loading` -> `ready` (first frame presented) -> `playing` <-> `paused`; plus `blocked` (play() NotAllowedError, show poster + play button), `stalled` (waiting/stalled beyond ~3 s, keep poster/last frame, retry), `error`. Drive with one reducer (`useReducer`) from media events: `loadstart`, `loadeddata`, `canplay`, `playing`, `pause`, `waiting`, `stalled`, `error`, `ended`. Keep `Error` terminal after N retries (e.g., 2, exponential backoff by re-setting `src` + `load()`), then show poster only. `stalled` can fire spuriously on idle buffering; only escalate if `readyState < 3` for several seconds.

React specifics:
- `muted` attribute not rendered by React: issue still open (opened Aug 2017, last maintainer comment Apr 2018). CONFIRMED (https://github.com/facebook/react/issues/10389). The `muted` DOM property is set but the HTML attribute is missing from SSR/hydrated markup; iOS historically wants the attribute for autoplay. Workaround confirmed in thread: pass `muted` in JSX AND set `video.muted = true` and `video.defaultMuted = true` in an effect/ref callback. UNSURE whether current React 19 server HTML now emits the attribute; test the actual SSR output. Also set `playsInline` (React prop), `loop`, and for SSR set `autoPlay`.
- Autoplay attribute vs imperative `play()`: use the attribute for first paint (works before hydration) AND call `play()` imperatively from an effect/IntersectionObserver, always handling the promise. Remove attribute-driven autoplay semantic conflicts by gating with `loading`: if offscreen, don't set `autoPlay`; let the observer play.
- Cleanup / StrictMode: effects run twice in dev; make setup idempotent: attach listeners and observers in an effect, return cleanup that removes them, `cancelVideoFrameCallback`, `observer.disconnect()`, `video.pause()`, and for unmount of heavy videos `video.removeAttribute("src"); video.load()` to free decoder. Ignore `AbortError` from the aborted first `play()`.
- Avoid setState directly in effect bodies (React Compiler lint `react-hooks/set-state-in-effect`): set state from event handlers/callbacks (media event listeners are fine) or derive state; use `useSyncExternalStore` for `matchMedia` (reduced motion) and `navigator.connection` subscriptions, which also avoids hydration mismatches by supplying a server snapshot.
- Hydration: render identical server and first client markup; decide reduced-motion / saveData / autoplay-blocked only after mount (or via CSS `@media (prefers-reduced-motion)` hiding the video and showing the poster). Never branch on `navigator`/`window` during render.
- visibilitychange/bfcache: pause on `document.visibilitychange` hidden (browsers often do this for muted video but not reliably), resume on visible if it was playing intent. Handle `pageshow` with `event.persisted` to re-check/replay after bfcache restore (autoplayed video may be paused). UNSURE of per-browser specifics; standard practice.
- Offscreen pause: one shared IntersectionObserver (module-level or via a small manager) with threshold ~0.1; play when intersecting AND tab visible AND not reduced-motion AND not data-saver; pause otherwise. iOS pauses offscreen autoplay itself (CONFIRMED WebKit article), but Chrome/Firefox do not, so the observer is required for battery.
- Many videos per page: cap concurrently playing/decoding videos (e.g., 1-3), via a manager queue; others show poster only. Mobile Safari limits simultaneously decoded/loaded video elements (UNSURE of exact number, reports of a small cap, often cited ~16 media elements or fewer hardware decoders); unload `src` of offscreen videos.
- Also: add `disableRemotePlayback` (and `x-webkit-airplay="deny"`) on background loops to avoid cast UI; CONFIRMED attribute docs (MDN video page). Add `aria-hidden` + no focusability for decorative video; provide controls/pause for non-decorative.

## 5. Carousel of background videos (crossfade)

UNSURE, all engineering recommendations (not sourced):
- Mount at most two `<video>` elements (current + next), never N. Active plays; next gets `src`, `preload="auto"`, stays `muted` and paused (or plays only briefly) and with opacity 0 until swap.
- Preload next only after current has presented its first frame (rVFC) and is `canplaythrough`/idle, to avoid competing bandwidth with the LCP video. Optionally trigger when current is within ~2 s of end.
- Crossfade: when next fires `canplay` + first rVFC frame, start `next.play()`, fade next in (CSS transition on opacity via class), then after `transitionend` pause the previous and clear its `src` + `load()` to free the decoder (this is what cuts double-decoding and memory). Reuse the two elements as a ping-pong pair rather than creating new ones.
- Hold posters for all slides as lightweight `<img>`s (only current/next rendered eagerly), so a slow next video degrades to a poster crossfade instead of a blank.
- Pause the whole carousel offscreen/hidden tab/reduced-motion; under Data Saver or reduced motion, show static first-slide poster only.
- Prefer one concatenated sprite-like video only if all slides are short and total size is small; otherwise ping-pong pair.

## 6. React Compiler and Next.js 16 constraints

UNSURE overall (not verified against Next 16 docs this session; project rule says read `node_modules/next/dist/docs/` before coding):
- Component must be a Client Component (`"use client"`) for refs, effects, events; keep the server parent passing serializable props (src URLs, poster data, dimensions, blurDataURL). Poster `<img>`/placeholder can be rendered in the server markup for LCP.
- Compiler rules: do not read/write `ref.current` during render; do DOM work (play, load, set muted/defaultMuted, observers) in effects, event handlers or ref callbacks; do not mutate props; do not mutate objects after creation in render; compute derived values (`??`, `?.`, ternaries) in variables before any `try`; keep effects' dependencies honest so memoization is not broken; avoid calling setState synchronously in effects (use event callbacks or `useSyncExternalStore`).
- Prefer a ref callback (React 19 supports cleanup return functions from ref callbacks) to attach/detach observers and listeners to the video element, making StrictMode double-invoke safe.
- Module-level singletons (shared IntersectionObserver, concurrency manager) are fine but must be client-only and not touched during SSR.
- Static asset hosting: videos are not processed by `next/image`; serve from public/CDN with long immutable caching and Range support; keep sources out of the JS bundle.

## Recommended defaults

| Concern | Default |
|---|---|
| Hero loop attrs | `autoPlay muted loop playsInline`, no `controls`, `disableRemotePlayback`, `aria-hidden` |
| muted handling | JSX `muted` + set `muted`/`defaultMuted` in ref callback |
| Hero preload | `auto`, poster `<img priority>` (fetchpriority high) |
| Below-fold preload | none until within ~300 px, then `auto`; play only when intersecting |
| Interactive video preload | `metadata` (`none` on Data Saver / slow connection) |
| Poster removal | on first rVFC frame (fallback `playing`), 200-400 ms opacity fade, then unmount |
| Poster asset | exact first frame of same encode, same crop, AVIF/WebP, small, plus dominant-color/blur placeholder |
| Layout | wrapper `aspect-ratio` from CMS dims, `object-fit: cover` |
| play() failure | catch `NotAllowedError` -> blocked state, poster + play button; one-time gesture retry; ignore `AbortError` |
| iOS Low Power Mode | no detection API; infer from rejection / no `playing` within ~1-2 s |
| Reduced motion | poster only (or paused with visible play control) |
| Data Saver / 2g | poster only, `preload="none"` |
| Offscreen | IntersectionObserver pause (threshold ~0.1), pause on hidden tab, re-check on bfcache `pageshow` |
| Concurrency | max 1-3 playing videos; unload src of offscreen ones |
| Source | H.264 MP4 faststart, no audio track, <=1080p, 24-30 fps, ~1.5-3 MB desktop, smaller mobile file; AV1/VP9 only if measured |
| HLS | only for long/adaptive videos; native on Safari, dynamic-import hls.js elsewhere |
| Retry | 2 retries with backoff, then poster-only error state |
| Carousel | 2 ping-pong video elements, preload next after current first frame, clear previous src after fade |

## Sources

- https://webkit.org/blog/6784/new-video-policies-for-ios/ (2016-07-25)
- https://developer.chrome.com/blog/autoplay/
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback
- https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
- https://web.dev/articles/lcp
- https://github.com/facebook/react/issues/10389
- Not fetched but worth checking: https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/ , https://react.dev/reference/react-compiler , Next docs in `node_modules/next/dist/docs/`, caniuse for `loading=lazy` on video, AV1/HEVC, hls.js docs.
