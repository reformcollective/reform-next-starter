# Universal video component: provider research (as of 2026-10-27)

Legend: CONFIRMED = read in a primary source this session (URL in Sources). UNSURE = from general knowledge or inference, not verified here.

## 0. Headline findings

1. Video.js 10 (`@videojs/react` 10.2.0, released 2026-10-22) is now the shared successor of Vidstack, Plyr, and Media Chrome. Vidstack README: "security-only maintenance" with security patches to 1.x until January 2028 (CONFIRMED). Do NOT build on Vidstack or Plyr for a new project.
2. Mux's `media-elements` family (`youtube-video-element`, `vimeo-video-element`, `hls-video-element`, `custom-media-element`) already wraps each provider behind the HTMLMediaElement API. `react-player` v3.4.0 is built on exactly these elements (CONFIRMED via its npm dependencies).
3. YouTube is the hard one: `modestbranding` is deprecated and has no effect, overlays on the player are forbidden by the Required Minimum Functionality policy, and loop needs `playlist`. Custom controls that sit OUTSIDE the iframe (not over it) and drive it through the IFrame API are the workable pattern.
4. Vimeo `background=1` and `controls=0` need a paid Vimeo plan; `setPlaybackRate` needs PRO/Business; `setQuality` needs Plus/PRO/Business.
5. Mux placeholder: Mux Player renders `placeholder` as a CSS background-image on the poster `<img>` (blurup). The placeholder is a heavily Gaussian-blurred (default blur 20), tiny, upscaled image, so it inherently looks soft and low contrast. No opacity rule was found in Mux Player or media-chrome source I read. See section 1.4.
6. Recommendation (section 2.7): hand-roll a thin controller interface, but implement the non-native providers by reusing `youtube-video-element`, `vimeo-video-element`, `hls-video-element` / `mux-video` instead of writing raw SDK glue. Or adopt Video.js 10 if you want the whole thing off the shelf.

---

## 1. Provider capability matrix

Notation: Y = supported and reliable, B = best effort / caveats, N = not possible, ? = UNSURE. "Native" column means the standard HTMLMediaElement API.

