# Review of video-component-spec-v4.md

Checked against: library/videos/*, library/sanity/reusables.tsx, assetMetadata.ts, SanityImage.tsx, StaticImage.tsx, app/layout.tsx, next.config.ts, library/package.json, node_modules versions, Next 16 docs, plus live curl requests.

Live checks that agree with the spec: YouTube oEmbed returns hqdefault 480x360; maxresdefault and sddefault for jNQXAC9IVRw return 404 with image/jpeg (1097 bytes); Vimeo 76979871 is 404; Vimeo 1084537 oEmbed works (account_type basic); TikTok player/v1 returns 200; Mux low.mp4 404 on both the tagged and untagged playback IDs (supports C1: never build MP4 names). No factual invention found in the sampled provider facts. Problems are mostly internal and stack-related.

## Blockers

B1. Sec 17.1 / 5.x / 4.5: the provider adapter interface is never defined.
Evidence: `ProviderAdapterFactory`, `ProviderCapabilities`, `ParsedSource`, `LookupContext`, `ProviderExtras`, `VideoTrack`, `VideoChapter`, `VideoQuality`, `VideoError`, `VideoLabels`, `MuxDataOptions`, `VideoJsonLdContext`, `VideoObjectJsonLd` are referenced in types and never declared. 17.1 says these are frozen first and pieces A, B, C, D, G all depend on them. Pieces B and C literally write adapters against an undefined contract.
Fix: add a section that gives the full adapter interface (mount(container, source, options) -> { destroy, commands, event subscribe, getMedia }, how command queueing and ready are signalled, how adapters push time/ended/error, how extras are typed) and all missing types. This is the first deliverable of the freeze, not an implicit one.

B2. Sec 9.2 vs 2.1.6 / 2.2.9: uploaded posters through `SanityImage` render a blurred LQIP.
Evidence: library/sanity/SanityImage.tsx lines 253-259 apply `lqipFilter: "blur(24px)"` and a `url(lqip)` background while `!loaded` whenever `src.data.lqip` exists, and track object-fit for it (167). Decision 2.1.6 says no blur placeholder ever. Spec 9.2 says to use SanityImage and states it "renders a plain img".
Fix: either strip `lqip` from the poster object before passing it (pass `{...poster, data: {...poster.data, lqip: null}}`, check the projection) or add a `placeholder="empty"` opt-out to SanityImage in library (generic, mention in CHANGELOG). Decide which and put it in 9.2.

B3. Sec 4.1 vs 5.2 / T3 / T4 / S3: contradictory SSR model for the `<video>` element.
Evidence: 4.1 layer 2 lists native `<video>` as provider layer, mounted after hydration and dynamically imported, with the server layer being only wrapper, poster and JSON-LD. But 5.2 ("Autoplay uses JSX muted ... React does not render the muted attribute"), T4 ("SSR HTML of a muted video contains the muted attribute"), S3 and T3(b) assume an SSR-rendered video. Also 4.2 mainContent cites Google's "video must appear in the rendered HTML" while the element only appears after hydration (admitted NOT VERIFIED).
Fix: choose. Option 1: native `<video>` (file, and Mux without hls.js need) is SSR-rendered with muted/playsinline/preload so autoplay works pre-hydration and mainContent is truthful; custom-element providers mount client-side. Option 2: delete T4, S3 and the React#10389 paragraph and keep everything client mounted. Update 4.1, 5.2, 16 consistently.

B4. Sec 13 / 14.1 `config.ts` (`configureVideo`) cannot work as described on this stack.
Evidence: Next RSC has separate server and client module graphs. If `configureVideo({ analytics: true, canTrack })` is called in app/layout.tsx (a server component, as the only natural place) it mutates the server copy of the module; the client UniversalVideo never sees it. `canTrack` is a function and cannot cross the server-to-client boundary as a prop either.
Fix: make the site config a client provider component (`<VideoConfigProvider>` in "use client" inside GlobalProviders, app/components/Providers) or require `configureVideo` to be called from a "use client" module imported by Providers. Say so in 13 and 14.1.

B5. Sec 17.2: file ownership gaps and a missing piece.
Evidence: `providers/parse.ts` and `providers/registry.ts` have no owner (E and F depend on parse.ts; registry is only "interface frozen"). `library/package.json`, `types.ts` runtime-free ownership, `LIMITATIONS` text, `controller/events.ts` (G depends, A owns) are unassigned. Section 20 requires a `videoTestCase` document type (starter sanity schema registration plus typegen), `scripts/seed-video-tests.ts`, a playground panel and a GSAP ScrollTrigger demo; none appears in 14.1/14.2 or any piece. H owns "app/visual-tests/video/page.tsx" while Sec 20 puts the showcase at `/visual-tests/universal-video` (see M1).
Fix: add owners: parse.ts to F (it is freeze-adjacent, plain TS, small; or freeze it), registry.ts to A, package.json to A at start, a new piece I (videoTestCase schema, seed script, showcase page and playground), events.ts to A with its type frozen.

## Major

M1. Sec 14.2 / 16 / 17 H vs Sec 20: two different acceptance pages.
Evidence: 14.2, 16 header and T3 say the acceptance page is `app/visual-tests/video/page.tsx` (exists, untracked per git status); Sec 20 says new page `/visual-tests/universal-video` and the old one at `/visual-tests/video` stays until migration finishes, then is removed. Sec 20 also demands Sanity-backed data with a seed script that writes to the dataset with SANITY_SEED_TOKEN.
Fix: pick one. Recommended: keep `/visual-tests/video` as old-component comparison (untouched), create `/visual-tests/universal-video`, repoint 14.2, 16, T3, T10 and piece H. State that the seed script writes to the live dataset and needs the user to run it (token), so the page must render a clear empty state without it.

M2. Sec 20 includes Cloudflare; Sec 2.1.7, C8, VideoProvider and 6.1 exclude it.
Evidence: showcase scenarios list "Cloudflare"; `VideoProvider` has no cloudflare; library/package.json already contains `"cloudflare-video-element": "1.3.6"`.
Fix: drop Cloudflare from Sec 20 and from library/package.json (or reverse decision 2.1.7 explicitly). Also add HLS and DASH rows: dash-video-element is in 4.1 and 14.4 but is not installed or pinned (ls library/node_modules shows no dash-video-element).

M3. Sec 3 C15 / 14.4 / Sec 0 "Nothing is built": stale.
Evidence: library/package.json is already modified with exact pins (`@mux/mux-video 0.31.6`, youtube 1.9.1, vimeo 1.7.4, hls 1.5.12, wistia 1.4.0, twitch 0.2.0, tiktok 0.1.2, spotify 1.0.5, cloudflare 1.3.6), and installed versions match those, not the "installed" list in C15 (youtube 1.9.0, vimeo 1.7.2, hls 1.5.11, twitch 0.1.6, spotify 1.0.4). `@mux/mux-video-react` is still a dependency used by the old MuxVideo and is not mentioned in 14.4.
Fix: update C15 and 14.4 to the actual pinned set; say whether `@mux/mux-video-react` is removed once compat forwards to UniversalVideo; note TikTok is pinned at 0.1.2 so the BASIC findings apply but twitch/spotify findings from ELEM (0.2.0/1.0.5) are the right ones.

M4. Sec 10.2 / 10.1 / S4: wrong module for the `lcp` options augmentation.
Evidence: `interface ObjectOptions` is declared in `@sanity/types` (node_modules/.pnpm/@sanity+types@6.1.0.../lib/index.d.ts:731), not in `sanity`. `declare module "sanity"` will not merge with it. Spec marks it NOT VERIFIED but the specified target is wrong.
Fix: use `declare module "@sanity/types" { interface ObjectOptions { lcp?: boolean } }` (confirm @sanity/types is resolvable from library/ or add it), file placed under library/sanity/video/. Keep S4 as a confirm step.

M5. Sec 10.1 vs 5.2: prop and field naming clashes with no mapping.
Evidence: Sanity `captions` is an array of tracks, the component prop `captions` is `"off" | "on"`, Sanity has `captionsDefault`; Sanity `mode`, `loop`, `muted`, `controls`, `title`, `mainContent`, `jsonLd`, `transcript`, `chapters` exist on `video` while the component has both `video` and the same props. Precedence (prop vs `video.*`) is undefined. Sec 10.1 `controls` values ours/provider/none vs prop `boolean | "provider"`. `sourceType: "url"` has no provider; VideoProvider has no "url" (file/hls/dash or a pasted YouTube URL?).
Fix: add a table "video field -> prop -> default" and state precedence (explicit prop wins over video field). Define the `sourceType` to `ResolvedSource` resolution function (`resolveSource(video)` in parse.ts) including `url` -> file|hls|dash and whether a pasted YouTube URL under "Video URL" resolves to YouTube.

M6. Sec 5.2 / 4.2 / 7: YouTube blocked or autoplay overlay violates the spec's own YouTube no-overlay rule.
Evidence: 4.1 point 3 forbids anything in front of the YouTube iframe; 5.4 says `PlayOverlay` is shown in `blocked`. In `blocked` the iframe is mounted and the overlay would sit on it. Same for the `Loading` indicator.
Fix: for YouTube, `blocked` re-shows the facade (unmount the iframe or hide it) rather than overlaying, or render PlayOverlay in the below-column. State it in 4.3/5.4.

M7. Sec 4.1 / 5.4 / 14.1: `VideoJsonLd` is called a server component but is rendered by a "use client" root.
Evidence: 12.1 says "VideoJsonLd is a server component"; 4.2 says UniversalVideo (marked "use client" in 14.1) renders it automatically for `mainContent`. A server component cannot be imported into a client module; it would silently become a client component (still SSR'd, so output works, but the "no network, static" and server-only claims are moot).
Fix: say `VideoJsonLd` is a plain, non-async component without a directive that works in both, or let section code render it from the server (and drop "automatic" inside UniversalVideo, or have UniversalVideo accept `jsonLd` as children from the server parent).

M8. Sec 9.1.3 / 7: states with no poster for Mux/file leave an empty box.
Evidence: 9.1.3 relies on the video's first frame for non-hero Mux/file with no upload. Reduced motion ("poster only"), data saver ("poster only, preload none"), `blocked` ("poster + play overlay"), and `error` ("poster only") have no frame to show because the element is not loaded or not painted.
Fix: in those states fall back to the Mux thumbnail (known tradeoff, warn once) or to a thumbnail from `thumbTime`; for plain files require `poster`. Put it in 9.1 as rule 3b.

M9. Sec 8 / 7: React Compiler and controller lifetime unspecified.
Evidence: next.config.ts has `reactCompiler: { panicThreshold: "all_errors" }`. Spec says "module singleton" observer, external store, `createController`, `play` prop that "counts as manual control", and "ref callback with cleanup" but does not say where the controller instance lives. Creating it with `useRef(create())` or reading `ref.current` in render is a compiler error; the `play`/`muted`/`startTime` props must be forwarded to the controller imperatively somewhere (effect) and the spec says "no setState in effect bodies" without saying how prop-to-controller sync happens. AGENTS.md also requires computing `??`, `?.`, ternaries, template literals above any `try` (the `play()` promise handling, retries, JSON parse in providers).
Fix: add a short "React Compiler rules for this feature" paragraph: controller created via `useState(() => createController())`, prop sync via `useEffect` calling controller methods (allowed), all derived values computed before try/catch, no module-level mutable state read during render, singleton observer only touched in effects/ref callbacks.

M10. Sec 11.4: public unauthenticated route has two amplification issues beyond "no caller URLs".
Evidence: `kind=copy` returns arbitrary-size image bytes from provider hosts on every call (bandwidth proxy on the site's Vercel plan); `referer=` is a caller-supplied header value forwarded to Vimeo (spec also says send the site URL, so the param is contradictory and unnecessary); any origin can call it (no CORS or Sec-Fetch-Site check).
Fix: remove the `referer` param (use siteURL), cap copy size (reject over e.g. 5 MB, content-type image/*), reject when `Sec-Fetch-Site` is not same-origin, or only enable in draft mode; keep O3 but give the recommended default.

M11. Sec 16 header / AGENTS.md: instruction conflicts about running checks.
Evidence: root AGENTS.md says lint once at end, never `pnpm build` on own initiative; library/CLAUDE.md says lint/format only after explicitly asking the user and waiting. Spec says "the user already approved builds and spikes (MEM PROGRESS)" and 9 spikes need builds (S1, S2, T5). Implementers in parallel pieces (8 of them) will each run lint/build.
Fix: put in 17: only the integrator (H) runs lint/build, once; spikes that need a build are run by one agent and results shared; cite where the approval was given or ask again at the start of the session.

## Minor

m1. Sec 2.2.1 vs 4.2: 2.2.1 says "click mode defaults to a facade", 4.2 table says Mux and file in click mode mount the element near the viewport with no facade. Fix: 2.2.1 should say "iframe providers".

m2. Sec 4.2 vs 5.2: background mode says "Controls: none" but `showPause` default true renders a pause control, while 5.2 says default `controls` is false for background. Fix: state that `showPause` renders a single PlayButton independent of `controls`.

m3. Sec 10.1 `mode` options: `autoplay` is offered for Spotify though 6.1 says muted autoplay N and background is hidden. Fix: hide `autoplay` mode when `autoplay` feature is `no`. Also define what `Support = "unverified"` ("?" cells) does to parts (hide? show best-effort?). 6.1 uses `?` while the type has "unverified"; with the scope rule "every officially supported feature" the `?` cells for YouTube PiP/quality, Mux quality select, Wistia captions silently drop features. Fix: list the `?` cells as spike items with an owner, or declare them hidden until verified.

m4. Sec 13: "the YouTube row can be excluded with `analytics={{ ... }}` off per video" is unsupported: `VideoAnalyticsOptions` has no provider exclusion. Fix: use `analytics={false}` per video, or add `providers?: VideoProvider[]`.

m5. Sec 8.1 / 7: concurrency cap 3 for trigger-driven videos with no queue: a 4th visible background video simply never plays, and nothing resumes when a slot frees. Fix: define a FIFO wait list or exempt background-mode muted videos without audio.

m6. Sec 5.3: `play({origin: "user"|"external"})` vs `wantedOrigin: "trigger"|"manual"` are two different vocabularies without a mapping.

m7. Sec 15 LazyVideo: current LazyVideo imports `usePreloader` from library/link and `ScrollTrigger` from gsap; spec says wrapper keeps the preloader gate and drops GSAP. That is fine and generic (usePreloader is in library/link), but "no GSAP dependency inside the library path" is false for the wrapper until rewritten; state that the compat wrapper replaces ScrollTrigger with `loadMargin`.

m8. Sec 14.1 `UniversalVideo.css.ts` / parts: no mention that every `css` use needs `f.responsive` or `f.unresponsive`, that Capsize pseudo-element text styles apply only to the element directly containing text (CurrentTime/Duration/Transcript/labels) and not to Controls/flex wrappers, and `f.small` not `f.mobile`. 24x24 target "CSS px token" should be `f.unresponsive`. Runtime values (scrubber progress, buffered range, volume fill, aspect ratio, cue position) must use `tokens`; add this list to the Controls piece brief since a progress bar is the classic inline-style trap.

m9. Sec 5.2 `poster?: SanityImageData<"false"> | StaticImageData` and 9.2: StaticImage string branch needs `width` and `height` and forbids `priority`; spec says so correctly, but `fetchPriority="high"` passes via `ImgHTMLAttributes`, confirmed OK. `SanityImage` has no `priority` prop either (confirmed). No fix needed; ensure implementer uses `loading="eager"` + `fetchPriority="high"`.

m10. Sec 12.2: `embedUrl` for TikTok uses the player URL (`/player/v1/{id}`), which Google may not accept as an embed page; mark best effort. `thumbnailUrl` for Mux uses the lifted thumbnail, contradicting the poster-quality reason for B2 workaround; note it in 12.2 or prefer `posterImage`.

m11. Sec 11.3 Generate from source: "ISO already" for YouTube duration scraped from the watch page and Wistia `/embed/medias` are flagged best effort (good). `jsonLd.uploadDate` for Vimeo "date only" vs JSON-LD requires ISO 8601 with date; fine but say the validation accepts date-only.

m12. Sec 16 T3(c) imports `capabilities.ts`/`parse.ts` "inside sanity schema extract": `capabilities.ts` imports `VideoProvider` from types.ts which is fine, but `reusables.tsx` currently imports `MATCH_URL_*` from react-player; once removed, check library/sanity has no remaining react-player import so react-player can be dropped from the starter later.

m13. Sec 9.4 / 10.4: Studio warning text for Mux says thumbnails "can look lighter than the video" while C3 is OPEN on whether browsers render the video crushed. Soften the copy until T10 is run (the warning copy asserts the direction).

## Convention check summary (AGENTS.md / library/CLAUDE.md)

- No inline styles: spec states the rule; gaps are in m8 (progress/volume/buffer/cue tokens) and the Studio custom input note (good: do not copy `calloutField`).
- Comment style: samples are consistent (JSDoc on props only). `VideoController`, `VideoState` and `UniversalVideoHandle` have no JSDoc, acceptable. Spec 14.1 mandates "no section comments" only in Sec 20; add to freeze brief.
- Sanity-inferred types: `VideoField` is hand-written in assetMetadata.ts (spec admits and edits by hand); new `thumbnail`, `captions`, `jsonLd`, `chapters` fields will be typed by hand there while `sanity.types.ts` regenerates. Ensure the lint typegen/projection check passes (check-section-projections.ts). `video` projection `{ ..., muxVideo, posterImage }` already spreads new fields, as the spec says, but `captions[].file` needs `file->` (spec covers).
- No `any`: not stated for adapter code that wraps untyped custom-element methods (`setOption`, `loadEntity`). Add "casts only at the documented external boundary, typed in providers/*" to the freeze brief.
- StaticImage/SanityImage: covered, except B2 (LQIP).
- SVG: PlayOverlay icon via `*.inline.svg` is correct; the Turbopack rule is in next.config.ts, but icons in library/ are shared across sites, so each site's config must have the same rule (it is the starter's rule); note in CHANGELOG.
