# Video inventory (reform-next-starter checkout)

Scope: read-only. Everything below was read from source. Nothing was run, rendered or tested, so all runtime behaviour claims are from code reading only ("CONFIRMED IN CODE") or are labelled "GUESS". Paths are relative to /Users/davidcampbell/Documents/nextapps/reform-next-starter.

## 0. Files found

library/videos/ (8 files, all read fully):

- CarouselBGVideo.tsx (exports `CarouselBackgroundVideo`)
- BackgroundVideo.tsx (exports `BackgroundVideo`)
- BackgroundVideoOriginal.tsx (also exports `BackgroundVideo`, a name collision with the above)
- MuxVideo.tsx (exports `MuxVideo`, `isPseudoEnded`; thin wrapper over `@mux/mux-video-react`)
- BatterySaverVideo.tsx (exports `BatterySaverVideo`; wraps library `MuxVideo`)
- LazyVideo.tsx (exports `LazyVideo`; plain `<video>` + GSAP ScrollTrigger)
- VideoEmbed.tsx (exports `VideoEmbed`; react-player, Sanity `video` object)
  library/scrub/ScrubbedVideo.tsx (+ ScrubCanvas, useScrubDriver etc., only ScrubbedVideo read in full; README and CHANGELOG entry also read).
  Sanity: library/sanity/reusables.tsx (`video`, `youtube` types), library/sanity/assetMetadata.ts (`VideoField`, projections), sanity.config.ts (plugin + registration), sanity/schemas/sections/sample.ts, sanity/schemas/sections/projections/{sample,blogArticle}.ts, sanity/schemas/blog/blockContentType.tsx, sanity.types.ts.
  No "PlayedVideo" or similar exists. No YouTube/Vimeo-specific component exists beyond react-player inside VideoEmbed.

## 1. Dependencies

- library/package.json:9 `@mux/mux-video-react ^0.31.6` (installed 0.31.6 in library/node_modules). This is the `<mux-video>` custom element (hls.js/MSE, native HLS on Safari). Used by CarouselBGVideo, BackgroundVideo(+Original), MuxVideo.
- package.json:185 `react-player ^3.4.0` (installed 3.4.0). Its deps (from its package.json): hls-video-element, dash-video-element, @mux/mux-player-react, youtube-video-element, vimeo-video-element, wistia/spotify/tiktok/twitch/cloudflare elements. Players are lazy imports (react-player/dist/players.js).
- package.json:190 `sanity-plugin-mux-input ^5.2.0`; sanity.config.ts:303 `muxInput({ max_resolution_tier: "2160p" })`.
- library/package.json:29 optional peer `@plutotcool/fsv 0.5.1` (also root devDependency package.json:201) for ScrubbedVideo.
- `ahooks` (`useRafInterval`, `useLatest`) used by MuxVideo and ScrubbedVideo. No standalone hls.js dependency (only transitively).
- Note: react-player pulls in @mux/mux-player-react, but VideoEmbed never reaches that player for Mux (see section 4).

library/KNOWN-ISSUES.md (40 lines): grep found no video/mux notes. library/CHANGELOG.md video-relevant entries: scrub components (~L65-81), `reform::video` GROQ functions (~L236-280), removal of `fetchAssetMeta` (~L503), muxVideo `data` projection (~L664-699), `faqItem` registration with `video`/`youtube` (~L150), BackgroundVideo move to library/videos (~L913, 2025-11-25). No CHANGELOG entry about CarouselBackgroundVideo, BatterySaverVideo or LazyVideo (not verified beyond grep).

## 2. Per-component detail

### 2.1 CarouselBackgroundVideo (library/videos/CarouselBGVideo.tsx, 371 lines)

"use client": yes (L1). Styling: library `styled` + `css` in `@layer library` (L313-371), but also inline `style=` props (L256-262, L269-275, L301), which break the repo's no-inline-styles rule.
Source support: Mux only, via `playbackId`. Stream URL `https://stream.mux.com/{id}.m3u8?min_resolution=..[&max_resolution=..][&rendition_order=desc]` (L282-288). No mp4, YouTube, Vimeo, or generic URL support. Uses raw `@mux/mux-video-react` (L3), NOT the library `MuxVideo` wrapper, so none of the wrapper's `preferPlayback="mse"`, `backBufferLength: 0`, pseudo-ended logic.
Props (L15-109):