| Capability | Direct file (mp4/webm) | HLS Safari (native) | HLS hls.js (Chrome/Firefox/etc) | Mux (`mux-video` / Mux Player) | YouTube IFrame API | Vimeo `@vimeo/player` |
|---|---|---|---|---|---|---|
| play / pause | Y (play() returns a promise, can reject NotAllowedError) | Y | Y | Y | Y (`playVideo`/`pauseVideo`; `onAutoplayBlocked` event exists) | Y (iOS may refuse play() until tap) |
| mute / unmute | Y (`muted`) | Y | Y | Y | Y (`mute`, `unMute`, `isMuted`) | Y (`setMuted`) |
| volume | Y (0..1) | Y desktop; iOS ignores (system volume) | Y desktop; iOS n/a | Y (same as underlying) | Y (`setVolume` 0..100) | Y 0..1, but mobile has no independent volume: `getVolume()` returns 1, `setVolume()` silently no-op (CONFIRMED) |
| seek | Y (`currentTime`) | Y | Y | Y | Y (`seekTo(sec, allowSeekAhead)`; pass false while dragging a scrubber, true on release) | Y (`setCurrentTime`, resolves with time reached) |
| duration / currentTime / progress | Y (`duration`, `currentTime`, `buffered`) | Y | Y | Y | B: no timeupdate event. Must poll `getCurrentTime()`; buffered via `getVideoLoadedFraction()` | Y (`timeupdate` event with seconds, percent, duration) |
| playbackRate | Y | Y | Y | Y | B: `setPlaybackRate` is a suggestion, rounded to supported rates; list via `getAvailablePlaybackRates()` | B: PRO/Business accounts only, range 0..2 |
| fullscreen | Y (Fullscreen API on element or wrapper; iOS Safari video only via `webkitEnterFullscreen` on the video element, ?) | Y | Y | Y | B: fullscreen the iframe/wrapper via Fullscreen API needs iframe `allow="fullscreen"`; `fs=0` hides YouTube's own button | Y `requestFullscreen()`, `fullscreenchange` event |
| captions / text tracks | Y (`<track>` + `textTracks`, WebVTT) | Y (native, incl. HLS subtitle renditions) | Y (`hls.subtitleTracks` / media-tracks) | Y (`textTracks`, Mux auto-generated captions as tracks) | B: only the `captions` module (`fontSize`, `reload` via `onApiChange`) plus `cc_load_policy=1`. No supported cue/track enumeration or on/off toggle API; `setOption('captions','track',...)` is undocumented in the page I read (UNSURE, widely used but unofficial) | Y: `getTextTracks`, `enableTextTrack(lang, kind, showing)`, `disableTextTrack`, `cuechange` |
| quality selection | N (single file; swap sources) | N (OS controls ABR) | Y (`hls.currentLevel`, `autoLevelEnabled`) | Y (`max-resolution`, `min-resolution`, renditions via media-tracks) | B/N: `setPlaybackQuality` is a hint and is not honored reliably; `getAvailableQualityLevels` / `onPlaybackQualityChange` exist (UNSURE re: current behavior; the doc page I read does not describe the setter) | B: `getQualities`/`setQuality`, Plus/PRO/Business only |
| loop | Y (`loop`) | Y | Y | Y | B: `loop=1` AND `playlist=<same id>`; or `setLoop` only for playlists | Y (`setLoop`; note `ended` does NOT fire while looping) |
| events: play | Y | Y | Y | Y | via `onStateChange` 1 | Y |
| pause | Y | Y | Y | Y | via state 2 | Y |
| ended | Y | Y | Y | Y | via state 0 | Y (not when loop) |
| timeupdate | Y | Y | Y | Y | N: poll (e.g. 250ms rAF/interval while state=1) | Y |
| progress (buffer) | Y | Y | Y | Y | N: poll `getVideoLoadedFraction()` | `progress` event (UNSURE; `loaded` event exists) |
| error | Y | Y | Y (hls.js ERROR event, many are recoverable) | Y | `onError` codes 2, 5, 100, 101, 150, 153 | Y (`error`) |
| waiting / buffering | Y (`waiting`, `stalled`) | Y | Y | Y | via state 3 (buffering) | `bufferstart` / `bufferend` |
| canplay | Y | Y | Y | Y | N exact equivalent; `onReady` (API ready) then state -1/5/1 | `loaded` / `play` (no exact canplay) |
| Muted autoplay / background | Y with `muted autoplay playsinline loop`; MDN: muted autoplay generally allowed, `playsinline` required for Safari | Y | Y | Y; Mux Player `autoplay="muted"` mutes then calls play() | B: `autoplay=1&mute=1&playsinline=1` works; but TOS limits (below) and mobile can block; cannot be truly chromeless | Y with `background=1` (paid plans) or `autoplay=1&muted=1&loop=1&controls=0` (controls=0 paid) |
| Chromeless (no provider UI) | Y | Y | Y | Y | N: `controls=0` hides the bar but title bar/logo/pause-overlay "more videos" can still appear; branding rules apply | B: needs paid plan for `controls=0` / `background=1` |

### 1.1 Direct file and HLS

- Direct file: fully standard HTMLMediaElement. MDN autoplay guide (CONFIRMED): muted autoplay is generally allowed; `playsinline` "required for autoplay in Safari"; use `navigator.getAutoplayPolicy("mediaelement")` and catch `NotAllowedError` from `play()`. iOS Low Power Mode can block even muted autoplay (UNSURE, not in MDN page; widely reported).
- HLS native Safari: set `video.src = url.m3u8` (UNSURE re-verify; standard). Chrome/Firefox/Edge desktop need hls.js (MSE). Chrome Android and newer desktop Chrome have added some native HLS (UNSURE, version dependent), so feature-detect with `video.canPlayType('application/vnd.apple.mpegurl')` first and fall back to `Hls.isSupported()`.
- Quality and ABR: only hls.js exposes levels. Native Safari offers none.
- hls.js specifics the adapter must hide: `Hls.Events.ERROR` with `fatal` flag (call `startLoad()` / `recoverMediaError()`), `destroy()` on unmount, attaching after `src` change, text track mode handling.
- `hls-video-element` v1.5.12 (MIT) wraps hls.js ^1.6.5, `media-tracks` and `custom-media-element` (npm registry, CONFIRMED).

### 1.2 YouTube (IFrame Player API)

