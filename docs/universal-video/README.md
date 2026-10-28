# UniversalVideo: start here

Status (2026-10-27, end of day): built and tested in the showcase (`/visual-tests/universal-video`, 10 sources x 11 scenarios). Nothing is committed. Read section 21 of `SPEC.md` ("As built") first: it lists where the implementation differs from the spec text below and what is still open. Sections 1 to 20 describe the original design and are outdated where section 21 says so.

- `SPEC.md` is the authoritative spec (20 sections). Section 19 is the decisions log, section 17 is the parallel work split (piece 0, then A to I, one owner per file), section 18 is the NOT VERIFIED list, section 20 is the showcase page.
- `research/` holds the evidence reports the spec cites by key (INV, PROV, REL, FEAT, ELEM, POST, MUX3, META, BASIC, and so on).
- Branches: `universal-video` in the starter and in `library/` (both unpushed, nothing committed). Commit and push only on "yolo".

## Starting the build

1. Read `SPEC.md` sections 0, 2, 5.5 (frozen interfaces), 17, 19.
2. Read `AGENTS.md`, `library/CLAUDE.md`, `library/styled/README.md`, and the relevant Next 16 docs in `node_modules/next/dist/docs/`.
3. Run piece 0 (freeze types, capability table, parse) first and alone; then pieces A to I in parallel with disjoint files.
4. Orchestrator pattern: main session delegates to Sonnet subagents (max 3 at once), spot-checks their reports, never trusts them blindly.
5. Verify: `pnpm exec tsc --noEmit` per piece; `WIREIT_LOGGER=metrics pnpm lint` once at the end (30 oxlint warnings is the baseline); one independent `reviewer` pass on the diff.
6. The showcase seed script writes to the live Sanity dataset: the user runs it. Page: `/visual-tests/universal-video`.

## Facts worth remembering

- Realistic Mux test asset with the faded poster: playback ID `DS00Spx1CV902MCtPj5WknGlR102V5HFkDe` (1280x720, untagged). Dataset Mux assets: `00dcym00XaHxqy7BJMgsjIe01trdJH8VIzWfBJqoffRd02o` (untagged, fades), `D3F3013ZPTNNKNY1e02ctl02z02IAw7lRyARzgryAFyPXXU` (tagged).
- Media-element packages only resolve from files inside `library/`, not from starter `app/` code.
- `next dev` rewrites the nextjs block in `AGENTS.md`; leave it out of commits.