- `playbackId?`, `videoBlurUrl?`, `videoAspectRatio?` (applied as CSS aspect-ratio on container), `videoDuration?` (used only for failure poster time)
- `poster?: SanityImageData<"false"> | StaticImageData` (overrides Mux thumbnail)
- `play = true` (play/pause toggle), `muted = true`, `loop`
- `minResolution = "480p"`, `maxResolution?`, `renditionOrder?: "desc"`
- `className`, `ref` (container div), `videoRef` (underlying `<video>`)
- `safariOptimized = false` (load right away on Safari), `eager = false` (skip IO)
- callbacks: `onEnded(e?)`, `onTimeUpdate(currentTime, duration)`, `onLoadedMetadata(duration)`, `onPlaying()`
  Poster/placeholder (L242-278, L293-299): layered. Container gets `backgroundImage` = 32px blur URL only when no `poster`. `PlaceholderDiv` always mounted with background = `image.mux.com/{id}/thumbnail.webp?time=0&width={posterSize}` (when no `poster`), or an `EagerImages`-wrapped `PosterImage` when `poster` given. Video element fades in (opacity 0 -> 1, 0.2s) on `canplay` (L301-302, L336). The `<video poster=>` attr is also set to the Mux thumbnail (time=0, or `time={videoDuration}` on playback failure). `posterSize` = innerWidth rounded to 100, clamped 300..1920 (L117-120).
  Autoplay/muted/loop/playsInline: `muted` prop (default true), `playsInline` hard-coded, `loop` passthrough, no `autoPlay` attribute; playback is driven by an effect that calls `play()` (L153-198).
  Lazy loading: yes. `shouldRenderVideo` starts false always (comment L127-132 explains: server HTML must not contain `<mux-video>` or hydration mismatches). IntersectionObserver on the placeholder with `rootMargin: 400px`, one-shot (L204-226). `eager` or (`safariOptimized` && Safari) flips it true right after mount. Once loaded, it is never unloaded and never paused when it leaves the viewport.
  Battery saver / reduced motion / data saver: none.
  Controls: none (no `controls` prop, background use only).
  Error handling: `error` event listener on the video -> `fail()` sets `playbackFailure` (src removed, poster switches to last-frame thumbnail) and calls `onEnded` (L167-172, L190). `play()` rejection is retried every 250 ms forever until effect cleanup (L182-188). Failure state resets when `playbackId` changes (L144-146). Ready flag resets when `playbackId` changes (L147-150).
  SSR: server renders container + placeholder div only (no video). `ScreenContext` `innerWidth` is 0 on first render (ScreenContext.tsx L27 default) so poster width on SSR is 300 (UNVERIFIED that SSR actually sees 0 vs hydrated value).

### 2.2 BackgroundVideo (library/videos/BackgroundVideo.tsx, 344 lines)

"use client": yes. Styling: `styled`, plus inline `style` (L172-174, L179, L220-225, L240).
Source: Mux via `playbackId`; URL `...m3u8?min_resolution=`. No maxResolution/renditionOrder.
Props: `playbackId, videoBlurUrl, videoAspectRatio, videoDuration, eager, play=true, muted=true, minResolution="480p", loop, className, ref, posterOverride?: ImageField, onEnded, onTimeUpdate, onLoadedMetadata`. No `onPlaying`, no `videoRef`.
Poster: two modes. (a) `posterOverride` given: Sanity image shown, opacity driven by `videoCanPlay`. (b) Default "video-as-poster": a second tiny `<mux-video>` (`PosterVideo`, `max_resolution=720p`, `preload=metadata`) sits under the main video and acts as the poster (L227-241). Comment L228-230 states Mux thumbnails have different colors than the video, so they chose a video frame instead of thumbnail. Blur backgroundImage on container.
Lazy: IO with 400px rootMargin, `eager` skips (L131-152). Safari: `video.load()` after `loadVideo` (L88-92). Two `<MainVideo>` branches with different keys for Safari lazy-load rendering bug (L242-281).
Autoplay: promise-chained `play()` via `videoPlayPromise` ref (L104-126); any `play()` rejection is treated as permanent failure (sets failure + `onEnded`).
Naming bug: state `videoCanPlay` starts true and `onCanPlay` sets it to false (inverted name).
No battery saver, reduced motion, data saver, controls. Not a hydration-safe pattern: `<mux-video>` rendered... only after `loadVideo` (effect-driven) except the always-rendered `PosterVideo` and placeholder `MainVideo` (rendered in SSR HTML). The Carousel version's comment claims that causes hydration mismatches, so this component may suffer it (GUESS).