What works (CONFIRMED from IFrame API reference): `playVideo/pauseVideo` (UNSURE names not on the fetched excerpt but standard), `mute/unMute/isMuted`, `setVolume(0..100)`, `seekTo`, `setPlaybackRate` (hint, rounded), `getAvailablePlaybackRates`, events `onReady`, `onStateChange` (-1, 0, 1, 2, 3, 5), `onPlaybackRateChange`, `onPlaybackQualityChange`, `onError`, `onApiChange`, `onAutoplayBlocked`. `enablejsapi=1` and `origin` recommended.

What is impossible or unreliable:
- `modestbranding`: "deprecated and has no effect" since 2023-08-15 (CONFIRMED, player parameters page). The player decides branding by player size and other params.
- `rel`: since 2018 it can only restrict related videos to the same channel; cannot disable them (CONFIRMED: "changing on or after September 25, 2018", related videos come from the same channel). End-screen/pause-screen suggestions cannot be fully hidden.
- `showinfo` removed/deprecated since 2018 (title bar). `autohide`, `theme` deprecated.
- `controls=0` only hides the control bar (CONFIRMED). Click-to-play on the iframe still works; title/logo overlays can still appear (UNSURE per-state).
- `loop=1` has "limited support in IFrame embeds"; needs `playlist=<same video id>` (CONFIRMED).
- `playsinline`: `0` = fullscreen on iOS and is the current default; must set `1` (CONFIRMED).
- No `mute` URL parameter is documented on the parameters page (CONFIRMED absence). Use `mute=1` anyway (widely used, UNSURE if officially supported) or call `player.mute()` in `onReady`; the sample in the API reference uses events. Safer: call `mute()` in `onReady` before `playVideo()`.
- Autoplay: `autoplay=1` supported; browsers may block unmuted autoplay; cross-origin iframes need Permissions Policy `allow="autoplay"` (CONFIRMED); `onAutoplayBlocked` event.
- Required Minimum Functionality policy (CONFIRMED): do not place overlays, frames, or other visual elements over any part of the embedded player, including its controls; do not make changes to the player not described in the API docs; visible area at least 200x200 px; autoplay only once >50% visible and never more than one autoplaying YouTube player per page/screen. Conclusion: custom controls must sit beside or below the player, not on top of it. Hiding the iframe (audio-only, 0x0, offscreen) is a policy violation (UNSURE exact clause; the "min size 200x200" is confirmed and implies it).
- Cookies and privacy: `youtube-nocookie.com` is the privacy-enhanced embed host; it avoids setting cookies until playback starts (UNSURE, YouTube Help states this; not fetched). It still loads Google scripts; consent policies may still apply.
- Ads: ads can play on monetized videos in an embed; the API reports ad states poorly (`onStateChange` can show buffering/paused around ads). Cannot be blocked or controlled (UNSURE, general knowledge).
- API readiness: `https://www.youtube.com/iframe_api` global `onYouTubeIframeAPIReady`; methods fail before `onReady`. React StrictMode double-mount destroys/recreates the player; must `destroy()` in cleanup. `youtube-video-element` handles this load.
- `timeupdate` does not exist: poll. Captions API is minimal (above). Quality setter unreliable. Fullscreen button: `fs=0` hides it; your own fullscreen must target the container and the iframe needs `allow="fullscreen"`.
- Mobile: autoplay with sound is blocked; inline requires `playsinline=1`; iOS requires user gesture to unmute (UNSURE).

### 1.3 Vimeo (`@vimeo/player`, npm latest 2.30.4, MIT)

CONFIRMED (player.js README / Vimeo help):
- Methods: `play`, `pause`, `setVolume` (0..1), `setMuted`, `setCurrentTime`, `setPlaybackRate` (0..2, PRO and Business only), `requestFullscreen`, `enableTextTrack(language, kind?, showing?)`, `getQualities`/`setQuality` (Plus/PRO/Business), `setLoop`.
- Events modeled after HTML5: `play`, `pause`, `ended`, `timeupdate`, `seeking`, `seeked`, `volumechange`, `playbackratechange`, `texttrackchange`, `cuechange`, `qualitychange`, `fullscreenchange`, `error`.
- `play()` may not work on iOS until the viewer taps. Mobile volume = system volume.
- Unlisted videos: the full URL including the `h` hash parameter must be supplied.
- Embed parameters (Vimeo help): `background` (disables controls, loops, autoplays, mutes; paid plans only), `controls` (false hides UI; paid plans only; keyboard still works), `autoplay`, `muted`, `loop`, `dnt` (no session data/analytics; "some essential cookies stay active"), `playsinline` (default true), `texttrack` (default captions language; ignored if not uploaded).
- Privacy: domain-level privacy (restrict embeds to allowed domains) is a Vimeo account feature (UNSURE exact plan tier; not fetched). Private/unlisted videos need `h`. Domain restrictions with `background=1` work only on allowed domains.
- Quirks: `ended` does not fire with `loop`; promise-based API (every getter/setter returns a promise); `ready()` must resolve before calls; the `Player` constructor needs a DOM element or iframe (client only).
- `vimeo-video-element` v1.7.4 (MIT) wraps `@vimeo/player` 2.29.0 behind the HTMLVideoElement API (npm registry, CONFIRMED).

