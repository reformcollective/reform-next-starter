# UniversalVideo: implementation spec (draft 6, 2026-10-27)

Supersedes video-component-spec-v5.md (and earlier drafts). Draft 6 applies the final user decisions O1 to O5 (section 19) on top of draft 5, which applied video-spec-v4-review.md; section 0.1 lists every finding and how it was resolved. Section 19 also holds the final decisions log. The component is not built yet. The media-element packages are already pinned and installed (library/package.json has uncommitted exact pins; section 14.4) and a build importing all nine on Next 16 passed [CALLER; package.json and node_modules read this session]. Work continues on the existing `universal-video` branches (starter off main, library/ off next-main), both unpushed. Delivery is one session, split into parallel pieces (section 17).

Audience: engineers implementing today. Every fact carries a source tag. Anything without a tag is a design choice by this spec (marked JUDGMENT) or is listed in section 18 (NOT VERIFIED).

## 0. How to read this spec

Source tags (all files are in the scratchpad folder, `.../e6b72631-5a51-408b-8260-f5e0e30420e8/scratchpad/`):

| Tag    | File                                                                                                                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V3     | video-component-spec-v3.md (base)                                                                                                                                                                               |
| BASIC  | video-basic-tier-verify.md (TikTok, Twitch, Spotify)                                                                                                                                                            |
| MUX3   | video-mux-verify-3.md                                                                                                                                                                                           |
| META   | video-metadata-verify.md                                                                                                                                                                                        |
| BUNNY  | video-bunny-deep-dive.md                                                                                                                                                                                        |
| PROV2  | video-provider-verify-2.md (YouTube, Vimeo, Cloudflare, Wistia)                                                                                                                                                 |
| SNV    | video-sanity-next-verify.md                                                                                                                                                                                     |
| FEAT   | video-features-catalog.md                                                                                                                                                                                       |
| POST   | video-posters-verify.md                                                                                                                                                                                         |
| ELEM   | video-elements-verify.md                                                                                                                                                                                        |
| REL    | video-reliability.md                                                                                                                                                                                            |
| PROBE  | video-live-probe.md                                                                                                                                                                                             |
| HAND   | HANDOFF-video.md                                                                                                                                                                                                |
| MEM    | memory file project_universal_video_component.md (WORK LIST and PROGRESS sections)                                                                                                                              |
| INV    | video-inventory.md (not in the input list; read for the old components' props)                                                                                                                                  |
| CALLER | the brief that requested this draft                                                                                                                                                                             |
| REVIEW | video-spec-v4-review.md (independent review of draft 4)                                                                                                                                                         |
| REPO   | files read in this checkout while writing draft 5 (library/package.json, library/sanity/SanityImage.tsx, library/StaticImage.tsx, next.config.ts, app/components/Providers/index.tsx, @sanity/types index.d.ts) |

Labels: VERIFIED = a report says it read a primary source or observed it live. JUDGMENT = this spec's design choice. NOT VERIFIED = section 18. Docs can be wrong: where a live check and a doc disagree, the live check wins and the disagreement is logged in section 3 (standing rule, V3).

Code samples follow the repo comment rule: JSDoc on props only, no other comments. No inline styles anywhere (AGENTS.md); runtime values use the `styled` `tokens` feature, so implementers must read `library/styled/README.md` before writing any CSS.

### 0.1 Review resolution (draft 4 to draft 5, amended in draft 6)

Each review finding was checked against the repo before being applied. All findings were confirmed except where noted.

| Finding                                     | Resolution                                                                                                                                                                                                                                                                              | Section                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| B1 adapter interface undefined              | Frozen interface section with every referenced type in TypeScript                                                                                                                                                                                                                       | 5.5                                |
| B2 poster LQIP blur                         | New generic `noLqip` prop on `SanityImage` (library); provider posters use plain `<img>`                                                                                                                                                                                                | 9.2                                |
| B3 SSR contradiction                        | Server layer renders only wrapper, aspect-ratio, poster `<img>`, JSON-LD; custom elements and `<video>` are client-created; T3, T4, S3, 5.2, 16 aligned                                                                                                                                 | 4.1, 5.2, 16                       |
| B4 `configureVideo` across the RSC boundary | `VideoConfigProvider` client component mounted in the starter's `"use client"` Providers file                                                                                                                                                                                           | 13, 14.1                           |
| B5 ownership gaps                           | Owners for parse.ts, registry.ts, events.ts, package.json, capability table, LIMITATIONS, whole showcase (new piece I)                                                                                                                                                                  | 17                                 |
| M1 two acceptance pages                     | `/visual-tests/universal-video` is the acceptance page; `/visual-tests/video` stays as old-component comparison                                                                                                                                                                         | 14.2, 16, 20                       |
| M2 Cloudflare and DASH                      | Cloudflare is in (pinned 1.3.6); `dash-video-element` dropped (not installed)                                                                                                                                                                                                           | 2.1.7, 6.1, 14.4                   |
| M3 stale pins                               | C15, 14.4 and section header updated to the real pins; `@mux/mux-video-react` handled                                                                                                                                                                                                   | 3, 14.4                            |
| M4 wrong module for `lcp`                   | `declare module "@sanity/types"` (interface verified there); package not resolvable from the starter root today, so it must be added as a dependency                                                                                                                                    | 10.1, 14.4                         |
| M5 field/prop clashes                       | Field to prop table, precedence rule, `resolveSource`                                                                                                                                                                                                                                   | 10.5                               |
| M6 YouTube blocked overlay                  | `blocked` re-shows the facade for YouTube; no overlay on the iframe                                                                                                                                                                                                                     | 4.3, 5.4                           |
| M7 `VideoJsonLd` server/client              | Plain component with no directive, valid in both                                                                                                                                                                                                                                        | 12.1                               |
| M8 empty box states                         | Poster-by-state table                                                                                                                                                                                                                                                                   | 9.1 rule 3b, 9.5                   |
| M9 React Compiler and controller lifetime   | Rules and lifetime defined                                                                                                                                                                                                                                                              | 8.3                                |
| M10 lookup route abuse                      | `referer` param removed, size cap, `Sec-Fetch-Site`, timeouts; O3 DECIDED: no authentication, these safeguards only                                                                                                                                                                     | 11.4                               |
| M11 conflicting check instructions          | One runner for lint, one for builds, per AGENTS.md                                                                                                                                                                                                                                      | 16, 17.4                           |
| m1 to m13                                   | Applied (facade wording, `showPause`, hidden unverified features, YouTube exclusion, FIFO wait list, origin vocabulary, compat note, styling brief, TikTok embed note, date-only validation, react-player check, softened Mux copy)                                                     | various                            |
| m9                                          | No change needed (review agrees)                                                                                                                                                                                                                                                        |                                    |
| Draft 6 (O1 to O5)                          | O1 Mux Data on by default, forced off by `canTrack()` false or GPC; O2 VideoEmbed mapped subset only; O3 route has no authentication; O4 uploaded YouTube poster allowed, no warning; O5 no Sanity captions or transcript fields, S6 and S7 removed, captions come only from the source | 5.2, 5.4, 10, 11, 13, 15, 16.2, 19 |
| Review suggestion to drop Cloudflare        | Overruled by CALLER: Cloudflare stays                                                                                                                                                                                                                                                   | 2.1.7                              |

## 1. Goal and scope rule

One `UniversalVideo` in `library/videos/` replaces seven components: CarouselBGVideo, BackgroundVideo, BackgroundVideoOriginal (dead, name collision), MuxVideo, BatterySaverVideo, LazyVideo, VideoEmbed [INV 0]. ScrubbedVideo stays separate [INV 2.8]. Cross-browser, safe in carousels (many instances, mount/unmount churn, cloned slides), backward compatible, unstyled-but-functional controls, limitations stated openly.

Scope rule (user, 2026-10-27): for every source we include, include literally every feature that source officially supports. There are no must/should/could/defer buckets for supported features. What is excluded is only (a) what a source cannot do (controls hide, section 6) and (b) things that are not integration features (section 17.3, listed so the user can overrule).

## 2. Decisions

2.1 Locked in earlier sessions (V3 section 2, unchanged unless noted):

1. Name `UniversalVideo`.
2. Thin controller over Mux's media elements. Not Video.js 10, not Media Chrome, not react-player.
3. Hand-written, unstyled, fully functional compound parts plus a `useVideo()` hook; one standard part interface; one PlayButton toggle.
4. Backward compatible: old props and export names stay as deprecated aliases forwarding to the new component.
5. No carousel mode, but a real carousel test (cloned slides, rapid mount/unmount) and a Safari hidden-video test are required.
6. NO blur placeholder, ever (no blur-up, LQIP, `videoBlurUrl` backgrounds). Nothing shows while a poster loads. `priority` and `eager` supported, default lazy.
7. Managed hosting stays Mux. No Bunny or api.video in the schema; no Sanity file assets (they burn Sanity usage). Cloudflare Stream is supported as an embedded source by URL (`cloudflare-video-element` is already pinned, section 14.4), not as a managed upload workflow. A plain file or HLS URL stays supported; DASH is not supported (`dash-video-element` is not installed) [V3 decision 13].
8. YouTube background mode allowed with a dev warning.
9. Capability table is one plain-TypeScript module imported by both the Sanity schema and the component.
10. Cached components stay off.
11. Poster: uploaded override wins; Studio lookup stores the provider thumbnail URL (no copy); explicit "Save a copy to Sanity" button; copy terms are unclear [V3 section 6].

2.2 New decisions (user, 2026-10-27), which override older text where they conflict:

1. Load behavior. `autoplay` and `background` modes load the real player directly (no facade). `click` mode defaults to a facade for iframe providers (Mux and file mount the element near the viewport instead, section 4.2). A per-video `mainContent` option loads the player eagerly and emits VideoObject JSON-LD. JSON-LD is optional: a helper, plus automatic for `mainContent`. The Studio gets a "Generate from source" button that fills only what each source reliably provides and never overwrites editor text silently. Supersedes V3 decision 8 and V3 section 15 items 2 and 5 [MEM WORK LIST A.1, A.4].
2. Basic tier for Twitch, TikTok, Spotify: every feature each officially allows, per-source matrix from provider docs and live checks (section 6). Controls hide what a source cannot do, because several media-element wrappers silently no-op (TikTok volume, Spotify muted/volume) [BASIC 1e, 3d; ELEM 2.3, 2.4].
3. Triggered playback: built-in `trigger` (inView with threshold, rootMargin, once, pauseWhenOut) plus a controller (play/pause/seek/setMuted through ref and `useVideo`) so custom GSAP ScrollTrigger or IntersectionObserver code can drive it. One shared wanted-state: manual control makes the built-in trigger step aside. No GSAP-specific built-in.
4. Analytics: opt-in `analytics` switch, off by default. Push normalized events only when `window.dataLayer` already exists. Tag managers come from Sanity `settings.tags[].embed`; nothing hard-coded; the component never creates `dataLayer`. Optional `canTrack` veto. GPC is Firefox-only, a bonus signal only [META GPC].
5. No Sanity captions field and no transcript field (O5, DECIDED). Captions are only whatever the source already carries: Mux asset text tracks (in the HLS manifest), HLS, YouTube, Vimeo, Wistia and Cloudflare own tracks. The controls show a caption button only when tracks exist.
6. One-session delivery; no multi-phase calendar. Supersedes V3 section 13 phases and section 12 buckets (DRM is no longer "defer").
7. The existing `youtube` schema type (library/sanity/reusables.tsx, [INV 4]) stays untouched and unused by UniversalVideo.
8. No generic oEmbed fallback now; design so one can be added (section 4.5).
9. Posters: NO blur placeholders. Mux thumbnails of untagged assets are lifted (brightness mapped 16 + 0.859 * v, measured twice, no Mux parameter fixes it) [MUX3 13; MEM PROGRESS]. Poster strategy follows V3 decision 14 (section 9). Re-encode to limited range is a documented workaround.

## 3. Conflict register (sources that disagree, with resolution)

"Resolved" = a later or live source decides it. "OPEN" = nobody has decided it; the spec says what to do meanwhile.

| #   | Conflict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Sources                              | Status and what the spec does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Mux static MP4 names. MUX3 found `low/medium/high.mp4` returning 200 (Range 206) on assets `DS00Spx1...` and `MECFZgEm...`, and 404 for `highest/capped-1080p/1080p/720p...`. CALLER reports `low/medium/high.mp4` 404 on playback ID `00dcym00XaHxqy7BJMgsjIe01trdJH8VIzWfBJqoffRd02o` (that observation is in the brief, not in any report file).                                                                                                                                               | MUX3 12, CALLER                      | Resolved as per-asset. Static renditions depend on how each asset was created (legacy `mp4_support` low/medium/high vs new `static_renditions` `highest.mp4`/`audio.m4a`/explicit resolutions, MUX3 12). The component never builds an MP4 URL from a name. It reads `data.static_renditions.files[]` from the Sanity Mux asset (the type has it, META Mux) and uses an MP4 only if listed. Whether stored data actually contains that array for these assets is NOT VERIFIED.                                                                                                                                                                                                                                                                    |
| C2  | Description of asset `DS00Spx1CV902MCtPj5WknGlR102V5HFkDe`: MUX3 says 1920x1080, 134.4 s, 60000/1001 fps, "Big Buck Bunny style", ladder top 1080p; HAND and V3 say 1280x720, live action, person kneeling in a desert, letterboxed.                                                                                                                                                                                                                                                              | MUX3 header and 12, HAND, V3 6       | OPEN. Does not change the design. Re-run ffprobe before quoting any number from this asset.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| C3  | Mechanism of the Mux fade. V3/HAND hypothesis: thumbnails of untagged assets are squeezed into 16-235 while the video is not. MUX3: the source is effectively full-range and untagged; Mux images map Y as 16 + 0.859 * Y; the video carries no range flag and how browsers render it was not measured. Both explain the same measured lift (blacks 0 to 16). The tagged demo asset shows no difference (0.3 to 2.2 mean luma). A third asset `00dcym...` showed mean luma ~37 vs ~24 (about 13). | V3 6, MUX3 13, PROBE 8, MEM PROGRESS | Partly resolved: all agree the lift is real for untagged assets and absent for tagged ones, and that no Mux param fixes it (21 candidate params returned byte-identical output, MUX3 13.6). OPEN: whether browsers show the video crushed or correct; the re-encode fix (section 9.4) is the only fix proposed and is itself NOT VERIFIED end to end.                                                                                                                                                                                                                                                                                                                                                                                             |
| C4  | Mux chapters. V3 lists "chapters (VOD)" as a Mux capability; MUX3 found no Mux-hosted chapters in the manifest or image API. `<mux-video>` has a JS API `addChapters()` only.                                                                                                                                                                                                                                                                                                                     | V3 3, MUX3 4                         | Resolved: chapters data comes from Sanity (section 10) or a WebVTT `kind="chapters"` track and is fed to `addChapters()`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| C5  | Mux `placeholder`, `default-duration`, `hotkeys`, `playbackrates`. FEAT treats some as useful with `preload=none`. MUX3 shows they are `<mux-player>` attributes, not `<mux-video>`.                                                                                                                                                                                                                                                                                                              | FEAT E, MUX3 0 and 5                 | Resolved: not available on mux-video; we re-implement what we need. `placeholder` is dropped entirely (no blur, decision 2.2.9).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| C6  | Spotify as audio only. V3 and FEAT say "not video / audio only". BASIC shows a video variant (`/embed/{type}/{id}/video`, `preferVideo`, HTTP 200) and ELEM notes `preferVideo`.                                                                                                                                                                                                                                                                                                                  | V3 3, FEAT G, BASIC 3a, ELEM 2.4     | Resolved: audio-first with a video variant for eligible items. Aspect ratio comes from the embed (152 or 352 high, BASIC 3a).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| C7  | TikTok volume. ELEM/BASIC: element setter is a warn-only stub; docs list no set command. BASIC found an undocumented `setVolume` (0..100) in the live player bundle, not tested at runtime.                                                                                                                                                                                                                                                                                                       | ELEM 2.3, BASIC 1c                   | Resolved by policy: volume capability is `no` (undocumented means unsupported by contract). Volume is read-only from `onVolumeChange`. Revisit only after a runtime test.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| C8  | Cloudflare SDK host and events. V3: older host impact NOT VERIFIED, no event API (FEAT). PROV2: both hosts serve the identical 18653-byte file, same etag; docs describe an event API.                                                                                                                                                                                                                                                                                                            | V3 3, FEAT G, ELEM 3, PROV2 C        | Resolved: both hosts serve the same SDK file; Cloudflare is an embedded source (decision 2.1.7). The adapter uses the element's host and the docs host is not required. Which host stays valid long term is NOT VERIFIED.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| C9  | Vimeo plan gating. Help article says `background` and `controls=0` need a paid plan. PROV2 observed both reflected in the player config of a "basic" account video. Whether the player honors them visually was not tested.                                                                                                                                                                                                                                                                       | PROV2 B2, B1, B discrepancies        | OPEN. Spec: do not hard-disable these options; the Sanity description says "may need a paid Vimeo plan" and the visual test page includes a basic-account video.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| C10 | Vimeo thumbnail sizing. POST: NOT VERIFIED that `width` resizes the thumbnail. PROBE: measured; `width=640` changes `thumbnail_url` to `-d_640` (640x360) and the path suffix accepts `-d_1280x720` (real 1280x720 JPEG).                                                                                                                                                                                                                                                                         | POST 2, PROBE 2                      | Resolved by the live probe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| C11 | YouTube thumbnail rule. V3/MEM retracted the quote "the video thumbnail must not be altered" as nonexistent. POST lists it as VERIFIED (via fetch-tool summary) from developers.google.com/youtube/terms/developer-policies-guide, together with "Custom play buttons over the YouTube thumbnail are acceptable, but tapping must initiate playback".                                                                                                                                             | V3 6, MEM, POST 4                    | OPEN. Re-read that page raw (curl, not the summarizing fetch tool) before relying on either claim. Meanwhile: the YouTube facade shows the provider thumbnail unmodified (cropped by `object-fit` only). O4 DECIDED: an uploaded poster on a YouTube video is allowed with no warning and no block; editors just choose.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| C12 | Blur placeholders. REL recommends LQIP/blur; MUX3 suggests building our own `placeholder` blur; the old components use `videoBlurUrl`.                                                                                                                                                                                                                                                                                                                                                            | REL 2, MUX3 5, INV                   | Resolved: superseded by decision 2.1.6. `videoBlurUrl` is accepted and ignored.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| C13 | Poster via next/image. REL recommends `Image priority`. SNV: in Next 16 `priority` is deprecated in favor of `preload`; remote hosts need `remotePatterns`; `next.config.ts` has none.                                                                                                                                                                                                                                                                                                            | REL 2, SNV 4                         | Resolved: provider thumbnails render as a plain `<img>` (the `StaticImage` string branch already does, needs width and height); `priority` maps to `loading="eager"` plus `fetchPriority="high"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| C14 | Bunny "plays as plain HLS". V3 says yes. BUNNY A15: the demo library returned 403 on playlist, variants, MP4 and thumbnail without a `Referer` header (200 with one).                                                                                                                                                                                                                                                                                                                             | V3 3, BUNNY A3, A15                  | Resolved, with the caveat now recorded: plain HLS works only when the library's referrer rule allows the site. Bunny is not in the schema (decision 2.1.7).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| C15 | Media-element versions. Draft 4 listed older installed versions.                                                                                                                                                                                                                                                                                                                                                                                                                                  | HAND, BASIC, ELEM, REPO              | Resolved. library/package.json pins exact versions, and `library/node_modules/*/package.json` reports the same: `@mux/mux-video` 0.31.6, `hls-video-element` 1.5.12, `youtube-video-element` 1.9.1, `vimeo-video-element` 1.7.4, `wistia-video-element` 1.4.0, `twitch-video-element` 0.2.0, `tiktok-video-element` 0.1.2, `spotify-audio-element` 1.0.5, `cloudflare-video-element` 1.3.6 (also `@mux/mux-video-react` ^0.31.6 for the old MuxVideo). BASIC read TikTok 0.1.2 (matches), Twitch and Spotify findings from ELEM (0.2.0, 1.0.5) are the applicable ones, the BASIC reads of Twitch 0.1.6 and Spotify 1.0.4 are superseded (re-diff the members in section 6.2 during build). `dash-video-element` is not installed and is dropped. |
| C16 | SSR import. HAND says an own check imported "all 9 media elements" in plain Node with no DOM globals. ELEM could only read statically.                                                                                                                                                                                                                                                                                                                                                            | HAND, ELEM 4, CALLER                 | Mostly resolved by design: element packages are reached only through dynamic `import()` inside adapters on the client (section 4.1), so no server module imports them. CALLER reports a production build importing all nine on Next 16 passed (no report file holds this). Remaining: S2 is reduced to a static check that no provider module is reachable from a server-importable module.                                                                                                                                                                                                                                                                                                                                                       |
| C17 | YouTube oEmbed CORS. POST: NOT VERIFIED. PROBE and META: reflects the request Origin; no header without an Origin; thumbnails `*`.                                                                                                                                                                                                                                                                                                                                                                | POST 1, PROBE 1, META                | Resolved. We still fetch server-side (watch-page scraping needs it anyway).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| C18 | Mux storyboard 404s seen earlier vs MUX3 200s.                                                                                                                                                                                                                                                                                                                                                                                                                                                    | MEM, MUX3 1                          | Resolved: the earlier requests used a wrong host, lowercased ID, bare path or `.gif`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| C19 | Static analytics scope. V3 section 8 proposed analytics possibly on by default; MEM decided opt-in. Mux Data is separate and auto-on in `<mux-video>` unless `disable-tracking` (MUX3 11).                                                                                                                                                                                                                                                                                                        | V3 8, MEM A.3, MUX3 11               | Analytics resolved opt-in. Mux Data default is decided by O1 (section 19): on, forced off when `canTrack()` is false or GPC is true.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| C20 | Facade scope. V3 decision 8: YouTube and Vimeo facade by default with an "autoplay mode". New decision: autoplay/background load the player directly.                                                                                                                                                                                                                                                                                                                                             | V3 2, section 2.2                    | Resolved: the new decision wins.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## 4. Architecture

### 4.1 Layers

1. Server-rendered layer (this section wins over any other statement about SSR). `UniversalVideo` is a `"use client"` root, so it also runs during the server render. What it emits in that render is only: the wrapper with CSS `aspect-ratio`, the poster `<img>`, and `<VideoJsonLd>` for `mainContent`. No `<video>`, no custom element and no iframe is ever in the server HTML. Nothing branches on `window` or `navigator` during render. No `ClientOnly` (the old VideoEmbed's `ClientOnly` meant no SSR and a blank frame until hydration, INV 2.7). The Carousel component's hydration lesson (INV 2.1) is why custom elements are never server-rendered.
2. Provider layer (client only, created after hydration, dynamically imported per provider): the adapter's `mount()` creates the element with `document.createElement` inside a ref callback or effect. React never renders these elements. Elements: native `<video>` (file), `@mux/mux-video`, `hls-video-element`, `youtube-video-element`, `vimeo-video-element`, `wistia-video-element`, `twitch-video-element`, `tiktok-video-element`, `spotify-audio-element`, `cloudflare-video-element` (names and versions: section 14.4, ELEM 1). Each element package ships an undocumented `/react` export (`"use client"`, ce-la-react) [ELEM 5]; we use the plain element plus our own thin mounting code so one code path serves all providers (JUDGMENT; S1 decides if `/react` is easier). Consequences accepted: nothing plays before hydration; the first paint of a background video is its poster.
3. Controls layer: compound parts reading context. For YouTube, controls never overlap the iframe: the layout is a column (media, then control bar) in normal and fullscreen states, because YouTube forbids overlays "in front of any part of a YouTube embedded player" [POST 4]. This also means: no `PlayOverlay`, no `Loading` indicator and no error box is ever drawn over a mounted YouTube iframe (sections 4.3, 5.4). Overlap is allowed for other providers (JUDGMENT; only the YouTube rule is verified).

### 4.2 Load modes (decision 2.2.1)

| Mode         | Default for                      | Player load                                                                                                                                                                                                                   | Controls                                                                                                                                                               | Notes                                                                                     |
| ------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `background` | decorative loops                 | real player mounts when within `loadMargin` (default `"400px"`, from the old IO rootMargin, INV 2.1), or immediately with `priority`/`eager`                                                                                  | none; a visible pause control is required for loops over 5 s (WCAG 2.2.2 [FEAT B]) so `showPause` defaults true and renders one `PlayButton` independent of `controls` | muted, loop, playsinline, `disableRemotePlayback`, `aria-hidden` unless a label is given  |
| `autoplay`   | content video that starts itself | same as background                                                                                                                                                                                                            | ours (default set)                                                                                                                                                     | muted; unmute through controls                                                            |
| `click`      | content video                    | facade by default for iframe providers (YouTube, Vimeo, Wistia, Twitch, TikTok, Spotify, Cloudflare); for Mux and file the element mounts near the viewport with `preload="metadata"` (no hls.js or element code before that) | ours                                                                                                                                                                   | facade = poster + play button, preconnect on pointerenter/focus (web.dev pattern, FEAT E) |

`mainContent` (any mode): the real player mounts on hydration without a click or viewport wait, `preload` is `auto`, and `<VideoJsonLd>` is rendered. Reason: Google requires the video on a watch page whose main purpose is that video and says "Don't rely on user actions (such as swiping, clicking, or typing) to load the video" [MEM A.1; FEAT C]. Our server HTML contains the poster and the JSON-LD (with `embedUrl`/`contentUrl`) but not the player, because the player is client-created (section 4.1). Whether Googlebot, after rendering, sees an element created after hydration is NOT VERIFIED; the JSON-LD carries the data either way. A page with several videos is not a watch page; only one video per page should set `mainContent` (dev warning if two do).

`facade?: boolean | "auto"` overrides the table (`"auto"` = table). Autoplay and background ignore `facade: true` with a dev warning.

### 4.3 State machine

States: `idle`, `loading`, `ready` (first frame presented), `playing`, `paused`, `ended`, `blocked`, `stalled`, `error` (V3 adds `ended`; analytics needs it). Rules: `NotAllowedError` -> `blocked` (poster + play overlay; for YouTube the iframe is unmounted and the facade is shown again, so the overlay never sits on an iframe); `AbortError` ignored (benign, REL 1); 2 retries with backoff, then poster only [REL 4]. `stalled` escalates only if `readyState < 3` for several seconds (REL 4). The old infinite 250 ms retry loop is removed [INV 7]. `onEnded` is never put in effect dependencies; callbacks go through refs (INV 7).

### 4.4 Synthesized behavior (per adapter)

YouTube: `ended` getter missing (event only) so synthesize; no `canplay`/`waiting`; poll time; destroy on StrictMode cleanup [ELEM 2.7]. Vimeo: no `canplay` [ELEM 2.8]. Wistia: `play()` resolves on `playing`; validate the URL before constructing (the element throws on a non-matching URL, ELEM 2.1). Twitch: `play()`/`pause()` return `undefined` [ELEM 2.2]. TikTok: duration unknown until the first `onCurrentTime` [BASIC 1c-bis]. Spotify: `ended` inferred from position vs duration [BASIC 3b]. The controller, not the adapters, queues commands issued before the adapter emits `ready` and flushes them in order (section 5.5).

### 4.5 Provider registry (oEmbed-ready, decision 2.2.8)

`ProviderDefinition`, `registerProvider` and `resolveProvider` are defined in section 5.5. Lookup functions are not on the definition: the registry is imported by client code, and server-only lookup code must not enter the client bundle, so lookups are a separate table in `server/lookup.ts` keyed by provider id. A future generic oEmbed provider is one more `ProviderDefinition` whose `load` returns a sandboxed-iframe adapter and whose capabilities are all `no` (from the survey: allowlisted hosts, parse a single iframe `src` server-side, never inject provider HTML; sandbox flags NOT VERIFIED). Nothing else changes.

## 5. API

### 5.1 Types

```ts
export type VideoProvider =
	| "mux"
	| "file"
	| "youtube"
	| "vimeo"
	| "wistia"
	| "twitch"
	| "tiktok"
	| "spotify"
	| "cloudflare"
export type VideoMode = "background" | "autoplay" | "click"
export type VideoStatus =
	| "idle"
	| "loading"
	| "ready"
	| "playing"
	| "paused"
	| "ended"
	| "blocked"
	| "stalled"
	| "error"
export type Support = "yes" | "best-effort" | "no" | "unverified"

export interface VideoFileSource {
	src: string
	type?: string
	media?: string
}

export type ResolvedSource =
	| { provider: "mux"; playbackId: string; tokens?: MuxTokens; customDomain?: string }
	| { provider: "file"; format: "native" | "hls"; sources: VideoFileSource[] }
	| {
			provider: Exclude<VideoProvider, "mux" | "file">
			id: string
			url: string
			hash?: string
			customerCode?: string
			kind?: "video" | "channel" | "collection" | "clip"
	  }

export interface MuxTokens {
	playback?: string
	thumbnail?: string
	storyboard?: string
	drm?: string
}

export interface VideoInViewTrigger {
	/** IntersectionObserver threshold; default 0.1 */
	threshold?: number | number[]
	/** IntersectionObserver rootMargin for the play decision; default "0px" */
	rootMargin?: string
	/** Play only the first time it enters view; default false */
	once?: boolean
	/** Pause when it leaves view; default true */
	pauseWhenOut?: boolean
}

export interface VideoAnalyticsOptions {
	/** Progress thresholds in percent; default [10, 25, 50, 75] */
	progress?: number[]
	/** Overrides the video title used in events */
	title?: string
}

export interface VideoEvent {
	type: "start" | "pause" | "progress" | "complete" | "error"
	provider: VideoProvider
	videoId: string
	title?: string
	url?: string
	currentTime: number
	duration: number
	percent?: number
	errorCode?: string | number
}
```

### 5.2 Props

```ts
export interface UniversalVideoProps {
	/** Sanity video object (VideoField). Preferred input. Explicit props below win over fields on this object (section 10.5). */
	video?: VideoField
	/** Plain URL or file sources. Provider is detected from the URL. */
	src?: string | VideoFileSource[]
	/** Legacy Mux input, same as video with sourceType "mux". */
	playbackId?: string
	/** background: muted loop, no controls. autoplay: muted autoplay with controls. click: click to play. Default "click". */
	mode?: VideoMode
	/** Watch-page video: eager player, VideoObject JSON-LD. Only one per page. */
	mainContent?: boolean
	/** Facade before load. "auto" follows the mode table. */
	facade?: boolean | "auto"
	/** LCP element: eager poster with fetchPriority high, player mounts at once, preload auto. Match the Studio lcp option. */
	priority?: boolean
	/** Skip the viewport wait but keep normal priority. */
	eager?: boolean
	/** IntersectionObserver rootMargin for loading. Default "400px". */
	loadMargin?: string
	/** Built-in playback trigger. false disables. true uses defaults. Default true for background and autoplay, false for click. */
	trigger?: boolean | VideoInViewTrigger
	/** Declarative play state. Counts as manual control (section 8.2). */
	play?: boolean
	muted?: boolean
	loop?: boolean
	/** Seconds. */
	startTime?: number
	/** Seconds. Pauses (or loops back to startTime when loop) at this time. */
	endTime?: number
	/** Uploaded poster (Sanity image or static import). Wins over any provider poster. Never blurred (section 9.2). */
	poster?: SanityImageData<"false"> | StaticImageData
	posterTime?: number
	/** Poster aspect and CLS reserve. Falls back to video.muxVideo.data.videoAspectRatio. */
	aspectRatio?: number | string
	/** Controls: ours (default set), provider chrome, or none. Default depends on mode. */
	controls?: boolean | "provider"
	/** Control placement. YouTube is always "below". Default "overlay". */
	controlsPlacement?: "overlay" | "below"
	/** Render a pause control in background mode. Default true. */
	showPause?: boolean
	/** Accessible label; when absent in background mode the video is aria-hidden. */
	label?: string
	/** Override control labels (i18n). */
	labels?: Partial<VideoLabels>
	/** Default caption state, code only (no Sanity field; O5). Applies where the source supports a default. */
	captions?: "off" | "on"
	chapters?: VideoChapter[]
	privacy?: boolean
	muxData?: boolean | MuxDataOptions
	mux?: MuxOptions
	analytics?: boolean | VideoAnalyticsOptions
	/** Per-video veto. Must be created in a client module; sites set it once through VideoConfigProvider (section 13). */
	canTrack?: () => boolean
	onVideoEvent?: (event: VideoEvent) => void
	onReady?: () => void
	onPlay?: () => void
	onPause?: () => void
	onEnded?: () => void
	onError?: (error: VideoError) => void
	onBlocked?: () => void
	onTimeUpdate?: (currentTime: number, duration: number) => void
	className?: string
	ref?: Ref<UniversalVideoHandle>
	children?: ReactNode
}
```

`MuxOptions` carries the verified mux-video attributes (MUX3 14): `minResolution`, `maxResolution`, `renditionOrder: "desc"`, `maxAutoResolution`, `capRenditionToPlayerSize`, `preferPlayback: "mse" | "native"`, `preferCmcd: "query" | "header" | "none"`, `assetStartTime`, `assetEndTime`, `defaultSubtitlesLang`, `redundantStreams`, `streamType`, `targetLiveWindow`, `liveEdgeOffset`, `customDomain`, `envKey`, `beaconCollectionDomain`, `metadata`. Tokens are passed only for signed playback IDs; a token on a public ID makes the URL fail [MUX3 2]. When a token is set, resolution and thumbnail options must be in the JWT claims, not the URL [MUX3 2; SRC `toMuxVideoURL`].

Rules:

- If `video`, `src`, and `playbackId` are all absent: render nothing and warn in dev (the old VideoEmbed returned `null` silently, INV 2.7). Missing source shows nothing in production, an error box in dev.
- `stegaClean()` is applied to the whole `video` object before any parsing or comparison [SNV 5; FEAT F]. Providers, IDs, titles and times in the object are not trusted until cleaned.
- Default `controls`: `false` for background, our set for autoplay and click. `showPause` (background) renders one `PlayButton` independent of `controls`.
- `muted` is forced true for background and for autoplay until the user unmutes.
- Muted autoplay: the adapter creates the element on the client (section 4.1), so no server HTML or JSX attribute is involved. It sets the `muted` attribute, `defaultMuted = true`, `muted = true` and `playsinline` before assigning `src`, and calls `play()` only after that. This avoids facebook/react#10389 (React not rendering the `muted` attribute) [REL 4] by not relying on React for the element. T4 asserts the result on the client-created element, including after a React 19 client render of the surrounding tree.
- `play` prop, ref calls, controls and keyboard all write the same wanted-state (section 8.2).

### 5.3 Handle and controller

```ts
export interface VideoState {
	status: VideoStatus
	paused: boolean
	ended: boolean
	muted: boolean
	volume: number
	currentTime: number
	duration: number
	bufferedEnd: number
	playbackRate: number
	waiting: boolean
	ready: boolean
	isLive: boolean
	fullscreen: boolean
	textTracks: VideoTrack[]
	activeTextTrack: string | null
	audioTracks: VideoTrack[]
	activeAudioTrack: string | null
	qualities: VideoQuality[]
	activeQuality: string | null
	chapters: VideoChapter[]
	activeChapter: number | null
	error: VideoError | null
	wanted: "play" | "pause" | null
	wantedOrigin: "trigger" | "manual" | null
}

export interface VideoController {
	play: (opts?: { origin?: "user" | "external" }) => Promise<void>
	pause: (opts?: { origin?: "user" | "external" }) => void
	toggle: () => void
	restart: () => void
	seek: (seconds: number) => void
	seekBy: (delta: number) => void
	setMuted: (muted: boolean) => void
	setVolume: (volume: number) => void
	setPlaybackRate: (rate: number) => void
	setTextTrack: (id: string | null) => void
	setAudioTrack: (id: string) => void
	setQuality: (id: string | null) => void
	setChapter: (index: number) => void
	requestFullscreen: () => Promise<void>
	exitFullscreen: () => Promise<void>
	requestPictureInPicture: () => Promise<void>
	promptRemotePlayback: () => Promise<void>
	releaseManualControl: () => void
	retry: () => void
	onExtra: (name: string, listener: (detail: unknown) => void) => () => void
	getState: () => VideoState
	subscribe: (listener: () => void) => () => void
	capabilities: Record<VideoFeature, Support>
	extras: ProviderExtras
}

export interface UniversalVideoHandle extends VideoController {
	container: HTMLElement | null
	media: HTMLElement | null
}
```

Every command checks `capabilities` and is a no-op with a dev warning when unsupported. The controller is an external store (`subscribe`/`getState`), read in React with `useSyncExternalStore` (React Compiler safe; no setState in effect bodies, REL 4). `useVideo()` returns `{ state, controller, capabilities }` and must be called under `<UniversalVideo>`. `ref` is the new `UniversalVideoHandle`; the old components' `ref` (container div) and `videoRef` (`<video>`) are preserved only by the compat wrappers (section 15).

Origin vocabulary (one mapping): `play({ origin: "user" | "external" })` and `pause(...)` both write `wantedOrigin = "manual"`; the `origin` option only feeds analytics (`user` is a control or key press, `external` is code). `wantedOrigin = "trigger"` is written only by the built-in trigger through the internal `playFromTrigger`/`pauseFromTrigger` (section 5.5, `ControllerInternals`), never by public calls.

`extras` is the typed per-source escape hatch for official features with no standard-media equivalent (section 6.3).

### 5.4 Compound parts

Standard for every part: renders one real element; forwards `ref`, `className`, rest props; exposes state through `data-` attributes (`data-state`, `data-support`, `data-active`, `data-idle`); accessible name from `labels` or a `label` prop; `children` is content or a function receiving state; hides itself when its required feature is `no` unless `alwaysShow`; `best-effort` renders with `data-support="best-effort"`; standard keyboard behavior; minimum target 24 by 24 CSS px token (WCAG 2.5.8 [SNV 8]); visible focus (2.4.7). Parts use the library `styled` only for structural layout; no visual design.

| Part                                     | Requires              | Notes                                                                                                                                                                                                            |
| ---------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Controls`                               | none                  | container, `data-idle` after inactivity; placement per `controlsPlacement`                                                                                                                                       |
| `PlayButton`                             | play                  | single toggle; also the pause control for WCAG 2.2.2                                                                                                                                                             |
| `PlayOverlay`                            | play                  | shown in the `idle` facade and in `blocked` (replaces the old BatterySaver overlay; icon from `*.inline.svg`, never hand-written). For YouTube it is only ever rendered on the facade, never on a mounted iframe |
| `MuteButton`                             | muted                 |                                                                                                                                                                                                                  |
| `VolumeSlider`                           | volume                | hidden where volume is system-controlled (Vimeo mobile, VERIFIED text in PROV2 B2; TikTok, Spotify never)                                                                                                        |
| `Scrubber`                               | seek                  | buffered range, `aria-valuetext`, non-drag alternative via keyboard and click (WCAG 2.5.7 [SNV 8]); Mux storyboard preview when available                                                                        |
| `CurrentTime`, `Duration`, `TimeDisplay` | time read             | live shows a live badge                                                                                                                                                                                          |
| `FullscreenButton`                       | fullscreen            | fullscreens our wrapper (every source; only the Vimeo element overrides `requestFullscreen`, ELEM 2.8). iPhone fullscreen with custom controls NOT VERIFIED                                                      |
| `CaptionsButton`                         | captions              | menu of tracks; rendered only when the source reports at least one track (O5)                                                                                                                                    |
| `Captions`                               | captions              | cue display for the tracks the source already carries. Needed because mux-video creates hls.js with `renderTextTracksNatively: false` (MUX3 6), so cue rendering is ours; confirmed at build time through S10    |
| `PlaybackRateButton`                     | playbackRate          |                                                                                                                                                                                                                  |
| `QualityMenu`                            | quality select or cap |                                                                                                                                                                                                                  |
| `AudioTrackMenu`                         | audioTracks           | Mux, HLS, Vimeo                                                                                                                                                                                                  |
| `ChaptersMenu`                           | chapters              |                                                                                                                                                                                                                  |
| `PiPButton`                              | pip                   | not Baseline (SNV 8c)                                                                                                                                                                                            |
| `CastButton`                             | remotePlayback        | Remote Playback API not Baseline (SNV 8c); Mux uses castable-video (ELEM 1)                                                                                                                                      |
| `Loading`, `ErrorMessage`                | none                  | error message offers `retry`. For YouTube both render in the control column below the media, never over the iframe                                                                                               |

Styling brief for every part (AGENTS.md, library/CLAUDE.md): every `css` use needs `f.responsive` or `f.unresponsive`; the 24 by 24 target is an `f.unresponsive` value; `f.small` for responsive overrides, never `f.mobile`; Capsize text styles go only on the element that directly contains text (`CurrentTime`, `Duration`, labels), never on `Controls` or other flex/grid wrappers; no inline styles, so scrubber progress, buffered range, volume fill, aspect ratio and cue position use `styled` `tokens` (read the "tokens (dynamic values)" section of `library/styled/README.md` first; per-frame updates set the token's CSS variable, never a new inline style).

`UniversalVideo` with `controls` true and no children renders `DefaultControls`, a plain arrangement of the parts above.

### 5.5 Frozen interfaces (adapter contract)

Everything below is written first, by the freeze engineer (section 17.1), into `types.ts` (runtime-free) and `capabilities.ts`. Every name referenced elsewhere in this spec resolves here. Other pieces do not change these without the integrator (piece H). Casts are allowed only at the documented external boundary (untyped custom-element members such as `setOption` and `loadEntity`), typed once in `providers/*` and never `any`.

#### 5.5.1 Shared value types

```ts
export type VideoFeature = (typeof VIDEO_FEATURES)[number]
export type ProviderCapabilities = Record<VideoFeature, Support>

export interface VideoError {
	code: string | number
	message: string
	/** True when a retry can help (network, rate limit); false for removed, private or embed-blocked videos. */
	retryable: boolean
	provider: VideoProvider
}

export interface VideoTrack {
	id: string
	label: string
	language?: string
	kind?: "captions" | "subtitles" | "descriptions" | "chapters" | "audio"
	src?: string
	default?: boolean
}

export interface VideoChapter {
	startTime: number
	title: string
}

export interface VideoQuality {
	id: string
	label: string
	height?: number
	bitrate?: number
}

export interface VideoLabels {
	play: string
	pause: string
	mute: string
	unmute: string
	volume: string
	seek: string
	fullscreen: string
	exitFullscreen: string
	captions: string
	captionsOff: string
	playbackRate: string
	quality: string
	audioTrack: string
	chapters: string
	pictureInPicture: string
	cast: string
	loading: string
	retry: string
	errorGeneric: string
	playOverlay: string
	live: string
}

/** Value sets follow MUX3 14; attributes whose value set was not verified are typed as string. */
export interface MuxOptions {
	minResolution?: string
	maxResolution?: string
	renditionOrder?: "desc"
	maxAutoResolution?: string
	capRenditionToPlayerSize?: boolean
	preferPlayback?: "mse" | "native"
	preferCmcd?: "query" | "header" | "none"
	assetStartTime?: number
	assetEndTime?: number
	defaultSubtitlesLang?: string
	redundantStreams?: boolean
	streamType?: string
	targetLiveWindow?: number
	liveEdgeOffset?: number
	customDomain?: string
	envKey?: string
	beaconCollectionDomain?: string
	metadata?: Record<string, string>
}

export interface MuxDataOptions {
	envKey?: string
	metadata?: Record<string, string>
}

export interface TwitchExtras {
	getQualities: () => string[]
	getPlaybackStats: () => Record<string, unknown>
	setChannel: (channel: string) => void
	setVideo: (id: string, time?: number) => void
	setCollection: (id: string, videoId?: string) => void
}
export interface TikTokExtras {
	navigateTo: (index: number) => void
}
export interface SpotifyExtras {
	loadEntity: (uri: string, preferVideo?: boolean, startAt?: number) => void
	restart: () => void
}
export interface VimeoExtras {
	getChapters: () => Promise<VideoChapter[]>
}
export interface YouTubeExtras {
	getAvailablePlaybackRates: () => number[]
}
export interface MuxExtras {
	addCuePoints: (cues: { time: number; value: string }[]) => void
	storyboardUrl: string | null
	animatedPreviewUrl: (opts?: {
		start?: number
		end?: number
		width?: number
		fps?: number
	}) => string
}

export interface ProviderExtras {
	twitch?: TwitchExtras
	tiktok?: TikTokExtras
	spotify?: SpotifyExtras
	vimeo?: VimeoExtras
	youtube?: YouTubeExtras
	mux?: MuxExtras
}
```

`VideoFieldAdditions` describes the new Sanity fields (section 10.1). `VideoField` in `library/sanity/assetMetadata.ts` becomes the existing shape intersected with it; the freeze engineer makes that one edit, then ownership of the file passes to piece E (sequential, never concurrent).

```ts
export interface VideoFieldAdditions {
	thumbnail?: {
		url: string
		width: number
		height: number
		provider: VideoProvider
		fetchedAt: string
	} | null
	mode?: VideoMode | null
	loop?: boolean | null
	muted?: boolean | null
	controls?: "ours" | "provider" | "none" | null
	startTime?: number | null
	endTime?: number | null
	chapters?: VideoChapter[] | null
	title?: string | null
	mainContent?: boolean | null
	jsonLd?: {
		description?: string
		uploadDate?: string
		duration?: string
		creatorName?: string
		expires?: string
	} | null
	privacy?: boolean | null
}

export interface VideoJsonLdContext {
	siteName?: string
	pageUrl?: string
	fallbackThumbnailUrl?: string
}

export interface VideoObjectJsonLd {
	"@context": "https://schema.org"
	"@type": "VideoObject"
	name: string
	thumbnailUrl: string[]
	uploadDate: string
	description?: string
	duration?: string
	contentUrl?: string
	embedUrl?: string
	expires?: string
	creator?: { "@type": "Person" | "Organization"; name: string }
}

export interface VideoConfig {
	analytics: boolean | VideoAnalyticsOptions
	canTrack?: () => boolean
	maxConcurrent: number
	lookupEndpoint?: string
}
```

#### 5.5.2 Adapter contract

```ts
export type ParsedSource = ResolvedSource

export interface LookupContext {
	siteURL: string
	signal: AbortSignal
}

export type AdapterEvent =
	| { type: "ready" }
	| { type: "loading" }
	| { type: "firstFrame" }
	| { type: "playing" }
	| { type: "paused" }
	| { type: "waiting" }
	| { type: "ended" }
	| { type: "blocked" }
	| { type: "time"; currentTime: number; duration: number; bufferedEnd: number }
	| { type: "volume"; volume: number; muted: boolean }
	| { type: "rate"; playbackRate: number }
	| { type: "live"; isLive: boolean }
	| {
			type: "tracks"
			textTracks: VideoTrack[]
			audioTracks: VideoTrack[]
			activeTextTrack: string | null
			activeAudioTrack: string | null
	  }
	| { type: "qualities"; qualities: VideoQuality[]; activeQuality: string | null }
	| { type: "chapters"; chapters: VideoChapter[] }
	| { type: "capabilities"; capabilities: Partial<ProviderCapabilities> }
	| { type: "error"; error: VideoError }
	| { type: "extra"; name: string; detail?: unknown }

export interface AdapterMountOptions {
	source: ResolvedSource
	muted: boolean
	loop: boolean
	autoplay: boolean
	background: boolean
	controls: "none" | "provider"
	preload: "none" | "metadata" | "auto"
	startTime?: number
	endTime?: number
	captionsDefault: "off" | "on" // from the code-only `captions` prop (O5)
	privacy: boolean
	tracks: VideoTrack[]
	chapters: VideoChapter[]
	mux?: MuxOptions
	/** Already resolved against canTrack and GPC by the controller. */
	muxData: boolean | MuxDataOptions
	label?: string
	/** location.hostname, for Twitch `parent` and YouTube `origin`. */
	hostname: string
	emit: (event: AdapterEvent) => void
	signal: AbortSignal
}

export interface ProviderAdapter {
	readonly element: HTMLElement
	readonly extras: ProviderExtras
	play: () => Promise<void>
	pause: () => void
	seek: (seconds: number) => void
	setMuted: (muted: boolean) => void
	setVolume?: (volume: number) => void
	setPlaybackRate?: (rate: number) => void
	setLoop?: (loop: boolean) => void
	setTextTrack?: (id: string | null) => void
	setAudioTrack?: (id: string) => void
	setQuality?: (id: string | null) => void
	setChapters?: (chapters: VideoChapter[]) => void
	requestPictureInPicture?: () => Promise<void>
	promptRemotePlayback?: () => Promise<void>
	destroy: () => void
}

export interface ProviderAdapterFactory {
	mount: (container: HTMLElement, options: AdapterMountOptions) => ProviderAdapter
}

export interface ProviderDefinition {
	id: VideoProvider | (string & {})
	match: (input: string) => ParsedSource | null
	load: () => Promise<ProviderAdapterFactory>
	capabilities: ProviderCapabilities
	embedUrl?: (source: ParsedSource) => string
}

export function registerProvider(def: ProviderDefinition): void
export function resolveProvider(source: ResolvedSource): ProviderDefinition
```

Contract (every adapter, tested by T8):

1. `mount` is synchronous, appends its element to `container`, and returns. `load()` (the dynamic import) has already resolved. The adapter emits `ready` once its element accepts commands (native and Mux: right after mount; iframe providers: after the provider SDK reports ready). The controller queues any command issued earlier and flushes in order after `ready`; adapters never queue.
2. `play()` rejects only with the real browser or SDK error. `NotAllowedError` makes the adapter also emit `blocked`; `AbortError` is swallowed and never emitted as `error`.
3. `time` is pushed at most every 250 ms (native and Mux from `timeupdate`; YouTube polled; TikTok and Spotify from provider messages). `firstFrame` is emitted once per mount when a frame is presented (`requestVideoFrameCallback` for native and Mux, else the first `playing`; iframe providers emit it on first `playing`).
4. Optional methods exist only when the adapter reports the matching feature as not `no`. The adapter may emit `capabilities` to narrow its table at runtime (for example Vimeo volume on mobile). The controller re-checks capabilities on every command.
5. `destroy` is idempotent: removes the element and listeners, cancels timers and `requestVideoFrameCallback`, and after it nothing is emitted. `signal` aborts at the same time, for adapter-internal fetches and SDK loads.
6. Adapters never read React state or props; all inputs arrive in `AdapterMountOptions`. Changes after mount (muted, loop, rate) arrive through the methods.
7. Lookups are not part of the registry. `server/lookup.ts` exports `type LookupFn = (source: ParsedSource, ctx: LookupContext) => Promise<VideoLookupResult>` and `LOOKUPS: Partial<Record<VideoProvider, LookupFn>>`, so server-only code never enters a client bundle.

#### 5.5.3 Controller internals

```ts
export interface VideoCallbacks {
	onVideoEvent?: (event: VideoEvent) => void
	onReady?: () => void
	onPlay?: () => void
	onPause?: () => void
	onEnded?: () => void
	onError?: (error: VideoError) => void
	onBlocked?: () => void
	onTimeUpdate?: (currentTime: number, duration: number) => void
}

export interface ControllerProps {
	play?: boolean
	muted?: boolean
	loop?: boolean
	startTime?: number
	endTime?: number
}

export interface ControllerOptions {
	provider: VideoProvider
	capabilities: ProviderCapabilities
	mode: VideoMode
	props: ControllerProps
}

export interface ControllerInternals extends VideoController {
	attach: (adapter: ProviderAdapter) => void
	detach: () => void
	handle: (event: AdapterEvent) => void
	setCallbacks: (callbacks: VideoCallbacks) => void
	setProps: (props: ControllerProps) => void
	playFromTrigger: () => void
	pauseFromTrigger: () => void
	destroy: () => void
}

export function createController(options: ControllerOptions): ControllerInternals
```

`createController` has no side effects: no listeners, no observers, no timers. All of that starts in `attach`. `detach` is not terminal (StrictMode re-attaches the same controller). `controller/events.ts` holds the internal event bus types and is frozen with these.

## 6. Capability matrix (shared table, per source)

Columns: Mux, File (native and HLS via hls.js; DASH is not supported), YouTube, Vimeo, Wistia, Twitch, TikTok, Spotify, Cloudflare. Cells: Y = yes, B = best effort, N = no, ? = NOT VERIFIED (type value `unverified`). A `?` feature is treated as `no` for part visibility and Studio options until spike S10 promotes it (section 6.4). This table is the human mirror of `library/videos/capabilities.ts` (section 6.4), which is the source of truth. Superscripts are citation keys listed under the table.

### 6.1 Matrix

| Feature                        | Mux                               | File                    | YouTube                                       | Vimeo                          | Wistia                    | Twitch                                   | TikTok                          | Spotify                | Cloudflare                                                  |
| ------------------------------ | --------------------------------- | ----------------------- | --------------------------------------------- | ------------------------------ | ------------------------- | ---------------------------------------- | ------------------------------- | ---------------------- | ----------------------------------------------------------- |
| play, pause                    | Y a                               | Y b                     | Y c                                           | Y d                            | Y e                       | Y f                                      | Y g                             | Y h                    | Y i                                                         |
| seek                           | Y a                               | Y b                     | Y c                                           | Y d                            | Y e                       | Y (VOD only) f                           | Y g                             | Y h                    | Y i                                                         |
| mute                           | Y a                               | Y b                     | Y c                                           | Y d                            | Y e                       | Y f                                      | Y g                             | N h                    | Y i                                                         |
| volume set                     | Y a                               | Y b                     | Y (0..100 scaled) c                           | B (not on mobile) d            | Y e                       | Y (0..1) f                               | N (C7) g                        | N h                    | Y i                                                         |
| playback rate                  | Y a                               | Y b                     | B (not guaranteed) c                          | B (paid plans) d               | Y e                       | N f                                      | N g                             | N h                    | B i (rate set through the SDK, behavior unobserved)         |
| loop                           | Y a                               | Y b                     | Y (element loops in JS) c                     | Y (no `ended` while looping) d | Y (set at load) e         | N f                                      | B (`loop` URL param only) g     | N h                    | Y i                                                         |
| muted autoplay                 | Y a                               | Y b                     | B (`mute` param undocumented, API `mute()`) c | Y d                            | Y (`silentAutoPlay`) e    | B (default true, mobile needs gesture) f | Y (`autoplay=1&muted=1`) g      | N (needs gesture) h    | B (mobile autoplay generally unsupported) i                 |
| start time                     | Y `start-time` a                  | Y b                     | Y `start` c                                   | Y `#t` d                       | Y `time` e                | Y VOD `time` f                           | N (seek after ready) g          | Y `t`/`startAt` h      | Y `starttime`, read at load only i                          |
| end time                       | B (`asset-end-time` or script) a  | B (script, `#t=a,b`) b  | Y `end` c                                     | B (script) d                   | B (script) e              | B (script) f                             | B (script) g                    | B (script) h           | B (script)                                                  |
| hide provider chrome           | Y a                               | Y b                     | Y `controls=0` c                              | B (`controls=0`, plan?) d      | Y (`chromeless`) e        | B (`controls=false`, undocumented) f     | Y (`controls=0` plus 5 flags) g | N (embed UI fixed) h   | Y `controls` attribute i                                    |
| fullscreen (our wrapper)       | Y                                 | Y                       | Y                                             | Y (element override)           | Y                         | Y                                        | Y                               | Y                      | Y                                                           |
| picture in picture             | Y (not Baseline) a                | Y (not Baseline) b      | ? c                                           | Y d                            | ? e                       | N f                                      | N g                             | N h                    | ?                                                           |
| remote playback / Cast         | Y (castable-video) a              | Y (not Baseline) b      | ? c                                           | Y d                            | ? e                       | N f                                      | N g                             | N h                    | ?                                                           |
| caption tracks list and select | Y (own cue display) a             | Y b                     | B (undocumented `setOption`) c                | Y d                            | ? e                       | B (on/off only, no list) f               | N g                             | N h                    | N (no textTracks) i                                         |
| default captions option        | Y `default_subtitles_lang` a      | Y b                     | Y `cc_load_policy` c                          | Y `texttrack` d                | B (embedOptions plugin) e | N f                                      | N g                             | N h                    | Y `defaulttexttrack`, init only i                           |
| audio tracks                   | Y a                               | B (HLS) b               | N c                                           | Y d                            | ? e                       | N f                                      | N g                             | N h                    | ?                                                           |
| quality select                 | ? a                               | ? b                     | N c                                           | B (paid) d                     | ? e                       | Y f                                      | N g                             | N h                    | ?                                                           |
| quality cap                    | Y a                               | ? b                     | N c                                           | B (paid `quality`) d           | ? e                       | N f                                      | N g                             | N h                    | ?                                                           |
| chapters (provider-native)     | N (we feed `addChapters`) a       | Y (`kind="chapters"`) b | N c                                           | Y d                            | N e                       | N f                                      | N g                             | N h                    | N                                                           |
| time and duration read         | Y a                               | Y b                     | Y c                                           | Y d                            | Y e                       | Y (VOD only) f                           | Y (push) g                      | Y (push, ms) h         | Y i                                                         |
| ended signal                   | Y a                               | Y b                     | B (synthesized) c                             | Y d                            | Y e                       | Y f                                      | Y g                             | B (inferred) h         | Y i                                                         |
| error signal                   | Y a                               | Y b                     | Y c                                           | Y d                            | ? e                       | B (undocumented) f                       | Y g                             | B (undocumented) h     | Y i                                                         |
| background mode                | Y                                 | Y                       | B (dev warning)                               | B (`background=1`, plan?)      | B                         | N (no loop)                              | B                               | N                      | B                                                           |
| privacy mode                   | Y `disable-cookies` a             | n/a                     | Y nocookie (HTTP level) c                     | B `dnt` d                      | ? e                       | N f                                      | N g                             | N h                    | ?                                                           |
| provider poster                | Y thumbnail (lifted, section 9) a | none                    | Y thumbnail c                                 | Y oEmbed d                     | Y oEmbed e                | N (token API) f                          | N g                             | Y oEmbed 300x300 h     | B (thumbnail URL from customer code and UID, constructed) i |
| metadata for JSON-LD           | B (asset data) a                  | URL only                | oEmbed + scrape c                             | oEmbed d                       | oEmbed + media JSON e     | N f                                      | N g                             | oEmbed (no duration) h | N (no oEmbed; editor enters) i                              |
| signed or private              | Y (JWT, DRM) a                    | N                       | N                                             | B (`h`, domain Referer) d      | B (domain restriction) e  | N                                        | N                               | N                      | B (token replaces UID, mechanics NOT VERIFIED) i            |
| live                           | Y (stream-type, DVR) a            | B (hls.js) b            | ?                                             | ?                              | ?                         | Y (OFFLINE/ONLINE) f                     | N                               | N                      | ?                                                           |

Citations.

- a (Mux): ELEM 2.10 (proxy, `ended` override, castable); MUX3 sections 1 to 11 (storyboard 1, thumbnails 2, tracks 6, audio 7, resolution 8, start-time/autoplay/preload 9, DRM 10, Mux Data 11). Live and DRM requests were not made with real signed assets: NOT VERIFIED (MUX3 15).
- b (File, HLS): ELEM 2.9 (hls-video-element proxy), FEAT A1 to A18 (fragments, tracks, loop), REL 1 and 3. DASH is out of scope (`dash-video-element` is not installed).
- c (YouTube): PROV2 A3 (params; `modestbranding` deprecated; `mute` URL param undocumented; `onAutoplayBlocked`; `getAvailableQualityLevels`/`setPlaybackQuality` absent from the docs page; captions option only `fontSize` and `reload`), PROV2 A4 (element defaults, loop in JS, captions via undocumented `setOption`), ELEM 2.7 (no `ended` getter, no canplay/waiting, error `{code, message}`), FEAT F (error codes 2, 5, 100, 101, 150, 153), POST 4 (overlay, autoplay, one autoplaying player, min viewport 200x200, thumbnail at least 120x70).
- d (Vimeo): PROV2 B2 (help-article params and plan lists; player.js methods: rate 0..2 for PRO and Business, quality Plus/PRO/Business, chapters, PiP, remote playback, mobile volume, loop vs `ended`), ELEM 2.8, FEAT G (audio track method names only; semantics NOT VERIFIED).
- e (Wistia): ELEM 2.1 and 3, PROV2 D1 and D2 (options; E-v1 vs Aurora naming; captions are a transcript string; chapters null; domain restriction needs a compatible referrer policy).
- f (Twitch): BASIC 2a to 2f. `controls=false`, `volume`, `quality` URL params are read from the live script but unobserved in a browser (BASIC 5).
- g (TikTok): BASIC 1a to 1f.
- h (Spotify): BASIC 3a to 3e.
- i (Cloudflare): ELEM 2.5 (member table, events, attributes read at load), PROV2 C (SDK hosts, docs events, iframe params, thumbnails, signed URLs), META Cloudflare (no oEmbed, keyless thumbnail, manifest). Runtime behavior in a browser was not observed: NOT VERIFIED.

### 6.2 Per-source limits and quirks (implementers must handle)

Mux. Sets no cookies on image/stream hosts [MUX3 2]; Mux Data cookie unless `disable-cookies` [MUX3 11]. Manifest URLs expire (about a week) [MUX3 8]. `thumbnail` params that exist: `time`, `width`, `height`, `fit_mode` (preserve, stretch, crop, smartcrop, pad), `flip_v`, `flip_h`, `rotate`, `latest` (live only); `time` clamps, `abc` is 400, `width` max unknown (99999 is 400) [MUX3 2; PROBE 8]. Thumbnail rate limit documented (1 per 10 s of duration per asset); enforcement point NOT VERIFIED [MUX3 2]. Free-plan assets show a Mux logo in mux-video (`logo` attribute) [MUX3 11]. `autoplay="muted"`/`"any"` are playback-core values [MUX3 9]. `prefer-playback` effective default: hls.js everywhere except Safari (native HLS) [MUX3 9]. Honor the editor's `thumbTime`; the old components hard-code `time=0` [INV 5].

File. Faststart MP4 (`+faststart`) and HTTP Range support are required for progressive playback; Range support on Blob/S3/R2 NOT VERIFIED [REL 3]. `<source media>` is evaluated once, so breakpoint swaps need JS re-selection [FEAT A6]. HLS: native on Safari, hls.js elsewhere, lazy `import()` only when needed [REL 3].

YouTube. The element sets `cc_load_policy: 1`, `showinfo: 0`, `rel: 0`, `iv_load_policy: 3`, `modestbranding: 1`, `controls` from the attribute, and no `origin` [PROV2 A4]. Override through `config`: set `cc_load_policy` from the `captions` prop (value `0` instead of omission is NOT VERIFIED as equivalent), pass `origin`, keep `rel: 0` knowing it now only limits suggestions to the same channel [PROV2 A3]. `nocookie` is chosen only if the `src` string contains `-nocookie` [PROV2 A4]. HTTP-level: standard embed sets 6 cookies, nocookie sets none; JS-set cookies and storage NOT VERIFIED [PROV2 A1]. Rules: no overlays over any part of the player; autoplay should start only when more than half visible; one autoplaying player per page; viewport at least 200x200 [POST 4]. Thumbnails: see section 9.3.

Vimeo. `__cf_bm` cookie on every response, `dnt=1` does not remove it, only the vuid script disappears [PROV2 B1]. Domain-privacy videos need a Referer on lookups; unlisted need the `h` hash; both responses may carry reduced data [POST 2]. Doc sample video 76979871 is dead; use 1084537 or 22439234 in tests [META; PROBE].

Wistia. Validate the URL before mounting (the element throws) [ELEM 2.1]. Loads legacy `E-v1.js` from `fast.wistia.com`; docs call it legacy, Aurora newer, no removal date [PROV2 D1]. Domain restrictions break if the page referrer policy is `no-referrer` or `same-origin` [PROV2 D1]. Option names differ between E-v1 and Aurora [PROV2 D1].

Twitch. `parent` is required and enforced server side (CSP `frame-ancestors`); the element adds `location.hostname`; localhost works as the bare hostname [BASIC 2a]. Minimum embed size 400x300 [BASIC 2a]. Clips use a different URL and have no JS API [BASIC 2a]. `autoplay` defaults true [BASIC 2b]. The element hides pointer events when `controls` is absent (iframe unclickable) [ELEM 2.2]. Cookies: `unique_id` about a year [BASIC 2d]. Poster and title need Helix with a token, so there is no unauthenticated poster (BASIC 2d, POST 3).

TikTok. Use the Embed Player URL `https://www.tiktok.com/player/v1/{id}` (the page says Embed Videos is being deprecated, POST 3). Short links are not resolved by the element (regex needs a numeric post ID, ELEM 3, BASIC 1a). Per-domain rate limits can make the player unavailable (error 2005, BASIC 1c-bis). oEmbed returns no title, thumbnail or duration today [BASIC 1d; PROBE 5]. `tt_chain_token` cookie 180 days; in-iframe consent UI NOT VERIFIED [BASIC 1d]. Element drops `onPlayerError` and `onImageChange` messages (logs a warning) [BASIC 1e]; the adapter must listen to the iframe messages itself or patch around the element.

Cloudflare. The URL carries a per-account customer code: `https://customer-<CODE>.cloudflarestream.com/<UID>/iframe` [PROV2 C2]; the element's own regex accepts `cloudflarestream.com` and `videodelivery.net` hosts and reads only the UID [ELEM 2.5], so `parse.ts` keeps `customerCode` (needed for the thumbnail) and the editor must supply a full URL. Host without `controls` has `pointer-events: none`; `starttime`, `defaulttexttrack`, `primarycolor`, `letterboxcolor`, `adurl` are read only when the iframe URL is built, not observed afterwards; `textTracks` and `requestFullscreen` are missing on the element (our wrapper fullscreens) [ELEM 2.5]. Thumbnail `https://customer-<CODE>.cloudflarestream.com/<UID>/thumbnails/thumbnail.jpg` is 640x360 by default, ACAO `*` [PROV2 C3]. Signed videos use a token in place of the UID; mechanics NOT VERIFIED [PROV2 C].

Spotify. Needs `controls` on the element or it hides the iframe with `display: none` [BASIC 3d]; the adapter always sets it. Preview-only (under 30 s) when `encrypted-media` is removed or DRM unavailable; login requirement NOT VERIFIED [BASIC 3a]. Do not hard-code a thumbnail host (`image-cdn-fa.spotifycdn.com` live vs documented `i.scdn.co`) [PROBE 4]. Element's `loop` is emulated with a seek to 1 s [BASIC 3d]; we do not expose loop.

### 6.3 Provider extras (typed under `controller.extras`)

Official features that have no standard-media equivalent are exposed, not dropped (scope rule):

- Twitch: `getQualities`, `getPlaybackStats`, `setChannel`, `setVideo(id, time)`, `setCollection`, captions text events, events ONLINE/OFFLINE/PLAYBACK_BLOCKED [BASIC 2c].
- TikTok: `navigateTo(index)` and `imagechange` for image posts; error codes 1001, 1002, 2001, 2005, 3001, 3002 [BASIC 1c, 1c-bis].
- Spotify: `loadEntity(uri, preferVideo, startAt)`, `restart`, `togglePlay`, theme, `preferVideo` [BASIC 3b].
- Vimeo: `getChapters`, audio tracks, remote playback availability, cue-point events as listed in the player.js README (names only, FEAT G).
- YouTube: `getAvailablePlaybackRates`, `onAutoplayBlocked`, `onPlaybackRateChange` [FEAT A3; PROV2 A3].
- Cloudflare: `stream-adstart`, `stream-adend`, `stream-adtimeout` events [ELEM 2.5].
- Mux: `addChapters`, `addCuePoints`, `chapterchange`, `cuepointchange`, storyboard URL, animated preview URLs (`animated.webp`, max 10 s, width max 640, fps max 30 [MUX3 3]).

### 6.4 `capabilities.ts` (source of truth)

```ts
export const VIDEO_FEATURES = ["play", "seek", "muted", "volume", "playbackRate", "loop", "autoplay", "startTime", "endTime", "hideChrome", "fullscreen", "pip", "remotePlayback", "captions", "captionDefault", "audioTracks", "qualitySelect", "qualityCap", "chapters", "timeRead", "ended", "error", "background", "privacy", "providerPoster", "metadata", "signed", "live"] as const
export type VideoFeature = (typeof VIDEO_FEATURES)[number]

export const CAPABILITIES: Record<VideoProvider, Record<VideoFeature, Support>>
export const LIMITATIONS: Record<VideoProvider, string[]>
export const SANITY_OPTION_FEATURES: Record<string, VideoFeature[]>
export function supports(provider: VideoProvider, feature: VideoFeature): Support
```

`unverified` cells behave as `no` in `supports()` for UI purposes (parts hide, Studio options hide) until spike S10 sets them. Plain TS only: no React, no `window`, no `"use client"`, no imports from `sanity`. `LIMITATIONS` strings feed the Sanity field descriptions and the JSDoc; this keeps the schema, the upload instructions, and the code from drifting (decision 2.1.9).

## 7. Autoplay, reliability, concurrency

- Muted autoplay: `muted` + `playsinline` + `play()` promise handling [REL 1]. Chrome always allows muted autoplay; iOS needs muted or no audio track and `playsinline`; Firefox users can block it (`media.autoplay.default`, `allow-muted`) [REL 1]. `navigator.getAutoplayPolicy` support is uneven: feature-detect [REL 1].
- iOS Low Power Mode has no detection API; treat `NotAllowedError` or no `playing` within about 2 seconds as `blocked` (poster + play overlay) and retry `play()` once on the first user gesture [REL 1; UNSURE in source, so test T9].
- Reduced motion (`prefers-reduced-motion: reduce`, Baseline since 2020, FEAT A8): background loops show the poster only (the player is not loaded) with the play control visible; poster fallbacks per state are in section 9.5. Read with `useSyncExternalStore` and a server snapshot (`false`).
- Data saver: when `navigator.connection?.saveData` is true or `effectiveType` is `2g`/`slow-2g`, show poster only with `preload="none"` (feature-detect; Chromium-only availability per REL 1, UNSURE); poster fallbacks per state are in section 9.5. A user click loads and plays regardless.
- Offscreen: one shared IntersectionObserver (module singleton, client only) observing the wrapper, not the video; the video stays in layout and is hidden with opacity, never `display: none` (Safari rule from V3 7). Pause when out of view (play decision uses `trigger`, load decision uses `loadMargin`), pause on `visibilitychange` hidden, re-check on bfcache `pageshow` [REL 4]. Unload `src` of long-offscreen videos to free decoders (`removeAttribute("src"); load()`) [REL 4].
- Concurrency: a module-level manager caps concurrently playing trigger-driven videos (`VideoConfig.maxConcurrent`, default 3, JUDGMENT; the source says 1 to 3 is a rule of thumb, REL 4). A video that wants to play while the cap is reached joins a FIFO wait list; when a slot frees, the oldest waiting video that is still in view starts. Videos leaving view leave the list. User-initiated play is never capped. YouTube: at most one autoplaying YouTube player per page (verified rule) [POST 4]; the manager enforces it with a dev warning.
- Sources: H.264 MP4 faststart, no audio track for loops; budgets (about 1.5 to 3 MB desktop loops) are rules of thumb, not requirements [REL 3].
- `disableRemotePlayback` and `x-webkit-airplay="deny"` on background loops [REL 4].
- Carousel/StrictMode: setup in a ref callback with cleanup (React 19), idempotent; cleanup cancels `requestVideoFrameCallback`, disconnects observers, pauses, and for heavy videos clears `src` and calls `load()` [REL 4]. A debug counter `getVideoDebugStats()` (dev only: mounted instances, live observers, playing count, retained elements) backs test T1.

## 8. Triggered playback (decision 2.2.3)

### 8.1 Built-in

`trigger={true | { threshold, rootMargin, once, pauseWhenOut }}`. Defaults: `threshold: 0.1`, `rootMargin: "0px"`, `once: false`, `pauseWhenOut: true` (JUDGMENT; the old components only used IO for loading). Uses the shared observer. Conditions to play: intersecting AND tab visible AND not reduced motion AND not data saver AND concurrency slot free.

### 8.2 One shared wanted-state

`state.wanted` is `"play" | "pause" | null` with `state.wantedOrigin` `"trigger" | "manual" | null`. Writers:

- Built-in trigger writes `wanted` with origin `trigger`, but only while `wantedOrigin !== "manual"`.
- Any manual call (PlayButton, keyboard, `controller.play/pause/toggle/seek`, the `play` prop, `ref` handle, `useVideo`) writes origin `manual`. Once manual, the built-in trigger stops writing: "manual control makes the built-in trigger step aside".
- `controller.releaseManualControl()` returns control to the trigger. A change of `trigger` identity or a remount also resets it.
- Custom GSAP ScrollTrigger or IntersectionObserver code sets `trigger={false}` and calls `ref.current.play()/pause()/seek()/setMuted()`; those calls are manual by definition, so no conflict. No GSAP import in the library; the existing `useAnimation` pattern stays in site code.
- Applying `wanted` to the media is a single effect-free reconciler inside the controller (no setState in effect bodies).

### 8.3 React Compiler rules and controller lifetime

`next.config.ts` sets `reactCompiler: { panicThreshold: "all_errors" }` [REPO], so any pattern the compiler rejects fails the build. Rules for every file in this feature:

- No `??`, `?.`, ternaries or template literals inside a `try` block (AGENTS.md). Compute them into variables above the `try`. This applies to `play()` promise handling, retry and backoff code and JSON parsing in adapters.
- Controller lifetime: `const [controller] = useState(() => createController(options))`. `createController` is side-effect free (section 5.5.3), so a StrictMode double invocation is harmless. Never `useRef(createController())` and never read `ref.current` during render.
- Attach and detach happen in the wrapper's ref callback (React 19 cleanup function) or a `useEffect`: `attach` there, `detach` and adapter `destroy` in the cleanup. Both are idempotent and re-attachable.
- Prop to controller sync: one `useEffect` per prop group calls `controller.setProps(...)` and `controller.setCallbacks(...)` (callbacks stored on the controller so they are never effect dependencies). The `play` prop calls `controller.play({ origin: "external" })` from an effect when it changes. No `setState` in effect bodies.
- Reads: `useSyncExternalStore(controller.subscribe, controller.getState, controller.getState)` (the third argument is the server snapshot: the initial `idle` state).
- Module-level mutable state (shared IntersectionObserver, concurrency manager, debug counters) is touched only from effects, ref callbacks and event handlers, never read during render.
- `prefers-reduced-motion` and data-saver reads use `useSyncExternalStore` with a server snapshot (`false`).

## 9. Posters

### 9.1 Strategy (V3 decision 14, decision 2.2.9)

1. Uploaded poster (`posterImage` or `poster` prop) wins for every source.
2. No upload, `priority` (hero/LCP) and Mux: use the Mux thumbnail (honoring `thumbTime`) with a quick crossfade to the video on the first presented frame, and warn once per playback ID in development: "Mux thumbnails of untagged assets can differ in brightness from the video; upload a poster or re-encode (see docs)".
3. No upload, not hero, Mux or file: the video's own first frame (no thumbnail). For `click` mode the element mounts near the viewport with `preload="metadata"`, capped resolution, and seeks to `thumbTime` or 0 on `loadedmetadata` so the painted frame is the editor's frame. Whether `preload="metadata"` paints a frame under hls.js (`maxBufferLength=1`, MUX3 9) is spike S8.
   3b. Fallback when the video element is not loaded or not painted (reduced motion, data saver, `blocked`, `error`, `click` facade before load): Mux uses the Mux thumbnail at `thumbTime` (the known brightness tradeoff, same one-time dev warning), even when not hero. A plain file has no thumbnail source, so `poster` (uploaded) is required for those states: without it a dev warning is logged and the box shows only the play control. Full table in section 9.5.
4. No upload, iframe providers: the stored provider thumbnail (Studio lookup, section 11) with the facade; if none stored, an empty box with the play overlay.
5. No blur, no LQIP, no `placeholder`. Nothing shows while a poster loads.

### 9.2 Mechanics

- Poster is a plain `<img>` in the server HTML (not `<video poster>`): LCP counts the poster or the first frame, whichever is earlier [REL 2], and `fetchpriority` is documented for `img`, `link`, `script` only, not `<video poster>` (NOT VERIFIED for the latter) [SNV 8b].
- Posters never blur. `library/sanity/SanityImage.tsx` applies an LQIP background and a `blur(24px)` filter while `!loaded` whenever `src.data.lqip` exists (lines 253 to 259 [REPO]; the transparency check at lines 148 to 158 and the rendered-fit tracking at line 167 also read `data.lqip`). Decision: add one small generic prop in library, `noLqip?: boolean` on `SanityImageProps` (JSDoc: "Skip the low-quality blur placeholder entirely. Use where a blur must never show."). Change: destructure `noLqip` with `src, ref, quality` so it never reaches the DOM; compute `const lqipSource = noLqip ? undefined : src?.data?.lqip`; use `lqipSource` in place of `src?.data?.lqip` at the four sites (effect body and its dependency, `shouldTrackRenderedFit`, and `const lqip = !loaded && lqipSource`). With it set, `lqipProps` is `undefined`: no background, no filter, no transparency probe. Default false, so no other caller changes. Alternative rejected: stripping `data.lqip` from the poster object at each call site leaves four reads of it in SanityImage and clones the object each render. A CHANGELOG entry is required. Owner: piece A (poster).
- Uploaded posters go through `SanityImage` with `noLqip` (plain `<img>` with srcset; passes `fetchPriority` and `loading` through; has no `priority` prop) [SNV 4]. Static imports and provider URLs go through `StaticImage` (string branch is a plain `<img>`, needs `width` and `height`, `priority` must not be passed) [SNV 4]; `StaticImage` defaults `placeholder` to `"empty"` (`library/StaticImage.tsx:64` [REPO]) and the poster never passes `"blur"`. So the lookup must store width and height.
- `priority`: `loading="eager"`, `fetchPriority="high"` (via `ImgHTMLAttributes`, confirmed OK by REVIEW). Next 16 deprecates `priority` for `preload` on `next/image` [SNV 4], which we do not use for posters.
- `eager`: `loading="eager"`, normal priority. Default lazy.
- Reserve space with CSS `aspect-ratio` from `aspectRatio` or `muxVideo.data.videoAspectRatio` (CLS) [REL 2].
- Crossfade out on `firstFrame` (`requestVideoFrameCallback`, fallback `playing`), then unmount after `transitionend`. Never remove on `loadeddata`/`canplay` [REL 2]. The poster stays mounted, with no crossfade, while the status is `blocked`, `error`, or the player is not loaded (section 9.5).
- No `time=undefined` bugs (the old failure poster interpolated `videoDuration` blindly, INV 7); only add `time` when a finite number.

### 9.3 Provider thumbnails (from live probes)

- YouTube: oEmbed `thumbnail_url` is always `hqdefault.jpg` 480x360, 4:3 with letterbox bars; maxwidth/maxheight ignored [PROBE 1]. `mqdefault` is 320x180 (16:9). `sddefault`/`maxresdefault` can 404 yet still return `content-type: image/jpeg` (a 120x90 placeholder), so test the real HTTP status [PROBE 1]. Lookup order (JUDGMENT): `maxresdefault` if status 200, else `sddefault` if 200, else `hqdefault`; display with `object-fit: cover` in a 16:9 box so the bars are cropped. Whether `sddefault` has bars is NOT VERIFIED. URL patterns are not on any Google page [POST 1]. WebP was larger than JPG in the test; use JPG [PROBE 1].
- Vimeo: oEmbed `thumbnail_url` has no signature; size is a path suffix (`-d_WxH` accepts arbitrary sizes) or `width=` on oEmbed; CORS `*` [PROBE 2]. Domain-privacy videos return no thumbnail unless the lookup sends the permitted `Referer` [POST 2].
- Wistia: oEmbed `thumbnail_url` with `image_crop_resized=WxH` resizable (observed; not documented, POST 3) [PROBE 3].
- Spotify: oEmbed 300x300, host varies [PROBE 4].
- TikTok, Twitch: none officially unauthenticated [PROBE 5, 6; POST 3]. The facade shows an empty box with the play overlay unless the editor uploads a poster.
- Mux: URL from the playback ID, no lookup [PROBE 8]. Formats jpg, png, webp (no avif) [MUX3 2]; `animated.webp` preferred over gif [MUX3 3]. Signed IDs: options live in the JWT claims; the URL carries only `token` [MUX3 2].

### 9.4 Fade workaround (documented, user-facing)

Mux's standard is "8-bit 4:2:0 mpeg(tv) range BT.709" input [MUX3 13.7]. For untagged full-range sources, convert, do not just retag:
`ffmpeg -i in.mp4 -vf "scale=in_range=full:out_range=limited:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv ...` [MUX3 13 option A]. Check first: if the decoded Y plane runs 0 to about 252 and `ffprobe` shows `color_range=unknown`, the source is full-range untagged [MUX3 13.1]. NOT VERIFIED that Mux then produces matching thumbnails for the re-encoded file. Alternative B (retag as full range with `-bsf:v h264_metadata=video_full_range_flag=1`) is NOT VERIFIED. The user-facing text says thumbnails "may differ in brightness from the video" (C3 is OPEN, so the copy does not assert a direction). This text goes in the Sanity Mux field description and the Studio Help and Docs pane (`sanity/components/help/helpDocs.ts`, SNV 1).

### 9.5 Poster by state (reduced motion, data saver, blocked, error)

Rule for every row: an uploaded poster wins; no state ever shows a blur, LQIP or placeholder; a user click always loads and plays (it overrides data saver and reduced motion, because it is an explicit request).

| State                            | Iframe providers (YouTube, Vimeo, Wistia, Cloudflare, Spotify, TikTok, Twitch)                                  | Mux                                                                                                | File                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Facade before load (`click`)     | uploaded, else stored provider thumbnail, else empty box plus `PlayOverlay` (TikTok, Twitch have none)          | uploaded, else the element mounts near the viewport and its first frame shows (section 9.1 rule 3) | same as Mux                                                                    |
| Reduced motion (background loop) | n/a (iframe backgrounds are warned against)                                                                     | uploaded, else Mux thumbnail at `thumbTime`; player not loaded; play control visible               | `poster` required; without it an empty box plus play control and a dev warning |
| Data saver (`preload="none"`)    | as facade                                                                                                       | uploaded, else Mux thumbnail                                                                       | `poster` required, as above                                                    |
| `blocked` (autoplay refused)     | YouTube: iframe unmounted, facade shown again. Others: poster plus `PlayOverlay` over the poster, iframe hidden | poster stays (no crossfade) plus `PlayOverlay`                                                     | same                                                                           |
| `error`                          | poster plus `ErrorMessage` with retry (below the media for YouTube)                                             | same                                                                                               | same                                                                           |

## 10. Sanity schema

Everything below lives on the shared `video` type in `library/sanity/reusables.tsx` (currently fields `sourceType`, `url`, `muxVideo`, `posterImage`, SNV 1) and must stay generic (AGENTS.md). Existing field names are unchanged. The hand-written `VideoField` type in `library/sanity/assetMetadata.ts` is edited by hand to match (SNV 6); `sanity.types.ts` regenerates through lint/typegen.

### 10.1 Fields

| Field         | Type                                                                 | Shown when (capability-table driven)                                                                                                                                       | Validation and notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceType`  | string (existing)                                                    | always                                                                                                                                                                     | existing options plus `cloudflare`: mux, youtube, vimeo, wistia, spotify, twitch, tiktok, cloudflare, url. `stegaClean` before comparing. Resolution to a provider: section 10.5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `url`         | url (existing)                                                       | not mux                                                                                                                                                                    | validators replace the react-player regexes (`MATCH_URL_*`) with `parseVideoUrl()` from `library/videos/providers/parse.ts`; must match the chosen provider; Wistia validated before mount; for `url`, accepts a file URL, an `.m3u8` HLS URL, or a pasted provider URL; `.mpd` (DASH) is rejected with a clear message                                                                                                                                                                                                                                                                                                                                                                                                            |
| `muxVideo`    | mux.video (existing)                                                 | mux                                                                                                                                                                        | unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `posterImage` | universalImage, `withAlt: false` (existing)                          | ALWAYS (today only mux)                                                                                                                                                    | optional override; description states: uploaded poster wins; recommended for hero Mux videos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `thumbnail`   | object `{ url, width, height, provider, fetchedAt }`                 | provider has `providerPoster` yes                                                                                                                                          | custom input only (section 11.1); read-only in the form                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `mode`        | string click/autoplay/background                                     | always; `background` option hidden if `background` is `no` (Twitch, Spotify); `autoplay` option hidden if `autoplay` is `no` (Spotify); YouTube shows the dev-warning note | default `click`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `loop`        | boolean                                                              | `loop` not `no`                                                                                                                                                            | hidden for Twitch, Spotify; TikTok description: set at load                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `muted`       | boolean                                                              | `muted` not `no`                                                                                                                                                           | forced on for autoplay/background                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `controls`    | string ours/provider/none                                            | `hideChrome` not `no`                                                                                                                                                      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `startTime`   | number (seconds)                                                     | `startTime` not `no`                                                                                                                                                       | non-negative                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `endTime`     | number                                                               | always (scripted)                                                                                                                                                          | greater than `startTime`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `chapters`    | array of `{ startTime, title }`                                      | mux or file                                                                                                                                                                | Mux: fed to `addChapters`; file: chapter list UI                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `title`       | string                                                               | always                                                                                                                                                                     | accessible name, analytics `video_title`, JSON-LD `name`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `mainContent` | boolean                                                              | not background                                                                                                                                                             | description explains eager load plus JSON-LD                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `jsonLd`      | object `{ description, uploadDate, duration, creatorName, expires }` | when `mainContent` or editor opts in                                                                                                                                       | filled by Generate from source (section 11.3); all editor-overridable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `privacy`     | boolean                                                              | `privacy` not `no`                                                                                                                                                         | default true (YouTube nocookie, Vimeo `dnt`); description: neither equals consent (PROV2 A1, B1; FEAT D)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `lcp`         | schema `options`, not data                                           | set by hero section schemas                                                                                                                                                | typed with `declare module "@sanity/types" { interface ObjectOptions { lcp?: boolean } }` in `library/sanity/video/lcpOption.ts` (file with an `export {}`). `ObjectOptions` is declared in `@sanity/types` (node_modules/.pnpm/@sanity+types@6.1.0.../lib/index.d.ts line 731 [REPO]), so `declare module "sanity"` would not merge. `@sanity/types` is not resolvable from the starter root today (`node_modules/@sanity` has no `types`), so the starter's package.json needs it as a dependency at the version `sanity` resolves (piece H, section 14.4). Whether the merge takes effect is confirmed with the type checker (S4). Used only by the Studio input; the section code passes the same value as the `priority` prop |

Limitation text from `LIMITATIONS` is appended to each field description, to the Sanity upload instructions, and to the component JSDoc (decision 2.1.1 of V3: stated in all three places). Twitch description: requires `parent`, min 400x300, no loop, no playback-rate. TikTok: no volume, no start time, no poster, per-domain limits. Spotify: audio, no volume/mute/loop/autoplay, preview-only without DRM. Vimeo: background/controls/rate/quality may need a paid plan.

### 10.2 Studio inputs shown only when valid

A single `VideoInput` (section 11.1) is wired through `components: { input }` on the `video` type (`ObjectComponents.input`, `@beta`, used in this repo already, SNV 1) and hides or shows fields through the standard `hidden` callbacks reading `supports()`.

### 10.3 Projection changes (`library/sanity/assetMetadata.ts`)

`reform::video` spreads `...`, so new plain fields flow through; no edit needed for `thumbnail`, `chapters`, `mode`, `title` [SNV 6]. There are no captions or transcript fields (O5). Edits: (1) `muxVideoDataProjection` adds `thumbTime`, `createdAt` (`asset->data.created_at`), `staticRenditions` (`asset->data.static_renditions`) and `playbackPolicy` (from `asset->data.playback_ids`; field names inside `playback_ids[]` are NOT VERIFIED, the type only lists the array, META); (2) keep `videoBlurUrl` (compat, ignored). Hand-edit `VideoField`.

### 10.4 Studio warnings (plain language)

- Hero (`options.lcp`) Mux video without `posterImage`: caution card. "This is a hero video with no uploaded poster. The automatic poster from Mux may differ in brightness from the video. Upload a poster for the best result." Not an error (V3 decision 14).
- Non-hero Mux without `posterImage`: soft hint. "Without a poster the video's own first frame is shown."
- Mux upload field description: the section 9.4 workaround text.
- Whether Sanity's Mux asset data exposes color tags (to warn only for untagged assets) is NOT VERIFIED (V3 section 10), so the warning is generic.

### 10.5 Field to prop mapping and source resolution

Precedence: an explicit prop wins over the field on `video`; a field wins over the default. `stegaClean` runs on the whole `video` object first.

| Sanity field (`video.*`)                 | Component prop                              | Default if neither                                | Notes                                           |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| `sourceType`, `url`, `muxVideo`          | resolved by `resolveSource` (below)         | none: render nothing                              | `src` and `playbackId` props override           |
| `posterImage`                            | `poster`                                    | none                                              | uploaded override                               |
| `thumbnail.url`                          | internal poster URL                         | none                                              | used only when no `poster` and no `posterImage` |
| `mode`                                   | `mode`                                      | `click`                                           |                                                 |
| `loop`                                   | `loop`                                      | `true` for background, else `false`               |                                                 |
| `muted`                                  | `muted`                                     | forced `true` for background; `true` for autoplay |                                                 |
| `controls`: `ours` / `provider` / `none` | `controls`: `true` / `"provider"` / `false` | per mode (section 5.2)                            |                                                 |
| `startTime`, `endTime`                   | `startTime`, `endTime`                      | none                                              |                                                 |
| `chapters`                               | `chapters`                                  | none                                              |                                                 |
| `title`                                  | `label` and `analytics.title`               | none                                              | accessible name, analytics, JSON-LD `name`      |
| `mainContent`                            | `mainContent`                               | `false`                                           |                                                 |
| `jsonLd`                                 | read by `VideoJsonLd`                       | none                                              | not a prop of `UniversalVideo`                  |
| `privacy`                                | `privacy`                                   | `true`                                            |                                                 |

`resolveSource(video: VideoField, overrides?: { src?: string | VideoFileSource[]; playbackId?: string }): ResolvedSource | null` lives in `providers/parse.ts` (plain TS, frozen with section 17.1):

1. `overrides.playbackId` or `sourceType === "mux"` gives `{ provider: "mux", playbackId }` (playback ID from the Sanity Mux asset, `asset->playbackId` in the existing projection [REPO assetMetadata.ts]).
2. `overrides.src` as a string is passed to `parseVideoUrl`; as an array it is `{ provider: "file", format: "native", sources }` (an `.m3u8` entry gives `"hls"`).
3. `sourceType` of `youtube`, `vimeo`, `wistia`, `twitch`, `tiktok`, `spotify`, `cloudflare`: `parseVideoUrl(url)` must return that provider, else `null` plus a dev warning.
4. `sourceType === "url"`: `parseVideoUrl(url)` by host. A pasted YouTube, Vimeo, Wistia, Twitch, TikTok, Spotify or Cloudflare URL resolves to that provider. Otherwise `.m3u8` gives `{ file, hls }`, any other http(s) URL gives `{ file, native }`.

## 11. Studio components and server route

### 11.1 `library/sanity/video/VideoInput.tsx`

Built from installed Sanity 6.20 types (SNV 1): `ObjectInputProps`, `onChange(PatchEvent | patch)`, `set`, `unset`, `setIfMissing`, `useFormValue`, `useClient` from `sanity` (exports other than `useFormValue` NOT VERIFIED; confirm with tsc, spike S4). Patches emitted inside an object input are relative to that object (parent prefixes the path; inferred from Studio sources, SNV 1). UI uses `@sanity/ui` (as `HelpDocPane` does, SNV 1). Sections: default form (`renderDefault`), `PosterPanel`, `GenerateFromSource`. No inline styles in new code even in Studio (the existing `calloutField` uses inline `style`, which AGENTS forbids; do not copy it, SNV 1). Studio CSS goes in `app/(sanity)/studio/[[...tool]]/style.css` (SNV 1).

`PosterPanel` (poster lookup):

1. Auto: when `sourceType` and `url` become valid, call the route with `kind=poster`. Store `{ url, width, height, provider, fetchedAt }` into `thumbnail`.
2. Preview shows "Automatic poster" or "Uploaded poster" (override).
3. Buttons: "Refresh thumbnail" (re-run), "Save a copy to Sanity" (section 11.2). Field description states the terms uncertainty: Spotify says do not store indefinitely; Vimeo and TikTok terms bar download/copy; YouTube API data storage is limited to 30 days (coverage of oEmbed data NOT VERIFIED) [V3 6; POST 6].
4. Hero/soft hints per section 10.4.

### 11.2 Save a copy

Asks the route (`kind=copy`) for the image bytes; the route re-derives the URL from provider and ID (never an arbitrary URL) and returns the bytes with `Content-Type` (a binary `Response` from a Route Handler follows the Web API; no docs example, SNV 3). The Studio uploads with `client.assets.upload("image", blob, { filename, contentType, source: { id, name, url } })` (all options VERIFIED, SNV 2), then patches `posterImage` with `setIfMissing({ _type: "image" })` and `set({ _type: "reference", _ref: asset._id }, ["asset"])` (how the Studio's own uploader builds the value, SNV 2). Assets are not drafted: the asset exists immediately and the draft references it (inference, SNV 7). Copy is off unless clicked. The "Save a copy" poster button carries no warning copy; editors just choose (O4). The route enforces the size and content-type limits in section 11.4. Blob filename and contentType handling NOT VERIFIED (SNV 2).

### 11.3 Generate from source

Button on the `video` field. Calls the route with `kind=meta`. Result is a list in a dialog, never an immediate write.

- Each row: field, current value, proposed value, badge `reliable` or `best effort`.
- Default checked only when the current value is empty AND the row is `reliable`. Rows with an existing value are unchecked and show a "Replace" toggle. Best-effort rows are unchecked. Nothing is overwritten silently.
- Apply sends one patch batch of `set` calls for the checked rows.
- Fields: `title`, `jsonLd.description`, `jsonLd.uploadDate`, `jsonLd.duration`, `thumbnail`, plus Mux values read from the Studio document (no network).

What each source reliably provides (live-verified, META unless noted):

| Source     | Reliable (default checked if empty)                                                                                        | Best effort (unchecked, flagged)                                                                                                                                                                                | Manual only                                                                                                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| YouTube    | `title` (oEmbed), `thumbnail` (oEmbed + real-status check), `embedUrl` derived                                             | `description`, `duration` (ISO already), `uploadDate` from the watch page `<meta itemprop>` via server fetch: HTML scraping, fragile, YouTube ToS permission NOT VERIFIED, EU consent interstitial NOT VERIFIED | creator if absent. Optional: with `YOUTUBE_API_KEY` set, use Data API `videos.list part=snippet,contentDetails` (1 quota unit; key requirement inferred; NOT VERIFIED live) and mark those rows `reliable` |
| Vimeo      | `title`, `description`, `duration` (seconds to ISO), `thumbnail`, `embedUrl` (oEmbed, CORS `*`)                            | `uploadDate` (no timezone, zone unknown, emit the date only)                                                                                                                                                    |                                                                                                                                                                                                            |
| Wistia     | `title`, `duration`, `thumbnail`, `embedUrl` (documented oEmbed, POST 3)                                                   | `uploadDate` (`createdAt` unix), `description` (`seoDescription`, often empty), `contentUrl` (mp4 asset): all from the undocumented `/embed/medias/{id}.json`                                                   |                                                                                                                                                                                                            |
| Mux        | `duration`, `aspect` (Sanity asset `data`, no network)                                                                     | `uploadDate` = asset `created_at` (upload time, not publish time), `title` = `filename`                                                                                                                         | `name`, `description`; `contentUrl` only if `staticRenditions` lists a file                                                                                                                                |
| File URL   | `contentUrl` (the URL)                                                                                                     | `duration` (Studio reads `loadedmetadata` from a `<video preload="metadata">`; cross-origin behavior NOT VERIFIED), `uploadDate` from `Last-Modified` (host dependent, CORS dependent)                          | `title`, `description`                                                                                                                                                                                     |
| Spotify    | `title`, `thumbnail` (oEmbed)                                                                                              | none                                                                                                                                                                                                            | `duration`: only by scraping the embed page (undocumented), not offered                                                                                                                                    |
| Cloudflare | `thumbnail` (constructed from customer code and UID, no network), `embedUrl` (`{base}/iframe`, pattern not requested live) | `duration` (from `{base}/manifest/video.mpd` `mediaPresentationDuration`, META)                                                                                                                                 | `title`, `description`, `uploadDate` (no oEmbed; needs an API token, NOT VERIFIED)                                                                                                                         |
| Twitch     | none (no oEmbed; Helix needs a token)                                                                                      | none                                                                                                                                                                                                            | everything                                                                                                                                                                                                 |
| TikTok     | `embedUrl` only (oEmbed returns no title, thumbnail or duration)                                                           | none                                                                                                                                                                                                            | everything                                                                                                                                                                                                 |

Google VideoObject requires `name`, `thumbnailUrl`, `uploadDate`; recommends `contentUrl`/`embedUrl`, `description`, `duration`, `creator` [META Google]. If a required field is empty, `videoObjectJsonLd()` returns `null` (dev warning), so the component never emits invalid JSON-LD.

### 11.4 Route: `app/(sanity)/api/video-lookup/route.ts` (starter) + `library/videos/server/lookup.ts` (library, generic)

- `GET ?kind=poster|meta|copy&provider=&id=&hash=&customerCode=`. There is no `referer` parameter: Vimeo domain-privacy lookups send `Referer: <siteURL>` taken from `library/siteURL` (REPO), never a caller value. The route handler (starter) only wires; all logic lives in the library so other sites reuse it.
- Route Handlers are uncached by default [SNV 3]; mark `dynamic = "force-dynamic"` and `cache: "no-store"` fetches explicitly (the library's `liveProxy.ts` already uses `force-dynamic`, SNV 3). Do not enable cached components. Responses carry `Cache-Control: no-store` and no CORS headers.
- Same-origin: the Studio is embedded at `/studio` (client page), and `app/(sanity)/api/*` already hosts routes [SNV 3]. No middleware or proxy exists [SNV 3]. Allow a `lookupEndpoint` option (`VideoConfig`) for a Studio hosted elsewhere (JUDGMENT).
- SSRF safety by construction: the route accepts only `provider` + `id` (validated by per-provider regex with a length cap), builds URLs from constant hosts, and never fetches a caller-supplied URL. Image hosts are not hard-coded as an allowlist for display (Spotify host changed, PROBE 4) but are derived from the oEmbed response of the fixed oEmbed host.
- Abuse limits (REVIEW M10):
  1. `Sec-Fetch-Site` must be `same-origin`; a missing or different value returns 403. Browsers always send it on the Studio's fetches; it is a cheap filter against cross-site pages and scripts, not authentication (O3: none is planned) (non-browser clients can forge it). That the Studio sends `same-origin` from `/studio` is NOT VERIFIED (confirm in S4).
  2. `kind=copy`: only image bytes from the provider-derived URL; require `content-type: image/*`; reject when `content-length` exceeds 5 MB and abort the stream once 5 MB is read (limit is JUDGMENT); one fetch per call.
  3. Every upstream fetch uses `AbortSignal.timeout(5000)`; JSON bodies are read with a size cap.
  4. The bandwidth proxy is bounded per request and not rate limited; no rate-limit work is in scope (O3).
- YouTube thumbnail test: real HTTP status, not content-type (PROBE 1).
- Authentication: none (O3, DECIDED). The route has no authentication and no auth work is planned. The cheap safeguards above stay: provider and id only, same-origin check, size caps, timeouts, no caller URLs.
- Response type:

```ts
export interface VideoLookupResult {
	poster?: { url: string; width: number; height: number; provider: VideoProvider }
	meta?: Partial<
		Record<
			| "title"
			| "description"
			| "uploadDate"
			| "duration"
			| "embedUrl"
			| "contentUrl"
			| "creatorName",
			{ value: string; reliability: "reliable" | "best-effort" }
		>
	>
	warnings: string[]
}
```

### 11.5 Next 16 notes for implementers

Read `node_modules/next/dist/docs/` before coding: `01-app/03-api-reference/03-file-conventions/route.md`, `01-app/02-guides/json-ld.md`, `03-api-reference/02-components/image.md` (SNV 3, 4). `next/image` is not used for provider posters. `priority` is deprecated in Next 16 (use `preload`, `loading`, `fetchPriority`) [SNV 4].

## 12. JSON-LD

### 12.1 API

```ts
export function videoObjectJsonLd(input: {
	video: VideoField
	pageUrl?: string
	context?: VideoJsonLdContext
}): VideoObjectJsonLd | null
export function VideoJsonLd(props: { video: VideoField; pageUrl?: string }): JSX.Element | null
```

`VideoJsonLd` is a plain, non-async component with no `"use client"` directive and no server-only imports, so it works whether imported from a server component or from the client `UniversalVideo` (it renders in the server pass of the client tree either way). It renders `<script type="application/ld+json">` with `JSON.stringify(...).replace(/</g, "\\u003c")` (the Next guide's XSS note, `01-app/02-guides/json-ld.md`). `UniversalVideo` renders it automatically for `mainContent`; otherwise the site renders `VideoJsonLd` (or calls the helper) from its own section code. The helper never fetches: it uses stored fields only, so render stays static (no network at render).

Resolution order per property: editor field (`title`, `jsonLd.*`) > stored `thumbnail`/Mux asset data > derived from IDs.

### 12.2 Field mapping per source (VideoObject property -> where it comes from)

| Property                  | Mux                                                                                                                                                                  | File                | YouTube                              | Vimeo                                                             | Wistia                                        | TikTok / Twitch                                             | Spotify     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- | ----------- |
| `name` (required)         | `title` field                                                                                                                                                        | `title`             | `title` or stored oEmbed title       | same                                                              | same                                          | `title` field                                               | not emitted |
| `thumbnailUrl` (required) | uploaded `posterImage` CDN URL, else `image.mux.com/{id}/thumbnail.jpg?time={thumbTime}` (lifted color caveat; the URL is stable, Google needs a stable URL, FEAT C) | uploaded poster     | stored provider thumbnail            | stored                                                            | stored                                        | uploaded poster only                                        |             |
| `uploadDate` (required)   | `jsonLd.uploadDate` else asset `created_at` (upload time)                                                                                                            | `jsonLd.uploadDate` | `jsonLd.uploadDate`                  | same (date only)                                                  | same                                          | `jsonLd.uploadDate`                                         |             |
| `description`             | `jsonLd.description`                                                                                                                                                 | same                | same                                 | same                                                              | same                                          | same                                                        |             |
| `duration`                | asset `duration` -> `PT#H#M#S`                                                                                                                                       | `jsonLd.duration`   | `jsonLd.duration`                    | same                                                              | same                                          | same                                                        |             |
| `contentUrl`              | only if `staticRenditions` lists an MP4 (C1)                                                                                                                         | the file URL        | none (YouTube exposes none, META)    | none (needs API token)                                            | public mp4 asset URL if present (best effort) | none                                                        |             |
| `embedUrl`                | none (HLS only; `player.mux.com/{id}` NOT VERIFIED)                                                                                                                  | none                | `https://www.youtube.com/embed/{id}` | `https://player.vimeo.com/video/{id}` (omit for unlisted/private) | `https://fast.wistia.net/embed/iframe/{id}`   | TikTok `https://www.tiktok.com/player/v1/{id}`; Twitch none |             |
| `creator`                 | `jsonLd.creatorName`                                                                                                                                                 | same                | same                                 | oEmbed `author_name` if generated                                 | same                                          | same                                                        |             |
| `expires`                 | `jsonLd.expires`                                                                                                                                                     | same                | same                                 | same                                                              | same                                          | same                                                        |             |

Notes: TikTok `embedUrl` uses the player URL (`/player/v1/{id}`), which Google may not accept as an embed page; best effort. The Mux `thumbnailUrl` fallback is the lifted Mux thumbnail; prefer an uploaded `posterImage` whenever `mainContent` is set (a Studio hint says so). Cloudflare: `name` from `title`, `thumbnailUrl` the constructed thumbnail or the uploaded poster, `embedUrl` `{base}/iframe`, no `contentUrl`. `jsonLd.uploadDate` accepts a date-only value (valid ISO 8601).

Not included: `hasPart` Clip (needs page deep links and videos of 30 s or more, FEAT C), `publication` live badge, `regionsAllowed`/`ineligibleRegion`, `interactionStatistic`. Video sitemaps are not generated (HLS-only Mux videos would need `content_loc` or `player_loc`; streaming protocols are not supported in sitemaps, FEAT C).

## 13. Analytics (decision 2.2.4)

Opt-in per video with `analytics` or site-wide through `VideoConfigProvider` (below); default off. Site-wide config cannot be a module function called from a server component: Next has separate server and client module graphs, so a `configureVideo()` call in `app/layout.tsx` would mutate only the server copy and a function (`canTrack`) cannot cross the boundary as a prop. Instead `library/videos/config.tsx` (`"use client"`) exports `VideoConfigProvider` and `useVideoConfig()`; the starter renders `<VideoConfigProvider value={videoConfig}>` inside `app/components/Providers/index.tsx`, which is already a `"use client"` file used by `app/layout.tsx` as `GlobalProviders` [REPO]. `videoConfig` (including `canTrack`) is defined in a client module. Without the provider the defaults apply (`analytics: false`, `maxConcurrent: 3`). Two independent outputs:

1. `onVideoEvent(event)` callback: always available to developer code, not tracking by the component.
2. `dataLayer` push: only when `analytics` is on AND `Array.isArray(window.dataLayer)` AND `canTrack()` (if provided) does not return false AND `navigator.globalPrivacyControl !== true` (GPC is Firefox-only, a bonus signal; Brave and DuckDuckGo support NOT VERIFIED, META). The component never creates `dataLayer` and never loads a tag manager. Tags are installed through Sanity `settings.tags[].embed` and the starter has no analytics or consent code (MEM A.3); there are no hard-coded IDs.

Event schema (names follow GA4 enhanced measurement; parameters follow GA4's `video_*` set, FEAT D):

| `event`          | When                                                                                                                                          | Parameters                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `video_start`    | first transition to playing per load                                                                                                          | `video_provider`, `video_id`, `video_title`, `video_url`, `video_duration`, `video_current_time`, `video_percent: 0`, `video_mode`, `visible` |
| `video_pause`    | user or trigger pause, not at end                                                                                                             | same + current time and percent                                                                                                               |
| `video_progress` | natural playback crosses 10, 25, 50, 75 percent, once each per load; seeking past a threshold does not fire it (matches GTM behavior, FEAT D) | same + `video_percent`                                                                                                                        |
| `video_complete` | `ended` (not emitted for looping videos)                                                                                                      | same, `video_percent: 100`                                                                                                                    |
| `video_error`    | terminal error after retries                                                                                                                  | `video_error_code`, `video_error_message`                                                                                                     |

`video_provider` is `youtube`, `vimeo`, `wistia`, `mux`, `file`, `twitch`, `tiktok`, `spotify`. GA4 itself only measures YouTube embeds with JS API support (thresholds 10/25/50/75, no 90) [FEAT D]; since our YouTube element sets `enablejsapi=1` [PROV2 A4], enabling both GA4 enhanced video measurement and `analytics` double counts YouTube: the schema description says so, and a site avoids it by passing `analytics={false}` on YouTube videos. GTM's YouTube trigger can append `enablejsapi` and reload a playing video [FEAT D]. Background loops default to `analytics: false` regardless of the site switch.

Mux Data is separate: auto-on for Mux-hosted sources, `disable-tracking` turns it off, `disable-cookies` removes the cookie [MUX3 11]. `muxData` prop: `true` | `false` | options; when `canTrack()` is false or GPC is true, `disable-tracking` and `disable-cookies` are set. Default is on (O1, DECIDED): Mux Data stays on by default and is forced off (`disable-tracking` and `disable-cookies`) when `canTrack()` is false or GPC is true.

## 14. File layout

### 14.1 `library/videos/` (generic, shared; new unless noted)

```
UniversalVideo.tsx            root, compound export, "use client"
UniversalVideo.css.ts         structural layout only (styled)
types.ts                      all public types (section 5.5; no runtime code)
capabilities.ts               shared capability table (plain TS)
config.tsx                    VideoConfigProvider, useVideoConfig, DEFAULT_VIDEO_CONFIG ("use client")
providers/
  registry.ts                 registerProvider, resolveProvider (client-importable, no server code)
  parse.ts                    parseVideoUrl(), resolveSource(), per-provider ID regexes (plain TS, server safe)
  mux.ts file.ts youtube.ts vimeo.ts wistia.ts twitch.ts tiktok.ts spotify.ts cloudflare.ts
controller/
  createController.ts         external store, command queue, reconciler
  stateMachine.ts wanted.ts events.ts
  VideoContext.tsx useVideo.ts
trigger/
  sharedObserver.ts useInViewTrigger.ts concurrency.ts
poster/
  Poster.tsx posterUrls.ts
facade/
  Facade.tsx preconnect.ts
parts/
  Controls.tsx PlayButton.tsx PlayOverlay.tsx MuteButton.tsx VolumeSlider.tsx Scrubber.tsx
  CurrentTime.tsx Duration.tsx TimeDisplay.tsx FullscreenButton.tsx CaptionsButton.tsx Captions.tsx
  PlaybackRateButton.tsx QualityMenu.tsx AudioTrackMenu.tsx ChaptersMenu.tsx
  PiPButton.tsx CastButton.tsx Loading.tsx ErrorMessage.tsx DefaultControls.tsx
analytics/
  analytics.ts progress.ts
seo/
  videoObjectJsonLd.ts VideoJsonLd.tsx
server/
  lookup.ts muxTokens.ts      (no "use client"; Node only)
compat/
  index.ts                    deprecated wrappers (section 15)
BackgroundVideo.tsx CarouselBGVideo.tsx MuxVideo.tsx BatterySaverVideo.tsx LazyVideo.tsx VideoEmbed.tsx   existing files become thin wrappers re-exporting compat
BackgroundVideoOriginal.tsx   deleted
```

`library/sanity/video/` (inside the Sanity watch patterns, SNV 6): `VideoInput.tsx`, `PosterPanel.tsx`, `GenerateFromSource.tsx`, `videoFields.ts` (field builders used by `reusables.tsx`), `lcpOption.ts` (the `@sanity/types` augmentation). `library/sanity/SanityImage.tsx` gets the `noLqip` prop (section 9.2). `library/CHANGELOG.md`: migration notes (required, AGENTS.md): include the new `noLqip` prop, and that icons use `*.inline.svg`, which every consuming site's Turbopack config must handle (the starter's `next.config.ts` has the rule).

### 14.2 Starter

```
app/(sanity)/api/video-lookup/route.ts          wiring only
app/components/Providers/index.tsx              existing "use client" file; renders VideoConfigProvider (piece G)
app/visual-tests/video/page.tsx                 existing, untracked; stays untouched as the old-component comparison until migration ends
app/visual-tests/universal-video/page.tsx       the acceptance page (section 20; piece I)
sanity/schemas/documents/videoTestCase.ts       test-case document type, registered in sanity.config.ts (piece I)
scripts/seed-video-tests.ts                     seed script (piece I)
sanity/components/help/helpDocs.ts              Mux poster/re-encode instructions, limitation notes (piece E)
sanity/schemas/sections/*.ts                    hero sections set options.lcp and pass priority in components (piece H)
```

### 14.3 Boundaries

`capabilities.ts`, `parse.ts`, `videoObjectJsonLd.ts`, `types.ts` import nothing client-only so Sanity schema extraction and server components can import them. Element packages and provider modules are only reached through dynamic `import()` from `registry.ts` `load()`, so no provider code or hls.js lands in the main chunk (REL 3) and no server module imports them.

### 14.4 Dependencies and pinning

Already done [REPO]: `library/package.json` (uncommitted in the library working tree) pins exactly `@mux/mux-video` 0.31.6, `hls-video-element` 1.5.12, `youtube-video-element` 1.9.1, `vimeo-video-element` 1.7.4, `wistia-video-element` 1.4.0, `twitch-video-element` 0.2.0, `tiktok-video-element` 0.1.2, `spotify-audio-element` 1.0.5, `cloudflare-video-element` 1.3.6, and keeps `@mux/mux-video-react` ^0.31.6. All nine are installed at those versions (`library/node_modules`), and a build importing all nine on Next 16 passed [CALLER]. `dash-video-element` is neither pinned nor installed and is not used. Remaining package work (piece H only): add `@sanity/types` to the starter's package.json at the version `sanity` resolves (section 10.1); remove `@mux/mux-video-react` from `library/package.json` once the `MuxVideo` compat wrapper forwards to `UniversalVideo` and a grep shows no importer; update `pnpm-lock.yaml`. The packages are ESNext (private class fields); whether Next needs `transpilePackages` for Safari below 14.1 is spike S1 (the READMEs do not say, ELEM 5). `react-player` stays in the starter's `package.json` until other sites are confirmed not to use it (call sites in other repos unknown, V3 11); the new code does not import it, and after `reusables.tsx` drops the `MATCH_URL_*` imports piece H greps `library/sanity` for remaining `react-player` imports.

## 15. Migration map (7 old components)

All old export names remain, as thin deprecated wrappers in `library/videos/compat/`, forwarding to `UniversalVideo`. Old files with the same names re-export from compat. `BackgroundVideoOriginal` is deleted (no importers, name collision, INV 2.3). Only call sites found in this checkout: `VideoEmbed` in `app/sections/Sample.tsx:46` and `app/sections/blog/BlogRich.tsx:41`; the other six have no call sites here (INV 6). Other sites are unknown, so the wrappers must honor every old prop.

| Old                       | Old props                                                                                                                                                                                                                                  | New mapping                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Behavior changes                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CarouselBackgroundVideo` | `playbackId, videoBlurUrl, videoAspectRatio, videoDuration, poster, play, muted, loop, minResolution, maxResolution, renditionOrder, className, ref, videoRef, safariOptimized, eager, onEnded, onTimeUpdate, onLoadedMetadata, onPlaying` | `mode="background"`, `playbackId`, `play`, `muted`, `loop`, `mux={{minResolution, maxResolution, renditionOrder}}`, `aspectRatio=videoAspectRatio`, `poster`, `eager`; `videoBlurUrl` ignored; `videoDuration` ignored (no more `time=undefined`); `safariOptimized` kept as alias of `eager` on Safari; `ref` stays the container, `videoRef` the media element in the wrapper                                                                                                  | no infinite 250 ms retry (2 retries then poster, `blocked` state); `onEnded` no longer fired on errors (fires on real end; failure goes to `onError`); pauses offscreen after load; reduced motion and data saver honored; poster default per section 9 (no `time=0`, honors `thumbTime`); blur layer gone                                                           |
| `BackgroundVideo`         | `playbackId, videoBlurUrl, videoAspectRatio, videoDuration, eager, play, muted, minResolution, loop, className, ref, posterOverride, onEnded, onTimeUpdate, onLoadedMetadata`                                                              | same mapping; `posterOverride` -> `poster`                                                                                                                                                                                                                                                                                                                                                                                                                                       | the second poster `<mux-video>` ("video-as-poster") is replaced by the first-frame rule; `play()` rejection no longer permanent failure                                                                                                                                                                                                                              |
| `BackgroundVideoOriginal` | n/a                                                                                                                                                                                                                                        | deleted                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | none                                                                                                                                                                                                                                                                                                                                                                 |
| `MuxVideo`                | `autoPlay, onTimeUpdate, onPlay, onPause, playbackId, className, style, muted, loop, playsInline, preload, onSeeked, controls, poster, ref, autoPlayFallbackTime, onEnded, preloadTrackable`                                               | `mode="autoplay"` when `autoPlay`, else `click`; forwards callbacks; `preferPlayback="mse"`, `renditionOrder="desc"`, `backBufferLength: 0` kept as Mux options (the hls config key goes through `_hlsConfig`, not in the verified attribute list: NOT VERIFIED if the new element keeps it); `style` prop is not forwarded (no inline styles, dev warning); `preloadTrackable` ignored; no `@mux/mux-video-react` import remains once this wrapper forwards to `UniversalVideo` | `autoPlayFallbackTime`: on `blocked`, the wrapper seeks to `autoPlayFallbackTime ?? duration`, sets preload metadata and dispatches a fake `ended`, exactly as the old wrapper did (slideshow logic), only inside the wrapper, never in the new API; the per-instance 100 ms interval is removed (pseudo-ended handled by the element's `ended` override, ELEM 2.10) |
| `BatterySaverVideo`       | `ComponentProps<typeof MuxVideo>`                                                                                                                                                                                                          | wrapper around the MuxVideo wrapper plus the `blocked` -> overlay behavior                                                                                                                                                                                                                                                                                                                                                                                                       | the monkey-patched `el.play` is gone; the overlay becomes `PlayOverlay` (label default "Site paused by low power mode", overridable via `labels`; icon `*.inline.svg`); the 5 s wait-for-interaction and retry becomes the one-time gesture retry (section 7); listeners are cleaned on unmount                                                                      |
| `LazyVideo`               | `poster (string), autoPlay, muted, loop, onLoad(video), children (<source>), className, style, ref`                                                                                                                                        | `src` built from `<source>` children, `mode` autoplay when `autoPlay`; wrapper keeps the `usePreloader().completed` gate (`usePreloader` is in `library/link`) and replaces its `ScrollTrigger` import and gating with `loadMargin` (the old ScrollTrigger start of 200 px before)                                                                                                                                                                                               | the new component has no GSAP import, and the compat wrapper drops its own `gsap` import; `style` not forwarded                                                                                                                                                                                                                                                      |
| `VideoEmbed`              | `video: VideoField, controls=true, resetOnPlay, className, ref`, all react-player props except `src/width/height`                                                                                                                          | `video`, `controls`, `mode="click"`; `resetOnPlay` -> seek to 0 on play; react-player props mapped for a subset (`playing -> play`, `muted`, `loop`, `controls`, `onReady`, `onPlay`, `onPause`, `onEnded`, `onError`, `onTimeUpdate`/`onProgress`); others ignored with a dev warning (O2, DECIDED)                                                                                                                                                                             | `ClientOnly` removed (SSR wrapper and poster now render); `posterImage` and `thumbTime` now work (the old component discarded the thumbnail, INV 2.7); Mux plays through `<mux-video>` instead of react-player/hls.js (no more `hls` first-match path); missing source warns in dev; `playsInline` forced as before                                                  |

Library CHANGELOG entry must list: new component, the compat wrappers and which behaviors changed, new Sanity fields, new route, the `VideoField` type change, `reform::video` projection additions.

## 16. Test plan

Checks follow AGENTS.md (section 17.4): only the integrator (piece H) runs `WIREIT_LOGGER=metrics pnpm lint` once, when all pieces are done (it includes typegen and projection checks); `pnpm exec tsc --noEmit` is the preferred type check while working; then one independent reviewer pass on the diff. `pnpm format` is never run (pre-commit hook). `pnpm build` and `pnpm dev` are not run on the agent's own initiative. The spikes that need a build (S1, S2, T5) are covered by the user's approval recorded in MEM PROGRESS per CALLER (not independently verified here); because library/CLAUDE.md requires asking before lint or build, the orchestrator confirms with the user at the start of the session and one agent runs those builds and shares the results. The user checks visually; no browser automation or screenshots are run by agents. The acceptance page is `/visual-tests/universal-video` (`app/visual-tests/universal-video/page.tsx`, section 20; visual tests are excluded from Lighthouse, commit 4e5b4d8). `/visual-tests/video` is kept only as the old-component comparison until migration.

### 16.1 Required tests

T1 Carousel (cloned slides, rapid mount/unmount). Page section with a loop carousel (for example Embla or Swiper style cloning) of at least 12 slides that clone the same `playbackId`, plus a control that mounts and unmounts the whole carousel every 100 ms for 10 seconds, in `StrictMode`. Pass: no `unhandledrejection` events; `AbortError` ignored; `getVideoDebugStats()` after teardown shows 0 mounted instances, 0 live observers, 0 retained `<video>`/custom elements; at most the concurrency cap playing at once; no hydration mismatch warnings; clones do not each load hls.js (one dynamic import); a cloned slide that mounts offscreen loads nothing until within `loadMargin`.
T2 Safari hidden video (required; the original bug may have been transient, V3). In Safari macOS and iOS, for background mode: (a) ancestor `display:none` then shown, (b) `visibility:hidden` then visible, (c) offscreen transform then onscreen, (d) tab hidden then shown, (e) our own opacity 0 to 1 crossfade, (f) bfcache back/forward. Pass: within 1 s of becoming visible a frame is painted and `playing` fires; poster crossfade completes; no stuck black frame; the component never uses `display:none` on the video itself.
T3 SSR import. (a) Node import of every provider module and the element packages with no DOM globals (extend `probe-ssr/ssr-import.mjs`, HAND; list exactly which modules, C16); (b) render `/visual-tests/universal-video` and inspect server HTML: wrapper with `aspect-ratio`, poster `<img>` (with `fetchpriority="high"` where `priority`), JSON-LD present for `mainContent`, and no `<video>`, `<iframe>`, `<mux-video>` or any other custom element, no `window is not defined`; (c) `capabilities.ts` and `parse.ts` import inside `sanity schema extract`. (a) is reduced by section 4.1 (no server module imports an element package) to a static reachability check plus the CALLER-reported build.
T4 Muted on the client-created element (React 19). After hydration, on the `<video>` the file adapter created (and on the Mux element): the `muted` attribute is present, `defaultMuted === true`, `muted === true`, `playsinline` set, all before `src` is assigned; muted autoplay works on iOS Safari. The test is run inside a React 19 client tree so any interference from React rendering around the element would show. There is no SSR-HTML assertion: the server HTML has no `<video>` (section 4.1). Reference: facebook/react#10389 [REL 4].
T5 Next 16 bundling. Production build with Turbopack (the starter disables `turbopackFileSystemCacheForBuild`, HAND): confirm each provider lands in its own lazy chunk and not in the page's first-load JS; ESNext private fields transpile for the target browsers (Safari below 14.1 per ELEM 5); `/react` wrapper vs plain element decision (S1); no double `customElements.define`; `next typegen` passes.
T6 Triggers. Built-in inView: play on enter, pause on leave, `once`; manual pause makes the trigger step aside until `releaseManualControl()`; GSAP ScrollTrigger driving `ref.play()/pause()` with `trigger={false}`; an IntersectionObserver driving `useVideo()` from a child.
T7 Autoplay and blocked: Chrome, Firefox with autoplay blocked, iOS Safari, iOS Low Power Mode (REL 1 is UNSURE); `blocked` shows poster + `PlayOverlay`; gesture retry works.
T8 Providers: for each source run play, pause, seek, mute, volume, rate, captions where `Y`; controls for `N` features are absent; best-effort ones show `data-support="best-effort"`. Specific cases: YouTube thumbnail that 404s (use `jNQXAC9IVRw`, maxres is a placeholder, PROBE 1); dead Vimeo URL (76979871); invalid Wistia URL (must not throw); Twitch on `localhost` and a deployed host (`parent`); TikTok volume control hidden; Spotify `controls` attribute handling (iframe visible); a basic-account Vimeo with `background=1` (C9).
T9 Posters: uploaded poster; Mux hero without poster (dev warning, crossfade); Mux non-hero first frame (S8); iframe thumbnail; no flash of empty/black on crossfade; LCP element is the poster `<img>` in a hero (check with the browser's LCP attribution).
T10 Mux color: on the acceptance page (`/visual-tests/universal-video`), side by side for tagged (`D3F3013ZPTNNKNY1e02ctl02z02IAw7lRyARzgryAFyPXXU`, smpte170m/bt709 tv, MEM) and untagged (`00dcym00XaHxqy7BJMgsjIe01trdJH8VIzWfBJqoffRd02o`, mean luma 37 vs 24, MEM) assets: video frame vs thumbnail vs re-encoded copy. Answers C3.
T11 Studio: field visibility per source; poster lookup; refresh; save a copy (asset has `source`); Generate from source dialog (no silent overwrites, rows unchecked when a value exists); hero warning; route behavior on a stega-encoded draft preview (inputs are not stega-affected, SNV 7).
T12 Stega: stega-encoded values in `sourceType`, provider ID, `title`, `startTime` as string; the component cleans before parsing; display text keeps stega only where intended.
T13 Analytics: with `window.dataLayer` absent nothing is pushed and nothing is created; present and `analytics` off nothing; on, events and thresholds 10/25/50/75 once each; `canTrack` false blocks; GPC true (Firefox) blocks; looping background emits nothing; YouTube double counting note verified with GA4 enhanced measurement enabled.
T14 JSON-LD: valid against Google's Rich Results Test (linked from the Next guide); `<` escaped; null when a required property is missing.
T15 Accessibility: keyboard on every part; names from `labels`; visible focus; 24x24 targets; pause control present for background loops over 5 s; Reduced motion; screen reader reads state changes.
T16 Controls: `useVideo()` custom UI outside the compound parts drives play/pause/seek/volume on a file, Mux, YouTube and Spotify source.

### 16.2 Spikes (need a build; approved)

S1 Media elements in Next 16 + React 19: bundling, ESNext transpile, need for `transpilePackages`, `/react` vs plain element.
S2 Static check (and a Node import if cheap) that no server-importable module reaches an element package, `@mux/mux-video`, `castable-video` or `@mux/playback-core` (C16).
S3 `muted` state on the client-created element inside a React 19 tree (T4).
S4 Sanity: confirm exports `set`, `unset`, `setIfMissing`, `useFormValue`, `useClient`, `ObjectInputProps` from `sanity`; that `declare module "@sanity/types"` merges `lcp` into `ObjectOptions` once `@sanity/types` is a starter dependency; same-origin route from the Studio including that it sends `Sec-Fetch-Site: same-origin`; binary response to Studio.
S5 YouTube `config` override of `cc_load_policy` (0 vs omitted) and `origin`.
S6 Removed (O5: no uploaded caption files, so no WebVTT CORS check).
S7 Removed (O5: no captions field; Mux text tracks come from the asset manifest and are checked through S10).
S8 Mux first-frame painting with `preload="metadata"` under hls.js.
S9 Browser comparison for the Mux fade (T10).
S10 Runtime check of the `?` cells in section 6.1 (YouTube PiP and quality, Wistia captions and PiP, Vimeo and Cloudflare items, Mux and file quality select/cap), owners: piece B for YouTube, Vimeo, Wistia; piece C for Cloudflare; piece A for Mux and file. A cell stays hidden (treated as `no`) until it is promoted in `capabilities.ts`.

## 17. Parallel work split (one session)

17.1 Freeze first (piece 0, one engineer, before anything else starts; others begin only when it is done): `types.ts` (all of section 5.5), `capabilities.ts` (table, `LIMITATIONS` text, `supports()`), `providers/parse.ts` (`parseVideoUrl`, `resolveSource`; plain TS, small), the `ControllerInternals` interface and `controller/events.ts` types, and the one-time `VideoField` type edit in `assetMetadata.ts`. Ownership of those files then passes as listed in 17.2; no file is edited by two pieces.

17.2 Pieces and file ownership (each file has exactly one owner):

| Piece                  | Files                                                                                                                                                                                                                                                         | Depends on                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 0 Freeze               | `types.ts`, `capabilities.ts` (including `LIMITATIONS` text), `providers/parse.ts`, `controller/events.ts`, the `ControllerInternals` interface, `VideoField` edit                                                                                            | none                                   |
| A Core                 | `controller/*` (except `events.ts` types, which it implements against), `providers/registry.ts`, `providers/file.ts`, `providers/mux.ts`, `UniversalVideo.tsx`, `UniversalVideo.css.ts`, `poster/*`, `trigger/*`, `library/sanity/SanityImage.tsx` (`noLqip`) | piece 0                                |
| B Embeds               | `providers/youtube.ts`, `vimeo.ts`, `wistia.ts`, `facade/*`                                                                                                                                                                                                   | piece 0                                |
| C Basic tier           | `providers/twitch.ts`, `tiktok.ts`, `spotify.ts`, `cloudflare.ts` (TikTok and Spotify need their own message handling where the elements drop events)                                                                                                         | piece 0                                |
| D Controls             | `parts/*`, `DefaultControls`, captions cue display, chapters UI; follows the styling brief in 5.4                                                                                                                                                             | piece 0                                |
| E Sanity               | `library/sanity/video/*` (including `lcpOption.ts`), `reusables.tsx` field builders, `assetMetadata.ts` projection (after the freeze edit), `sanity/components/help/helpDocs.ts`                                                                              | piece 0                                |
| F Lookup and SEO       | `server/lookup.ts`, `server/muxTokens.ts`, `app/(sanity)/api/video-lookup/route.ts`, `seo/*`                                                                                                                                                                  | piece 0                                |
| G Analytics and config | `analytics/*`, `config.tsx`, the `VideoConfigProvider` wiring in `app/components/Providers/index.tsx`                                                                                                                                                         | piece 0                                |
| I Showcase             | `sanity/schemas/documents/videoTestCase.ts` and its registration in `sanity.config.ts`, `scripts/seed-video-tests.ts`, `app/visual-tests/universal-video/page.tsx` (page, playground panel, GSAP ScrollTrigger demo), typegen run for the new type            | pieces A to G (page), piece 0 (schema) |
| H Integrator           | `compat/*`, old file wrappers, `library/CHANGELOG.md`, `library/package.json`, starter `package.json`, `pnpm-lock.yaml`, `sanity/schemas/sections/*` (`lcp` flags), the single lint run and the reviewer pass                                                 | all                                    |

17.3 Not integration features, not specified here (outside the scope rule; add on request): lightbox/`<dialog>` playback, sticky mini-player, resume-where-left-off (privacy/consent concern, FEAT row 6), video sitemap generation, sign-language slot, double-tap seek (no sourced pattern), art-direction re-selection on resize (only the one-time `<source media>` is supported, FEAT A6), `prefers-reduced-data` (experimental, FEAT A7), RTL polish, A-to-B loop range.

17.4 Execution rules for agents (AGENTS.md, library/CLAUDE.md): only piece H runs `WIREIT_LOGGER=metrics pnpm lint`, once, at the end. All other pieces use `pnpm exec tsc --noEmit` for type checks and never run lint, format, `pnpm build` or `pnpm dev`. One designated agent runs the build-dependent spikes (S1, S2, T5, S4 as needed) after the session-start confirmation described in section 16, and shares the output. Freeze brief for every piece: JSDoc on props only, no narration or section comments; no `any`; no inline styles; `css` needs `f.responsive` or `f.unresponsive`; `f.small` not `f.mobile`; Capsize only on text-bearing elements; React Compiler rules (section 8.3); read `library/styled/README.md` before writing CSS and `node_modules/next/dist/docs/` before Next work.

17.5 Signed Mux playback helper (`server/muxTokens.ts`): RS256 JWT with claims `sub` (playback ID), `aud` (`v` video, `t` thumbnail, `g` gif, `s` storyboard, `d` DRM), `exp`, `kid`; thumbnail/resolution options inside the claims; signing key and private key from site env (not in the library) [FEAT F; MUX3 2]. No signing key was available, so successful signed requests are NOT VERIFIED (MUX3 15).

## 18. NOT VERIFIED (do not rely on)

Playback and runtime

- Any runtime behavior of TikTok, Twitch, Spotify embeds (no browser run): autoplay success, TikTok `setVolume` actually working, Twitch `controls=false`/`volume`/`quality` params, Twitch `error` event per code, Spotify runtime `error` events, Spotify full-track playback without login (BASIC 5).
- Mux: signed requests succeeding, DRM playback, 4K, live/DVR with our element, `static_renditions` names `capped-1080p.mp4` and `{res}.mp4`, thumbnail rate-limit enforcement, Mux CMCD docs, manual rendition selection API on mux-video, browser rendering of untagged assets (C3) (MUX3 15).
- hls.js text tracks via `hls-video-element`; live via our element. (DASH is out of scope; `dash-video-element` is not installed.)
- Cloudflare: every runtime behavior of `cloudflare-video-element` in a browser, `iframe.videodelivery.net/<uid>`, signed token mechanics, SDK event names vs docs, which SDK host stays valid, name/description/uploadDate sources (PROV2 C).
- The `?` cells of section 6.1 (spike S10).
- That a production build importing all nine element packages passed on Next 16 (reported by CALLER; no report file or log was read for this).
- YouTube: JS-set cookies and storage, runtime hosts, `getAvailableQualityLevels`/`setPlaybackQuality` at runtime, whether `mute=1` URL param is honored, whether the IFrame API adds `origin`, PiP, remote playback (PROV2 A).
- Vimeo: plan gating (C9), cookie list beyond `__cf_bm`, text track and chapter shapes, audio track method semantics, `#t` details, real-device volume/PiP/remote (PROV2 B).
- Captions (O5): that Mux asset text tracks in the HLS manifest surface as `textTracks` on `<mux-video>` and render through our `Captions` part (the dataset shows 2 of 3 `mux.videoAsset` docs with a `text` track, `data.tracks`, which does not prove client playback); that HLS, Vimeo, Cloudflare tracks do the same.
- Wistia: textTracks exposure on the inner video, chapters, domain-restricted media behavior, E-v1 removal plan, caption file URLs (PROV2 D, ELEM 2.1).
- TikTok: short-link resolution, EU consent UI, any poster source (BASIC 1d).
- Twitch: `/docs/embed/everywhere/` (403), Helix metadata, where the no-`parent` 302 goes, live preview thumbnails while online (BASIC 2).
- Native `<video>`: iOS volume setter, `loading="lazy"` on video shipping status, `fetchpriority` on `<video poster>`, `descriptions` and `chapters` track behavior in shipping browsers (SNV 8d), iOS iPhone fullscreen with custom controls, iOS Low Power Mode behavior (REL 1 UNSURE), range requests on Blob/S3/R2.
- Whether Googlebot indexes a player created after hydration (sections 4.1, 4.2); Google video-indexing behavior for `mainContent`.
- Muted autoplay on iOS for the client-created native `<video>` (T4, T7).
- Legal sufficiency of privacy params for GDPR; whether YouTube terms cover oEmbed data; copy/re-hosting terms for Vimeo, TikTok, Twitch, Wistia, Spotify (POST 6).
- YouTube policy quote (C11); whether `sddefault` has letterbox bars; `cc_load_policy: 0` vs omission.
- Metadata: YouTube watch-page scraping ToS and EU consent interstitial, YouTube Data API key behavior live, Vimeo `upload_date` timezone, Loom/Streamable fields, Wistia `/embed/medias` as a supported API, `seoDescription` coverage, Cloudflare name/description/date, Mux `playback_ids[].policy` field name in stored data, `static_renditions` presence in stored data (META, C1).
- Sanity: that `declare module "@sanity/types"` merges `lcp` once the package is a starter dependency (interface location verified, merge not), that the Studio sends `Sec-Fetch-Site: same-origin`, Vercel firewall rate limiting on this plan, exports from `sanity` beyond `useFormValue`, whether Mux asset data exposes color tags, draft/preview and Portable Text specifics, Studio `useClient` write permission, Blob filename/contentType handling, `next-sanity` resolved version (13.1.1 vs 13.4.0) (SNV).
- Build: per-provider lazy chunking under Turbopack (S1, T5), `transpilePackages` need (S1), static reachability of element packages from server modules (S2).
- GPC support in Brave and DuckDuckGo (META).
- Video.js 10 GA status (not used).
- Other sites' call sites of the old components (V3 11); whether `react-player` is imported elsewhere.

## 19. Decisions (all DECIDED) and final decisions log

All five former open decisions are decided by the user. Nothing in this spec is pending.

O1 (DECIDED). Mux Data stays on by default in `<mux-video>` [MUX3 11] and is forced off (`disable-tracking` and `disable-cookies`) when `canTrack()` is false or GPC is true. Site analytics (decision 2.2.4) stays opt-in and separate.
O2 (DECIDED). `VideoEmbed` keeps only the mapped subset of react-player props (section 15); all others are ignored with a dev warning.
O3 (DECIDED). The lookup route has no authentication and no auth work is planned. The cheap safeguards stay: provider and id only, same-origin check, size caps, timeouts, no caller URLs (section 11.4).
O4 (DECIDED). An uploaded poster on a YouTube video is allowed with no warning and no block. The "Save a copy" poster button has no warning copy; editors just choose. C11 stays a documentation item only.
O5 (DECIDED). No custom Sanity captions field and no transcript field. Captions are only whatever the source already carries: Mux asset text tracks (in the HLS manifest), HLS, YouTube, Vimeo, Wistia and Cloudflare own tracks. The controls show a caption button only when tracks exist. Caption upload fields, spike S6 and spike S7 are removed. Evidence: 2 of 3 `mux.videoAsset` documents in the dataset report a `text` track (`data.tracks`).

### 19.1 Final decisions log (user decisions, 2026-10-27)

1. Facade vs indexing: `autoplay` and `background` modes load the real player (no facade); `click` defaults to the facade; `mainContent` loads the player eagerly and renders JSON-LD, which is optional otherwise, with a Generate-from-source button in the Studio.
2. Basic tier for Twitch, TikTok and Spotify, with every officially supported feature per source.
3. Triggered playback: a built-in `trigger` plus a controller (ref and `useVideo`) so custom code can drive playback.
4. Analytics: opt-in only; events are pushed only when `window.dataLayer` already exists; nothing hard-coded; tags come from Sanity `settings.tags`.
5. Every officially supported feature is in scope.
6. One-session delivery (no phases).
7. The existing `youtube` schema type stays untouched.
8. No generic oEmbed fallback now (the registry stays oEmbed-ready).
9. Showcase page `/visual-tests/universal-video` with load-bearing example settings; its data lives in the Sanity `videoTestCase` document type, seeded by a script the user runs (section 20).
10. O1 to O5 as decided above.

## 20. Showcase and test page (user requirement, 2026-10-27)

Goal: one page that exercises every source, mode and option so the user can judge behavior in a real browser.

- URL: `/visual-tests/universal-video` in the starter (excluded from Lighthouse like the other visual tests) is the single acceptance page for every test in section 16. The old-component comparison page at `/visual-tests/video` stays untouched until migration is done, then is removed. Owner: piece I (section 17.2).
- Data lives in Sanity. A starter document type `videoTestCase` holds the shared `video` object plus `title`, `scenario` (group) and `note` (what it demonstrates). The page queries them with GROQ and renders each with UniversalVideo, so the real editor path is exercised, not hard-coded props.
- Seeding: `scripts/seed-video-tests.ts`, modeled on `scripts/reset-to-baseline.ts` (SANITY_SEED_TOKEN, `@sanity/client`, `--dry-run`), with deterministic document IDs so it is safe to re-run. It writes to the live dataset, so the user runs it (the agent never has the token); the page must render a clear empty state ("no test cases: run the seed script") when the query returns nothing. The `videoTestCase` document type is registered in `sanity.config.ts` (where `logoSet` is registered [REPO]) and typegen is run so the lint typegen check passes. It reuses the dataset's existing `mux.videoAsset` documents by reference and public test URLs for every other source.
- Scenarios: every source (file, Mux, HLS, YouTube, Vimeo, Wistia, Cloudflare, Twitch, TikTok, Spotify; no DASH); every mode (background, autoplay, click with facade, controls, mainContent with JSON-LD); triggers (built-in inView, and a GSAP ScrollTrigger driving the controller); carousel with cloned slides; Safari hidden-video case; poster cases (uploaded, Mux thumbnail beside the real frame, first frame, lcp hero fallback); captions; analytics.
- Playground panel: pick a source and change options live (mode, trigger settings, controls, poster behavior, muted, loop, analytics). Shows the exact props in use and a live event log fed by a stub `dataLayer`.
- Constraints: no inline styles (use styled `tokens`), UI built from the project's styled components and tokens, no section comments or narration.
- Build order: piece 0 (types, capability table, parse.ts) first, then the test-case schema, seed script and page (piece I, after pieces A to G land).

## 21. As built (2026-10-27): differences from sections 1 to 20 and open items

This section wins over any earlier text. Everything here was found by testing the showcase in Safari and headless Chrome.

### 21.1 Behavior that differs from the spec

- YouTube controls are an overlay like every other source (the "below, never over the iframe" rule from section 4.1 and 5.4 was dropped by decision). `controlsPlacement="below"` still works as an option. Loading and error parts render inside the stage for every provider.
- Mux automatic poster: `DEFAULT_MUX_POSTER_TIME = 0.04` s (library/videos/poster/posterUrls.ts) when neither `posterTime` nor the editor's `thumbTime` is set. Frame 0 of most footage is a dark fade-in frame; 0.04 s is past it. Mux thumbnails are requested in click mode as well, not only for hero or error states.
- Poster visibility: in click mode the poster stays until play is requested (`awaitingPlay`), then is hidden once the status leaves `ready`. With provider (native) controls on a native `<video>` the poster is hidden once the player mounts and the video preloads (`preload=auto`), otherwise it would cover the browser controls.
- First frame: media-element adapters treat `loadeddata` as the first frame (status `ready`), so a paused click video leaves `loading`. The Loading spinner shows only when status is `loading` and play is wanted, or while buffering; `canplay` clears a pending `waiting`.
- Watchdog: a mounted player that has not presented a frame 12 s after mount (with play wanted) moves to `error` ("The player did not start"). TikTok and Spotify are exempt. A late ready recovers it. The 8 s debug WARN is separate.
- Errors: media errors are retryable unless code 1 (aborted) or 4 (unsupported); retries are capped at 2 and a pending retry ignores further errors. While status is `error` the provider layer is hidden so a provider's own error UI cannot overlap ours.
- Autoplay at mount for iframe providers: on a user click that mounts the player (any iframe provider), and in autoplay/background mode for TikTok only (its player never messages the page in Safari, so its own `autoplay=1` is the only thing that starts it). Other providers rely on the in-view trigger, so they do not start while off screen.
- TikTok: the adapter sends `postMessage` commands (play, pause, seekTo, mute, unMute) straight to the iframe and declares `ready` itself after 2.5 s if TikTok never sends `onPlayerReady`. TikTok's rejection of script-started play (error 3001 while a play is pending, 3002) becomes `blocked`. Autoplay is best-effort in the capability table. State (time, playing) may not reflect the video when TikTok's messages do not reach the page.
- Wistia and Cloudflare: `startTime` is applied by seeking before the adapter reports ready (their own start-time options start playback at 0 or leave the video paused). Wistia gets `videoFoam: false`, `fitStrategy: "cover"` and CSS in the media layer that forces its injected wrappers to fill the stage.
- Vimeo: a removed video never raises an error in the embed; the adapter asks oEmbed and reports `NotFoundError` only if the player has not become ready 4 s after an oEmbed 404 (some playable embed-only videos 404 on oEmbed).
- Concurrency limiter: each slot carries its own `max` (nested `VideoConfigProvider` overrides no longer fight the default). The shared IntersectionObserver replays the last entry to a second subscriber.
- Mux teardown no longer calls `load()` (it re-initialized playback during removal); native video removes `<source>` children before `load()`.
- The debug logger (`library/videos/debug.ts`): `window.__UV_DEBUG = true` or the `debug` / `debugLabel` props; 200 entries per label; `subscribeVideoDebug`, `getVideoDebugEntries`, WARNs for import failure, mount throw, never-ready, blocked and error.
- `PartsContext` carries labels and placement; `Controls` merges labels with the parent.

### 21.2 Showcase (replaces section 20's Playground and Regressions)

One page, one video stage, a sticky right rail (no scrollbars; accordions), source switcher (MP4, HLS, Mux, YouTube, Vimeo, Wistia, Cloudflare, Twitch, TikTok, Spotify) and 11 provider-neutral scenarios (background loop, autoplay with controls, click with uploaded poster, click without poster, in-view trigger, in-view once, start/end window, provider controls, no controls with external buttons, hero/LCP, error state), each with live PASS/FAIL expectations, quick actions (including scroll buttons for the in-view scenarios), a debug log with Copy buttons and a sticky "Copy everything" report. State: `?source=...&scenario=...` search params (the hash broke the site preloader's anchor scroll). Extras (poster comparison, carousel, Safari hidden video, concurrency, triggers, compat wrappers, custom controls) exist in `Extras.tsx` but are switched off (`SHOW_EXTRAS` in `Showcase.tsx`). The page skips the site preloader (`/visual-tests` check in `app/components/Preloader/index.tsx`) and force-unlocks scrolling. Fixtures: `scripts/seed-video-tests.ts` (31 `videoTestCase` documents; re-run it after changing fixtures; it writes to the live dataset).

### 21.3 Open items

- Twitch: the default sandbox source is an unverified recording (twitch.tv/videos/106400740); an offline channel never plays and the UI shows "loading" (no "offline" state). A real, public recording URL is needed.
- Not re-verified after the latest edits: Wistia and Cloudflare start-time seek (scenario 7), TikTok commands (scenario 9), Mux decode error (code 3 then 0, root cause never reproduced; teardown and retry races were fixed).
- `LazyVideo` compat wrapper renders only after the site preloader completes and ignores a `src` prop.
- Unused `lookupEndpoint` config option; a few typed casts and duplicated helpers (reviewer items 16, 20, 21).
- Showcase Extras are disabled, not deleted.
- The `SPEC.md` text above still mentions the old Playground and Regressions pages and the YouTube "below" layout; section 21 is authoritative.