### 2.3 BackgroundVideoOriginal (library/videos/BackgroundVideoOriginal.tsx, 243 lines)

No "use client" directive (uses hooks; only works if imported from a client module). Earlier revision of BackgroundVideo: no `eager`, no `posterOverride`, no `safari load()`, autoplay effect has no dependency array (runs every render, L76-99), IO observes `video.current` (the placeholder video; remounts on key change). Container has no width/height 100%. Appears dead code; no importers found. Exports a second `BackgroundVideo` symbol (name collision).

### 2.4 MuxVideo (library/videos/MuxVideo.tsx, 135 lines)

"use client": yes. Not a background component; a wrapper on `@mux/mux-video-react`.
Props (L8-29): Pick of `autoPlay, onTimeUpdate, onPlay, onPause, playbackId, className, style, muted, loop, playsInline, preload, onSeeked, controls, poster` + `ref`, `autoPlayFallbackTime`, `onEnded(event: Event)`, `preloadTrackable` (accepted and ignored).
Behavior: forces `preferPlayback="mse"`, `renditionOrder="desc"`, `_hlsConfig={{ backBufferLength: 0 }}`. Reimplements `ended` (pseudo-ended check on timeupdate and a 100 ms `useRafInterval`, L62-76) and swallows native `onEnded` (L119-125). On `autoPlay`, calls `play()`; on `NotAllowedError` seeks to `autoPlayFallbackTime ?? duration`, sets `preload=metadata`, and dispatches a fake `ended` (L78-100). Sets `data-preload-track={playbackId}` (L131); no consumer found in app/ or library/ by grep (UNVERIFIED whether anything else reads it).
Note: the Pick omits `src`, `onCanPlay`, `onLoadedMetadata`, `minResolution`, `maxResolution`, so it cannot be a drop-in for the Carousel component's needs.
Used only by BatterySaverVideo. No call site in app/.

### 2.5 BatterySaverVideo (library/videos/BatterySaverVideo.tsx, 222 lines)

No "use client" directive (uses hooks + imports a client module, so needs a client importer). `"use no memo"` for React Compiler (L31).
Props: `ComponentProps<typeof MuxVideo>` (see 2.4) - the playbackId route only.
Behavior: monkey patches `el.play = attemptPlay` on the element in a ref callback (L122-126). `attemptPlay` calls the original `play()`. On `NotAllowedError`: if the user never interacted (`navigator.userActivation.hasBeenActive` false), shows the low power overlay immediately; otherwise waits up to 5 s for any interaction (pointerdown/move, wheel, touchstart, keydown) then retries; second failure shows overlay (L36-98). Overlay is a full-screen portal button with a hand-written inline SVG play icon (L134-143, violates the "never hand-write SVG" rule), English-only message "Site paused by low power mode". `FORCE_FAIL` const for testing (L16). Forces `autoPlay={false}` on the inner video and calls `attemptPlay` itself when `autoPlay` prop true.
This is the only component with any battery-saver handling. No reduced-motion, no data-saver. No call site in app/.

### 2.6 LazyVideo (library/videos/LazyVideo.tsx, 106 lines)

No "use client". Plain `<video>` with `<source>` children. Props: `poster (string), autoPlay, muted, loop, onLoad(video), children, className, style, ref`. Children are rendered only after a GSAP `ScrollTrigger` (200px before in, `useAnimation` with `recreateOnResize`) fires and `usePreloader().completed` is true. `muted={muted || autoPlay}`, `playsInline`, `onLoadedData` once -> `onLoad`. File sources only (via `<source>`), no HLS/Mux/embeds. Controls: none unless caller passes... `controls` is not in the prop type, so none. Not used in app/.