### 1.4 Mux

- Options: `@mux/mux-player-react` 3.14.1 (MIT, peer React ^19 supported; deps `@mux/mux-player`, `@mux/playback-core`) is a full-UI player (CONFIRMED npm). `@mux/mux-video` 0.31.6 (2026-10-23 release) is "a Mux-flavored HTML5 video element" using tuned hls.js settings, Mux Data, and `playback-id`; it has `prefer-playback`, `max-resolution`, `min-resolution`, `disable-tracking`, `disable-cookies` etc. A React wrapper `@mux/mux-video-react` 0.31.6 exists (released alongside, CONFIRMED via GitHub releases list). The mux-video README says "no official React wrapper yet", which conflicts with the existence of `@mux/mux-video-react` releases; treat the README as stale (UNSURE).
- Plain hls.js on `<video>` against `https://stream.mux.com/{id}.m3u8` also works but you lose Mux Data and the tuned config (README).
- Playback policies: `public` (no token) or `signed` (JWT, RS256, claims `sub`=playback id, `aud` v/t/g/s/d, `exp`, `kid`). Adding a token to a public id fails. Playback restrictions (referrer allow-list, user-agent checks) apply via `playback_restriction_id` claim in the JWT. Note: referrer validation means `allow_no_referrer` matters for native apps (CONFIRMED).
- Images: `https://image.mux.com/{ID}/thumbnail.{png|jpg|webp}` with `time`, `width`, `height`, `fit_mode` (preserve, stretch, crop, smartcrop, pad; non-preserve needs width and height), `rotate` (90/180/270), `flip_v`, `flip_h`, `latest` (live only). Animated: `animated.{gif|webp}` with `start`, `end` (clip 250ms to 10s), `width` (default 320, max 640), `height` (max 640), `fps` (default 15, max 30). Signed policies: image params go INSIDE the JWT claims (aud `t` or `g`), URL carries only `token` (CONFIRMED).
- Poster: Mux Player default poster = mid-point thumbnail; `thumbnail-time` sets frame (does not work with signed URLs; use `time` in the token) (CONFIRMED).
- Placeholder / "washed out" look (partly UNSURE):
  - CONFIRMED: `placeholder` is meant to be a Data URL; `@mux/blurup` makes it by fetching a tiny poster, upscaling, and applying Gaussian blur (default `blur: 20`, `quality: 1`, webp). So the placeholder is by design a very blurry, low-detail, low-contrast gradient; dark or high-contrast frames will look milky once smoothed.
  - CONFIRMED (media-chrome `media-poster-image` source): `placeholdersrc` is applied as an inline `background-image` on the inner `<img>`; no opacity or filter rule was found there, and the Mux Player `styles.css` poster/placeholder rules (`media-poster-image { width:100%; height:100% }`, hidden when no src/placeholdersrc) contain no opacity, blur or filter. So the fade is not from a CSS opacity on the poster.
  - Likely causes of a faded look (UNSURE, verify visually): (a) the blurup itself (reduce `blur`, raise `quality`, or use a small real thumbnail, e.g. `image.mux.com/{id}/thumbnail.webp?width=32&time=...` as the placeholder, which Mux docs suggest for client-only apps); (b) the poster frame time chosen is a faded transition frame (use `thumbnail-time`); (c) `--controls-backdrop-color` gradient or media-chrome control-bar backdrop drawn over the poster (CONFIRMED the variable exists and "keep contrast high enough"); (d) the poster `<img>` uses `object-fit: var(--media-object-fit, contain)` so letterboxing shows the blurred placeholder around the image; (e) your own site CSS.
  - Mux docs say CSS cannot style the iframe embed; for web components use `::part(poster-layer)`, `::part(poster)`, `::part(media-layer)`.
- Autoplay in Mux Player (CONFIRMED): `autoplay="muted"` mutes then calls `.play()`; `autoplay="any"` tries current options then retries muted.

---

## 2. Existing abstractions

### 2.1 Mux "media elements" family (github.com/muxinc/media-elements)

- Packages: `custom-media-element` (base class), `youtube-video-element` 1.9.1, `vimeo-video-element` 1.7.4, `hls-video-element` 1.5.12, plus wistia, spotify, cloudflare, twitch, tiktok, dash, jwplayer, shaka, videojs elements (CONFIRMED package names via docs sidebar and npm deps; ones other than the first four are UNSURE in detail). All MIT (npm registry CONFIRMED for the four fetched; repo landing page itself states no license).
- Contract: each element "matches the `<video>` API": `play()`, `pause()`, `currentTime`, `muted`, `volume`, `playbackRate`, `loop`, `src`, standard events. YouTube example: `<youtube-video controls src="https://www.youtube.com/watch?v=...">`.
- Distribution: ESNext, not pre-transpiled (CONFIRMED); your bundler (Next with `transpilePackages` if needed, UNSURE) must handle private class fields. Media Chrome is pre-transpiled to es2019.
- React: `youtube-video-element` ships `dist/react.d.ts` (CONFIRMED in npm metadata), so React-friendly typings exist; other elements: UNSURE. React 19 supports custom elements natively (props as properties), which fixes the old React 18 custom-element pain; `ce-la-react` is what media-chrome uses.
- SSR: custom elements must be imported client-side only (they touch `HTMLElement` at import). In Next 16 use a `"use client"` component and dynamic `import()` in `useEffect` or `next/dynamic` with `ssr: false` (UNSURE; standard pattern). Not documented in the fetched pages.
- Limitations inherited from the providers: YouTube has no true text-track API, no timeupdate (the element polls internally), Vimeo plan gates.

### 2.2 Media Chrome (`media-chrome` 4.19.4, released 2026-10-23, MIT)

- Not a player: a set of web-component controls (`media-controller`, `media-play-button`, `media-mute-button`, `media-volume-range`, `media-time-range`, `media-fullscreen-button`, `media-captions-button`, `media-playback-rate-button` etc.) that bind to ANY element in `slot="media"` implementing the HTMLMediaElement API (CONFIRMED docs). This is exactly the "BYO UI, headless-ish" layer: style with CSS variables/parts.
- React: `import { MediaController, MediaPlayButton } from "media-chrome/react"`, PascalCase, camelCase attrs; Next.js demo in repo (CONFIRMED). Depends on `ce-la-react` ^0.3.2; no peer deps (CONFIRMED).
- Works with: native video, HLS Video, Mux Video, YouTube Video, Vimeo Video, Video.js, Shaka, DASH, Cloudflare, Wistia, etc. (CONFIRMED doc pages exist).
- Status: actively released; team now "focuses on Video.js 10" (Vidstack README, CONFIRMED). Expect Media Chrome to continue but converge into Video.js 10 tooling (UNSURE how long Media Chrome stays a standalone product).
- Bundle size: not stated in docs. UNSURE; component set is small and tree-shakeable per import, the per-element library is the larger cost.
- Caption/ARIA: ships ARIA labels and keyboard handling per control (UNSURE depth; verify in docs).

### 2.3 Video.js 10 (`@videojs/react` 10.2.0, released 2026-10-22)

- React-first, "composable primitives, hooks, and TypeScript types", packaged skins plus an editable Shadcn skin source for custom UI. Example is a Next.js `app/page.tsx` (CONFIRMED).
- Sources: HLS, DASH, Mux, YouTube, Vimeo, Cloudflare, TikTok, Twitch; audio Spotify (CONFIRMED). Releases include `@videojs/youtube-video`, `@videojs/vimeo-video`, `@videojs/wistia-video`, `@videojs/twitch-video` 10.2.0 (CONFIRMED).
- Unified team: Vidstack, Plyr, Media Chrome and Video.js teams now work on Video.js 10 (CONFIRMED Vidstack README).
- Unknowns (UNSURE): license (Video.js is historically Apache-2.0; v10 license not verified), bundle size (docs claim "minimal", give no figures), SSR details, 10.x API stability (10.2.0 suggests recent GA; API may still move).
- Fit: the closest to "one uniform API plus headless controls in React". Biggest risk is newness and a dependency footprint larger than what we need.