### 2.7 VideoEmbed (library/videos/VideoEmbed.tsx, 89 lines)

"use client": yes. Wrapped in `ClientOnly`, which returns null until `ScreenContext.shouldHydrateUtilities` (ClientOnly.tsx L6-16), so nothing renders on the server and the player appears late.
Props: `video: VideoField` (Sanity), `controls = true`, `resetOnPlay`, `className`, `ref`, plus all `react-player` props except `src/width/height`.
Sources: via react-player 3.4: file URLs, HLS (.m3u8 via hls-video-element/hls.js), DASH, YouTube, Vimeo, Wistia, Spotify, Twitch, TikTok, Cloudflare Stream, Mux player URLs. For Sanity `sourceType === "mux"` it builds `https://stream.mux.com/{playbackId}.m3u8` (L24-29). Because `MATCH_URL_MUX` excludes `stream.mux.com/{id}.m3u8` (patterns.js L5) and `hls` is first in the player list, this goes through hls.js, not `@mux/mux-player-react` (CONFIRMED by reading react-player dist, not by running). Other source types pass `video.url` straight to ReactPlayer.
Poster: NONE. `getVideoSrc` returns `thumbnail` but it is destructured away and unused (L47); `video.posterImage` is never read; react-player `light` is not used. The Sanity field description says the poster image "is shown in place of the video's default thumbnail", so the editor promise is not implemented here (CONFIRMED in code).
Controls: native/react-player controls, default on. Autoplay/loop/muted/playing: only if caller passes react-player props. `playsInline` forced. No lazy/IO, no pause offscreen, no battery saver, no reduced-motion. Styling: `styled` wrapper with `--media-object-fit: cover` CSS vars. Events: react-player's (`onPlay`, `onReady`, `onError`, etc.) passthrough; `resetOnPlay` seeks to 0.
Returns `null` silently when no playbackId/url (L51); no error UI.

### 2.8 ScrubbedVideo (library/scrub/ScrubbedVideo.tsx, 194 lines)

"use client": yes. Not a playback component: scroll-scrubbed `.fsv` clip rendered to canvas with WebCodecs+WebGL (`@plutotcool/fsv`, dynamic import). Props: `src, trigger, enabled, scrub, settle, settleThreshold, springStiffness, springDamping, scrubFrom, progressCurve, controlRef, start, end, fit, alt, alpha, priorityFrames, onReady, onLoaded, onError, className`. Sources: `.fsv` files only. Good error plumbing (`onError`, AbortController, cleanup). Chosen over `<video currentTime>` because Safari stops repainting backgrounded tabs (scrub/README.md L3). Not used in app/ (only ScrubbedImageSequence in app/visual-tests/scrub/page.tsx). Not a candidate for the universal player; keep separate.

## 3. What CarouselBackgroundVideo does, and what is worth keeping

Flow: server renders sized container (CSS aspect-ratio) + a placeholder (blur background + thumbnail/poster). After mount, `eager`/Safari-optimized or an IO (400px) turns on a `<mux-video>` (preload auto, muted, playsInline, `src` = HLS URL with min/max resolution + rendition order). Video stays opacity 0 until `canplay`, then fades over the placeholder. A play effect calls `play()` with a 250 ms retry loop, listens for the element `error` event, and degrades to a poster-only state on failure. Reset of failure/ready state on `playbackId` change uses the setState-during-render pattern (no extra effect).
Worth keeping as the base:

- Hydration-safe lazy mount (never SSR the custom element) and the explanation comment.
- Persistent poster layer under the video (no black flash, survives iOS evicting offscreen frames).
- Fade-in on `canplay`, with per-id reset.
- Controlled `play` toggle plus retry-until-success play loop that does not get stuck on a one-shot `canplay`.
- ABR controls: `minResolution`, `maxResolution`, `renditionOrder` via URL params (decode-cost aware).
- `videoRef` and container `ref` both exposed; `onPlaying` as the "really started" signal.
- Responsive poster width from `ScreenContext`.
- Custom `poster` override (Sanity or static) via `UniversalImage`.
- Failure state with poster fallback; resetting on source change.
  Not worth keeping / needs fixing in the universal version: inline `style` props; infinite 250 ms retry with no cap or backoff; no pause when offscreen after load; no reduced-motion/data-saver/battery-saver; Mux-only; `onEnded` in effect deps; dead duplicate poster branch (L243-247); background-size missing on the blur container; no controls; no error callback separate from `onEnded`.

## 4. Sanity side (the "embed" system)

There is no separate "embed" module. The video-related types are:

1. `video` object (library/sanity/reusables.tsx L328-382), registered in sanity.config.ts:107 (and imported L21). Fields:
   - `sourceType` string, options: `mux` ("Upload or Select a File"), `youtube`, `vimeo`, `wistia`, `spotify`, `twitch`, `tiktok`, `url` ("Video URL"); initial `mux`.
   - `url` (url): hidden when `mux`; custom validation per provider using react-player regexes (`MATCH_URL_YOUTUBE`, etc., imported at reusables.tsx top); `url` type has no pattern check.
   - `muxVideo` (type `mux.video` from sanity-plugin-mux-input): hidden unless `mux`.
   - `posterImage` (universalImage, `withAlt: false`): hidden unless `mux`; description says it overrides the default thumbnail.
2. `youtube` object (reusables.tsx L290-300): single `url` field; registered at sanity.config.ts:106; not referenced by any schema field or renderer in this checkout (grep). Legacy/unused (UNVERIFIED that no other repo uses it).
3. `mux.video` / `mux.videoAsset` from the plugin (singletonPlugin.tsx L139, L194 hides `mux.videoAsset` from the desk).
   Generated types: sanity.types.ts L204-220 `Video`, L531+ `MuxVideoAssetReference`/`MuxVideo`. Hand-copied front-end type `VideoField` in library/sanity/assetMetadata.ts L31-55 (adds `muxVideo.data` and `posterImage.data`).

Providers supported today (by schema + VideoEmbed): Mux (Sanity-hosted via Mux plugin, HLS), YouTube, Vimeo, Wistia, Spotify, Twitch, TikTok, plain URL (file/HLS/DASH via react-player). Nothing in schema for Sanity file assets or Cloudflare.

GROQ (library/sanity/assetMetadata.ts):

- `muxVideoDataProjection` (L104-117): `playbackId`; `videoThumbnailUrl` = `image.mux.com/{id}/thumbnail.jpg[?time=thumbTime]` (uses `asset->thumbTime` if defined, jpg); `videoBlurUrl` = `thumbnail.webp?time=0&width=32`; `videoAspectRatio` = "w/h" from `asset->data.aspect_ratio`; `videoDuration` = `asset->data.duration`.
- `videoProjection` (L132-133): `{ ..., muxVideo {..., data: muxProjection}, posterImage imageProjection }` with LQIP/dominantColor/aspect data.
- `reform::video($video)` and `reform::videos($videos)` GROQ functions (L140-141).
  Feeding projections: sanity/schemas/sections/projections/sample.ts (`"sampleVideo": reform::video(sampleVideo)`), sanity/schemas/sections/projections/blogArticle.ts (body items `_type == "video" => reform::video(@)`). Schema uses: sections/sample.ts L26-28 (`sampleVideo`), blog/blockContentType.tsx L75-77 (portable text member `video`).

## 5. Mux rendering and the "poster looks too faded" question

How Mux is rendered now:

- Playback: `https://stream.mux.com/{playbackId}.m3u8` (+ `?min_resolution=..` etc. for background components; VideoEmbed uses the bare URL).
- Poster in CarouselBackgroundVideo: `https://image.mux.com/{id}/thumbnail.webp?time=0&width={100..1920 rounded}` as a CSS background (L273) and as the `poster` attr (L297-298). Failure poster: `time={videoDuration}` (the last frame; if `videoDuration` is undefined it becomes literally `time=undefined`, L297).
- Blur placeholder: 32px `thumbnail.webp?time=0&width=32` from GROQ as container background (Carousel L260; BackgroundVideo L224).
- Sanity-chosen thumbnail time (`asset->thumbTime`) is only in `videoThumbnailUrl` (jpg), which Carousel and BackgroundVideo never use (they hard-code `time=0`), and VideoEmbed discards it.