### 2.4 Vidstack (github.com/vidstack/player)

- MIT. "Security-only maintenance", security patches on 1.x until January 2028; migrate to Video.js 10 (CONFIRMED). Releases list on GitHub API returned empty in my fetch, so last release date is UNSURE. Skip for new work.

### 2.5 Plyr (sampotts/plyr v3.8.5, 2026-10-06, MIT per repo, UNSURE license)

- Supports file/HLS (with hls.js you wire yourself, UNSURE), YouTube and Vimeo via embedded provider players, with its own fixed UI (skinnable via CSS variables). Not headless; its React story is third-party wrappers (UNSURE). Plyr team is also moving to Video.js 10 (CONFIRMED). Plyr's uniform API for YouTube/Vimeo is its own, not HTMLMediaElement; no native Mux. Not recommended.

### 2.6 react-player (cookpete/react-player v3.4.0, 2025-11-13, MIT)

- v3 uses the media elements above: native video, hls.js (via `hls-video-element`), dash.js, `mux-player` for Mux, official APIs for YouTube/Vimeo/Wistia (CONFIRMED README + npm deps). Some v2 providers "not updated for v3".
- Chromeless by default (`controls={false}`); README recommends Media Chrome for custom UI with `MediaController` (CONFIRMED). That gives ONE uniform React component plus a ref to a media-element-like API.
- React peer: ^17 || ^18 || ^19 (CONFIRMED). SSR/Next 16: README silent (UNSURE); code-splits per provider with `import()`.
- Downsides: Mux goes through the full `mux-player` UI element (heavier than `mux-video`); a large dependency list (installs every provider element, tree-shaking uncertain, UNSURE); last release 2025-11-13 is ~11 months old as of today (moderate staleness, but it just tracks element packages).

### 2.7 Recommendation