CONFIRMED in code:

- No overlay, gradient, opacity or filter exists in any library/videos component (the only opacity is the video fade 0 -> 1 and PosterVideo/PosterImage toggles). No `fit_mode`, `fps`, `format`, or quality param on image.mux.com URLs.
- The poster/placeholder always uses `time=0` and ignores the editor's `thumbTime`.
- BackgroundVideo.tsx L228-230 comment says Mux thumbnails have different colors than the playing video (author knowledge of a color mismatch).
- In Carousel the blur layer is the Container background; `Container` CSS (L313-323) has no `background-size/position/repeat`, so the 32px blur tiles instead of covering (BackgroundVideo's Container does set them, L296-300). It is hidden by `PlaceholderDiv` when the thumbnail loads, but is what a user sees on slow loads.
- Video is opacity 0 until `canplay`; during the 0.2 s transition both layers are partially transparent over the container (no background color).
  Likely causes of "faded" (GUESS, not verified by viewing anything): (1) frame at `time=0` is often a fade-in/near-black or washed first frame of the source, whereas the playing video moves on; (2) Mux thumbnail WebP is color-managed/encoded differently from the decoded video (what the BackgroundVideo comment hints at), producing low contrast vs the video it crossfades to; (3) the 32px blur scaled up looks washed; (4) the site that consumes the component may apply its own overlay/gradient (I did not find one in this repo; the library components are not used in app/, so any overlay would live in a downstream site or its CSS). To pin it down, compare the `image.mux.com ...time=0` URL against a later `time=` frame and against `thumbTime`, and inspect the consuming site's CSS. Recommended first test: use `thumbTime` (or a small positive time) and `format=jpg`/PNG vs webp.

## 6. Call sites in app/

- `VideoEmbed`: app/sections/Sample.tsx:46 `<VideoEmbed video={sampleVideo} />` inside a 16:9 `VideoFrame` (no other props, so controls default on, no autoplay/loop/poster); app/sections/blog/BlogRich.tsx:41 portable-text `video` type -> `StyledVideoEmbed` (L173-180: `width:100%; border-radius:16px; aspect-ratio:16/9; overflow:clip`), `video={value}`, no other props. Sample.tsx is a server component importing a client component; the data flows from GROQ `reform::video`.
- `CarouselBackgroundVideo`, `BackgroundVideo`, `BackgroundVideoOriginal`, `BatterySaverVideo`, `MuxVideo`, `LazyVideo`, `ScrubbedVideo`: NO call sites in app/ (grep of app, sanity, scripts for the names returned only VideoEmbed users and ScrubbedImageSequence in app/visual-tests/scrub/page.tsx). So there are no real call sites passing Carousel props in this checkout; the props above come only from the component's own API (and from comments referencing a `TestimonialCard` elsewhere, L176-178, not in this repo).

## 7. Bugs and smells relevant to "loading and playing issues"

CarouselBackgroundVideo

- Infinite 250 ms `play()` retry (L182-188): NotAllowedError (low-power mode, autoplay blocked) loops forever, burning timers and never surfaces a state. No cap/backoff and no distinction between NotAllowedError and AbortError.
- `onEnded` is in the effect deps (L198); inline callbacks re-run the effect on every parent render, tearing down and re-adding listeners and re-calling `play()`.
- `fail()` conflates "error" with "ended" by calling `onEnded`; callers cannot tell them apart.
- Video never pauses when it scrolls out of view after first load (IO is one-shot, disconnect at L215); many carousel items can decode concurrently (Safari decode cost is called out in props docs L66-71).
- `play` prop false only pauses once `shouldRenderVideo`; no resume on tab visibility change.
- `time=${videoDuration}` can be `time=undefined` (L297).
- `isSafari` set in an effect (L121-125) -> extra render; `safariOptimized` only applies after hydration.
- Dead duplicate branch at L243-247.
- Blur background missing `background-size` (L260-262 vs Container CSS).
- Inline `style` use throughout; the hand-built poster logic is duplicated with `<video poster>`.
- `canplay` fade handler only sets true; never reset on seeking/rebuffer. On HLS error the element remains opacity 0 but the poster stays (fine).
  BackgroundVideo / Original
- Any `play()` rejection (incl. a harmless AbortError from a `pause()`/load race) permanently marks failure and fires `onEnded`.
- `videoCanPlay` inverted naming; poster image in override mode has no fade.
- Two `<mux-video>` in default mode (poster video + main) doubles decode/network; SSR renders `<mux-video>` in the default branch, the hydration issue the Carousel comment warns about (GUESS that it actually mismatches).
- Original: autoplay effect without deps runs every render (L76-99); IO observes an element that remounts; no "use client".
  MuxVideo
- `useRafInterval(..., 100)` runs per instance forever, even paused/offscreen.
- Autoplay effect depends on `onEnded`; inline handlers re-call `play()` repeatedly.
- On NotAllowedError it fakes an `ended` event and jumps to the end: fine for slideshow logic, surprising for generic use.
- `preloadTrackable` prop is a no-op; `data-preload-track` has no found consumer.
- Prop Pick is too narrow (no `onCanPlay`, `onLoadedMetadata`, src/resolution control).
  BatterySaverVideo
- Ref callback is an inline function, so it runs null/el on each render; `setVideoEl` churn and `attemptPlay` identity changes can re-run the autoPlay effect (GUESS; `"use no memo"` suggests the author hit related issues).
- Assigning `el.play` globally changes the element's native API; `play` rejection other than NotAllowedError is rethrown from `attemptPlay` and could surface as unhandled promise rejection from the effect (`attemptPlay()` is not awaited/caught at L108).
- Interaction listeners and the 5 s timer are not cleaned up on unmount (only on trigger); hard-coded English message; SVG hand-written; no focus management on overlay; only handles low power mode, not reduced motion/data saver.
  LazyVideo
- Depends on `usePreloader` and GSAP; `self.start < 0` check is a heuristic; children-as-source only; no src/HLS; no pause offscreen; unused.
  VideoEmbed
- `ClientOnly` gating means no SSR, no poster, and a blank frame until hydration utilities flag flips.
- `posterImage` and Mux thumbnail ignored (editor field has no effect, L47 discards `thumbnail`).
- `videoAspectRatio` unused (parent must size).
- Silent `null` when src missing; no error UI or `onError` default.
- Mux plays through hls.js via react-player (no ABR caps, no `min_resolution`), a different pipeline from the background components (which use `<mux-video>`).
- No lazy loading / IO, no autoplay-in-view, no battery saver.
  General
- No component handles reduced motion or data saver (grep for prefers-reduced/saveData in library/videos returned only the BatterySaver name).
- Four inconsistent Mux stacks: `<mux-video>` raw (Carousel, BackgroundVideo), `MuxVideo` wrapper (BatterySaver), react-player/hls.js (VideoEmbed), plain `<video>` (LazyVideo).
- Duplicate export name `BackgroundVideo` in two files.
- `data` for non-Mux types in the GROQ projection is just the raw `url`; no aspect ratio/thumbnail/poster for YouTube/Vimeo.

## 8. Feature matrix

Legend: Y yes, N no, P partial.

| Feature                     | CarouselBGVideo                                    | BackgroundVideo                         | BackgroundVideoOriginal | MuxVideo                                         | BatterySaverVideo   | LazyVideo            | VideoEmbed                                      | ScrubbedVideo              |
| --------------------------- | -------------------------------------------------- | --------------------------------------- | ----------------------- | ------------------------------------------------ | ------------------- | -------------------- | ----------------------------------------------- | -------------------------- |
| "use client"                | Y                                                  | Y                                       | N                       | Y                                                | N                   | N                    | Y                                               | Y                          |
| Mux/HLS                     | Y (mux-video)                                      | Y (mux-video)                           | Y                       | Y (mux-video)                                    | Y (via MuxVideo)    | N                    | Y (hls.js via react-player)                     | N                          |
| mp4/file URL                | N                                                  | N                                       | N                       | N                                                | N                   | Y (`<source>`)       | Y                                               | N (.fsv only)              |
| YouTube/Vimeo/etc           | N                                                  | N                                       | N                       | N                                                | N                   | N                    | Y                                               | N                          |
| Sanity `video` object input | N (flat props)                                     | N                                       | N                       | N                                                | N                   | N                    | Y                                               | N                          |
| Poster                      | thumbnail.webp time=0 or custom image; blur        | video-as-poster or custom image; blur   | video-as-poster; blur   | poster attr passthrough                          | none                | `poster` string      | none (ignored)                                  | none                       |
| Fade in on ready            | Y                                                  | P (toggle, no transition on image)      | P                       | N                                                | N                   | N                    | N                                               | N                          |
| Autoplay muted playsInline  | Y (play() effect)                                  | Y                                       | Y                       | autoPlay prop + fallback                         | autoPlay (custom)   | autoPlay, auto muted | only via react-player props, playsInline forced | n/a                        |
| Loop                        | Y                                                  | Y                                       | Y                       | Y                                                | Y (passthrough)     | Y                    | via props                                       | n/a                        |
| Lazy load                   | IO 400px (+eager, +safari)                         | IO 400px (+eager)                       | IO 400px                | N                                                | N                   | GSAP ScrollTrigger   | N (ClientOnly only)                             | `enabled`                  |
| Pause offscreen             | N                                                  | N                                       | N                       | N                                                | N                   | N                    | N                                               | scroll driven              |
| Battery saver               | N                                                  | N                                       | N                       | partial (fake ended)                             | Y (overlay + retry) | N                    | N                                               | N                          |
| Reduced motion / data saver | N                                                  | N                                       | N                       | N                                                | N                   | N                    | N                                               | N                          |
| Controls                    | none                                               | none                                    | none                    | passthrough `controls`                           | via MuxVideo props  | none                 | native, default on                              | none                       |
| Events                      | onEnded, onTimeUpdate, onLoadedMetadata, onPlaying | onEnded, onTimeUpdate, onLoadedMetadata | same as BG              | onPlay, onPause, onTimeUpdate, onSeeked, onEnded | MuxVideo's          | onLoad               | all react-player events                         | onReady, onLoaded, onError |
| Error state                 | poster fallback + onEnded                          | poster fallback + onEnded               | same                    | N                                                | overlay             | N                    | N (null)                                        | onError                    |
| Resolution caps             | min/max/rendition order                            | min only                                | min only                | desc rendition order fixed                       | fixed               | n/a                  | none                                            | n/a                        |
| Exposes video ref           | Y (`videoRef`)                                     | N                                       | N                       | Y                                                | Y                   | Y                    | Y                                               | N (canvas)                 |
| SSR approach                | no `<mux-video>` in SSR HTML                       | PosterVideo in SSR                      | PosterVideo in SSR      | client element                                   | client              | `<video>` SSR        | ClientOnly (nothing)                            | canvas                     |
| Styling                     | styled + inline style                              | styled + inline style                   | styled + inline style   | className/style                                  | styled              | className/style      | styled                                          | className                  |
| Used in app/                | N                                                  | N                                       | N                       | N                                                | N                   | N                    | Y (Sample, BlogRich)                            | N                          |

## 9. Not verified

- Nothing was executed or rendered; every behavioral claim is from reading code.
- Whether `data-preload-track` is consumed anywhere (grep found nothing in app/ or library/).
- Whether the library components have call sites in downstream sites (only this checkout was searched).
- Internals of library/scrub (ScrubCanvas, useScrubDriver, sequenceControl, settleFrame, springScrub) and ScrubbedImageSequence were not read; only ScrubbedVideo, its README and CHANGELOG notes.
- Behavior of `@mux/mux-video-react` internals (e.g. how `poster` attr, `preferPlayback`, `_hlsConfig` interact) was not read; only its version and how the repo uses it.
- Section 5 causes of fading are hypotheses; the only confirmed facts are the absence of overlays/gradients in library code and the time=0 / thumbTime / blur-tiling findings.
- Which Sanity docs actually contain `youtube` or non-Mux `video` data (no Sanity access: the Sanity MCP is unauthenticated).