Option A (recommended): hand-roll a small `<UniversalVideo>` that renders one of a few provider elements and exposes a single `MediaController`-like ref/hook, but import the heavy lifting from `media-elements`:
- file: native `<video>`
- HLS and Mux: `hls-video-element` or `mux-video` (Mux gets Mux Data, tuned hls.js; `mux-video` also falls back to native HLS on Safari)
- YouTube: `youtube-video-element`
- Vimeo: `vimeo-video-element`
Because they all implement HTMLMediaElement, your custom controls code is written once against the standard API; provider choice is just which tag you mount. Optionally use Media Chrome for the control UI, or write your own controls (our repo prefers styled components and tokens, so a hand-written control bar bound to the standard API may fit house style better than Media Chrome's shadow-DOM styling; UNSURE).
Tradeoffs: you own the adapter glue, the lazy loading, and the YouTube policy constraints; but dependencies are small, MIT, maintained (releases 2026-10-23 for Mux packages), and avoid vendor lock to a full player UI.

Option B: Video.js 10 `@videojs/react`. Least code, one API across all five, headless primitives and skins. Choose if you value upstream a11y/keyboard work and accept a young major version and unknown license/bundle numbers. Verify license, bundle size and SSR before committing.

Option C: react-player v3 + Media Chrome. Fastest uniform React component; heavier install, Mux through full Mux Player, last release Nov 2025.

Avoid: Vidstack (maintenance), Plyr (superseded, fixed UI), classic video.js 8 with plugins (superseded by 10; UNSURE).

---

## 3. Proposed uniform controller interface

Smallest interface every provider can honor, modeled on HTMLMediaElement (TypeScript sketch):

```ts
type Capability = 'supported' | 'bestEffort' | 'unsupported';

interface MediaController {
  // commands
  play(): Promise<void>;            // rejects/resolves 'blocked' on autoplay policy
  pause(): void;
  setMuted(muted: boolean): void;
  setVolume(v: number): void;       // 0..1, adapter scales (YouTube 0..100)
  seek(seconds: number): void;
  setPlaybackRate(rate: number): void;
  requestFullscreen(): Promise<void>; // fullscreens OUR wrapper
  setTextTrack(id: string | null): void;
  // state (readonly, reactive)
  paused: boolean; ended: boolean; muted: boolean; volume: number;
  currentTime: number; duration: number; bufferedEnd: number;
  playbackRate: number; waiting: boolean; ready: boolean;
  error: { code: string; message: string; fatal: boolean } | null;
  textTracks: { id: string; label: string; language: string }[];
  activeTextTrack: string | null;
  capabilities: {
    volume: Capability; playbackRate: Capability; textTracks: Capability;
    quality: Capability; fullscreen: Capability; seek: Capability;
  };
  // events (normalized)
  on(e: 'play'|'pause'|'ended'|'timeupdate'|'progress'|'volumechange'|'ratechange'|'waiting'|'canplay'|'error'|'blocked', cb): () => void;
}
```

Per-provider marks:
- volume: file/HLS/Mux/YouTube/Vimeo-desktop supported; mobile (iOS, Vimeo mobile) unsupported: report `capabilities.volume='unsupported'` and hide the slider; keep mute.
- playbackRate: YouTube best effort (rounded); Vimeo best effort (PRO/Business only, otherwise hide); others supported.
- textTracks: file/HLS/Mux/Vimeo supported; YouTube unsupported (only `cc_load_policy` default on, or open YouTube's own CC button which is only visible if `controls=1`); document the limitation.
- quality: omit from the minimal interface; optional extension for hls.js/Mux/Vimeo(paid); YouTube unsupported.
- seek/progress on YouTube: best effort, polled at ~250ms.
- canplay: YouTube and Vimeo synthesize from first playable signal (`onReady` / `loaded`).
- fullscreen: always fullscreen your own wrapper element, which keeps custom controls visible; except iOS iPhone Safari native video, where only the video element can go fullscreen and custom controls disappear (UNSURE, iOS 26 behavior unverified); fall back to `webkitEnterFullscreen`.
- loop: pass as a prop at mount, not a runtime method; adapter maps YouTube `loop=1&playlist=id` and Vimeo `loop` (and fires synthesized ended if you need it).
- background mode (muted, loop, autoplay, no controls): supported for file/HLS/Mux; Vimeo needs paid plan; YouTube best effort and policy constrained (do not use YouTube for decorative background; document it).

Quirks the adapter must hide:
1. Async readiness (YouTube `onReady`, Vimeo `ready()`): queue commands until ready.
2. Scale and promise differences (YouTube volume 0..100, Vimeo promises).
3. No `timeupdate`/`progress` on YouTube: polling loop that runs only while playing and tab visible.
4. `ended` not firing on Vimeo loop; YouTube loop needs `playlist`.
5. Autoplay rejection and `onAutoplayBlocked`: normalize to a `blocked` event so UI shows a play button.
6. StrictMode double mount and unmount: destroy players/hls instances in cleanup; avoid duplicate iframes.
7. hls.js: native vs MSE detection, fatal error recovery, destroy.
8. Mux signed tokens and thumbnail tokens: build tokens server-side, never pass modifiers in URL for signed ids.
9. YouTube policy: render controls outside the iframe, never overlay; min 200x200; one autoplaying player per screen; autoplay only when >50% visible.
10. Privacy: YouTube via `youtube-nocookie.com`, Vimeo `dnt=1`, Mux `disable-cookies`; lazy-mount behind a facade/consent where required (UNSURE legal requirement).
11. SSR: only render the provider on the client; render poster and a sized (aspect-ratio) box on the server to prevent layout shift.

---

## 4. Accessibility basics

- WCAG 2.2 SC 2.2.2 Pause, Stop, Hide, Level A (CONFIRMED): auto-starting moving content lasting more than 5 seconds, shown alongside other content, needs a mechanism to pause, stop or hide it. A muted autoplaying background video must therefore ship a visible, keyboard-focusable pause/play control (single control that stops all moving content is best practice). Essential animations are exempt, but decorative background video is not.
- `prefers-reduced-motion: reduce`: do not autoplay background video; show the poster and a play button (this is best practice and aligns with 2.2.2 and 2.3.3 AAA, UNSURE on 2.3.3 wording since I did not fetch it). Implement with `matchMedia('(prefers-reduced-motion: reduce)')` and listen for `change`. Also pause when off-screen (IntersectionObserver) and when the tab is hidden for battery/performance.
- Custom controls: use real `<button>` elements, visible focus (WCAG 2.4.7, 2.4.11 in 2.2), `aria-label` that reflects state, or `aria-pressed` for toggles (mute, captions) but do not combine changing label and `aria-pressed` for the same button; scrubber as `<input type="range">` or `role="slider"` with `aria-valuemin/max/now` and `aria-valuetext` ("1 minute 5 seconds of 3 minutes"); arrow keys for +/- seek, Space/Enter on buttons, `m` mute and `f` fullscreen optional (do not hijack keys when focus is outside the player). Minimum target size 24x24 CSS px (WCAG 2.2 SC 2.5.8, UNSURE not fetched).
- Captions: expose captions toggle only where a text-track API exists; WCAG 1.2.2 requires captions for prerecorded synchronized media (UNSURE not fetched). Style `::cue` for contrast; YouTube captions only via YouTube's UI or `cc_load_policy=1`.
- YouTube `disablekb=1` removes provider keyboard controls (CONFIRMED); if you do your own controls beside the iframe, leave the keyboard on unless you provide equivalent shortcuts.
- Mux Player: `--controls-backdrop-color` docs warn to keep contrast high (CONFIRMED).
- Live region for errors/loading state (`role="status"`), do not autoplay with sound, never trap focus inside the iframe (provide a skip/escape path).

---

## Sources (fetched 2026-10-27)

- YouTube IFrame Player API reference: https://developers.google.com/youtube/iframe_api_reference
- YouTube player parameters (modestbranding deprecated, rel, loop/playlist, playsinline): https://developers.google.com/youtube/player_parameters
- YouTube Required Minimum Functionality: https://developers.google.com/youtube/terms/required-minimum-functionality
- Vimeo player.js README: https://github.com/vimeo/player.js ; npm `@vimeo/player` 2.30.4: https://registry.npmjs.org/@vimeo/player/latest
- Vimeo player parameters help: https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-parameters
- Mux customize look and feel (poster, placeholder, CSS): https://www.mux.com/docs/guides/player-customize-look-and-feel
- Mux images (thumbnail/animated params): https://www.mux.com/docs/guides/get-images-from-a-video
- Mux secure playback (signed URLs, restrictions): https://www.mux.com/docs/guides/secure-video-playback
- Mux Player core functionality (autoplay): https://www.mux.com/docs/guides/player-core-functionality
- Mux Player React: https://www.mux.com/docs/guides/mux-player-web ; npm https://registry.npmjs.org/@mux/mux-player-react/latest
- mux-video README: https://github.com/muxinc/elements/blob/main/packages/mux-video/README.md ; releases https://api.github.com/repos/muxinc/elements/releases
- Mux Player styles.css / template.ts: https://github.com/muxinc/elements/blob/main/packages/mux-player/src/styles.css , .../template.ts
- media-chrome poster image source: https://raw.githubusercontent.com/muxinc/media-chrome/main/src/js/media-poster-image.ts
- @mux/blurup README: https://raw.githubusercontent.com/muxinc/blurup/main/README.md
- media-elements repo: https://github.com/muxinc/media-elements ; youtube-video-element README: https://github.com/muxinc/media-elements/tree/main/packages/youtube-video-element
- npm: https://registry.npmjs.org/youtube-video-element/latest , .../vimeo-video-element/latest , .../hls-video-element/latest , .../media-chrome/latest , .../react-player/latest
- Media Chrome React docs: https://www.media-chrome.org/docs/en/react/get-started ; YouTube element page: https://www.media-chrome.org/docs/en/media-elements/youtube-video ; releases https://api.github.com/repos/muxinc/media-chrome/releases
- Video.js 10 docs: https://videojs.org/docs ; releases https://api.github.com/repos/videojs/video.js/releases
- Vidstack: https://github.com/vidstack/player
- react-player: https://github.com/cookpete/react-player ; releases https://api.github.com/repos/cookpete/react-player/releases
- Plyr releases: https://api.github.com/repos/sampotts/plyr/releases
- MDN autoplay guide: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- WCAG 2.2 SC 2.2.2: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html

Not fetched (UNSURE items rely on general knowledge): youtube-nocookie specifics, YouTube ad behavior, Vimeo domain-privacy plan tier, iOS fullscreen and Low Power Mode behavior, Video.js 10 license/bundle size, Next 16 SSR specifics for the media elements, WCAG 2.5.8 / 2.3.3 / 1.2.2 wording.
