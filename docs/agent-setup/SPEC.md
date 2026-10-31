# Agent setup for REform projects

Status: draft for David's review, 2026-10-31. Nothing here is built yet.
Branches: `agent-setup` in the starter (from `main`) and in the library (from `next-main`).

## Goal

One agent setup that ships with the starter and library to every project, follows the house conventions without being reminded, checks its own work where a check can be exact, leaves taste to the developer, and uses fewer tokens per finished section than now.

App projects (business logic) use the NEXT Ensemble model instead. This spec covers marketing and animation sites.

## What is wrong now

- Two rulebooks that disagree. `library/CLAUDE.md` (last changed 2026-09-03) says run `pnpm format` and ask before lint. The starter's `AGENTS.md` (2026-10-27) says never format and always lint once. Seven projects symlink to the old one, so a library bump never brings the new rules.
- Conventions are prose. Nothing fails when an agent writes an inline style or `f.mobile`.
- Agents cannot check visual work. The browser ban leaves the developer as the only check, which is why section passes feel haphazard.
- Agents write long reasoning comments. Rules alone have not stopped it.
- Token waste: whole reads of `sanity.types.ts` (128 KB) and `schema.json` (166 KB), the whole `CHANGELOG.md` (54 KB) after each bump, retry loops, long sessions.
- Nothing is locked. The README links to a `CONVENTIONS.md` that does not exist.

## Principles

1. A check beats a rule. Anything a script can verify becomes a lint rule or a check, and the rulebook shrinks.
2. Exact targets get measured (Figma layout). Taste stays with the developer (motion feel, "does it look right").
3. Context loads only when needed: a short rulebook, skills per phase, text before images.
4. Every layer is enforced by the tool, not by goodwill: managed settings, CI, rulesets, CODEOWNERS.
5. Merging is always human. No AI attribution anywhere.

## Layers

| Layer | Holds | Who changes it |
|---|---|---|
| Claude org managed settings | short deny list, attribution off | David, in the claude.ai console |
| GitHub org rulesets + CODEOWNERS | required checks, no force push, review rules | David |
| Library `agent/` | rulebook, skills, agent role files, check scripts, lint rules | PR to the library, David reviews |
| Project `CLAUDE.md` | imports the library rulebook, plus project-only notes (20 lines max) | PR, David reviews |
| Project `.claude/settings.json` | allow rules, comment hook, status line | PR, David reviews |
| Personal `STATE.local.md` (gitignored) | one developer's handoff between sessions | that developer |

Managed settings reach everyone in the Claude org who uses Claude Code, designers included. Plain deny rules never show them anything. Hooks and status lines would show an approval dialog to everyone, so those stay in the repo.

External developers are not in the Claude org. CI, rulesets and CODEOWNERS are what hold them to the conventions.

## The workflow

The page is the unit of work. Each developer drives their own session; there is no orchestrator except in QA.

| Phase | Skill | Output | Who decides it is right |
|---|---|---|---|
| 0. New project | `/new-project` | set-up repo, design tokens from Figma | checks, then developer checklist |
| 1. Page spec | `/page-spec` | `specs/<page>.md` | developer approves |
| 2. Schema | `/schema` | schema, projection, preview, seed, typegen | checks |
| 3. Static build | `/figma-match` | layout matched to Figma | measurements, sweep, screenshots |
| 4. Motion | `/motion` | motion map, motion spec, code | developer |
| 5. QA rounds | `/qa-intake`, `/qa-round` | `qa/round-N/<page>.md`, one commit per card | checks for match cards, developer for motion |
| 6. Launch | `/launch-<integration>` | integration done, recipe updated | recipe checklist, developer |

### 0. New project

- `pnpm setup-project` (script, idempotent): repo settings through `gh api` (auto-merge, delete head branches, suggest updating branches), package/node/pnpm updates, delete `app/visual-tests`, optional Sanity removal, replace the README's setup half with the project README.
- `/new-project` (skill): runs the script, then Design Setup from Figma through the Figma MCP (typography, text styles, colors, logomarks; Capsize metrics from the font files), recaptures section previews, and ends with the human checklist: Vercel, Sanity project and token, env vars.
- The org rulesets (below) replace "export and import the starter's rule set".

### 1. Page spec

`/page-spec <figma page url>` drafts `specs/<page>.md` from the Figma page and any notes David gives it. One row per section: Figma node, Sanity fields, behavior, motion source and fidelity, open questions. The developer approves it before any code. The spec is the page's checklist; it is deleted when the page ships.

### 2. Schema

This already works well, so it stays light: a short checklist (schema, projection, preview image, seed content, typegen) and the existing gates: `check-section-projections`, `sanity schema validate`, typegen.

### 3. Static build: Figma match

Per section, at each Figma breakpoint (desktop, tablet, mobile):

1. Measure. The agent reads node values through the Figma MCP into `match/<section>.json`. `pnpm match <section>` loads the page headless and compares element boxes, gaps, font sizes and line heights. More than 1px off fails, with the exact numbers.
2. Sweep. The same run reports horizontal overflow, clipped text, unexpected overlaps, broken images, console errors and elements off the viewport. No images, almost no tokens.
3. Screenshot. One per breakpoint, next to the Figma export. The agent fixes what it can see and reports anything it is unsure of. It never says "looks good".

Browser rule, replacing the full ban: agents may start their own `next dev` on a scratch port (4100-4199), never the developer's port, and stop it when done. Headless Playwright only. Never Claude in Chrome, never the developer's browser. Never more screenshots than these.

### 4. Motion

`pnpm motion:extract <video> --kind scroll|section|asset [--section <name>] [--fidelity exact|loose]` runs once per video:

- Frames at the video's own rate, stored outside the repo in `~/.reform/motion/<project>/<video>/` so every worktree and developer finds them. They can always be regenerated.
- Motion boundaries per region, and an activity timeline in text.
- Contact sheets of 16 to 25 frames per range.
- For `--kind scroll`: settled frames are matched to the Figma section exports, giving a section timeline. Whole-page movement is scroll; movement relative to the page is animation. Scroll-driven events are recorded in scroll terms ("starts when Hero's top reaches 70% of the viewport, ends at 40%"), time-based events in seconds.
- For `--kind section`: no matching; the named section's events only.
- For `--kind asset` (the real scrubbed video): key frames mapped for lining up scroll positions; encoding stays with `library/scrub`.

`pnpm motion:view` opens a local viewer: a scrubber with section chips, jump to any section or moment, and range editing. David approves the map once; it is committed as `motion/<page>.map.md`.

Fidelity, set per video or section:

- `loose` (default for scroll-throughs): order, placement and rough feel only. The recording's scroll speed is not the site's, so the agent does not copy timings. The developer tunes.
- `exact`: timings and scroll mapping must match. For section clips, and for eased stylized scroll that must match a scrubbed asset.

Agents read in this order: map text, then one contact sheet, then only the frames they need (`pnpm motion:frame <section> <time>`). They write the motion spec for the section (element, property, from, to, start, end, ease, kind), the developer corrects the spec, then the agent codes to it. The agent never judges how motion looks.

### 5. QA rounds

- `/qa-intake` (one session, one developer): `pnpm qa:pull` reads open Userback items through the API (URL, browser, viewport, screenshot, console logs). Slack feedback is collected by the agent into the same card format. The agent sorts cards by page and type (match, motion, content, schema), flags duplicates and unplaceable cards, and writes `qa/round-N/<page>.md`, one file per page, committed. David assigns owners.
- `/qa-round <page file>`: a slim orchestrator in the developer's session. One builder (Sonnet) per section, not per card, one or two at a time. Each match or content card is reproduced at the reporter's viewport, fixed, verified with the Figma-match tools, and committed on its own. Motion and feel cards go back to the developer. The orchestrator opens a PR and never merges.
- Write-back: for Userback cards, a comment with the commit and how it was verified. Never resolve a card; resolving is the reviewer's. Never post to a client in Slack; draft replies for the developer.
- When a round closes its folder is deleted.

### 6. Launch support

One skill per integration done more than once, each a checklist plus known pitfalls (hostname-gated testing, consent order). Starting list: open input below. Each launch updates its recipe through a library PR.

## Rules that change

- Commits: agents may commit on any branch except `main` and `staging`, after the checks pass, one step (section, schema, card) per commit. Agents may push feature branches and open PRs. Agents never merge (including `gh pr merge --auto`), rebase, amend or force push. "yolo" is dropped.
- Attribution: none. No Claude or AI trailers, PR lines, comments or app text.
- Comments: example-based rule below, enforced by `check:comments`.
- Generated files: never read `sanity.types.ts`, `schema.json`, `pnpm-lock.yaml` or `tsconfig.tsbuildinfo` whole; search them for the one name needed.
- Library bumps: read only `git diff <old>..<new> -- library/CHANGELOG.md`, not the whole file.
- Archive: `docs/archive/` is out of date; agents do not read it. `docs/universal-video/research/` moves there.
- Sessions: status line warns at 40%. Before clearing, the developer's agent rewrites `STATE.local.md` (date and head, done, in progress, next three, waiting on someone; 25 lines max, state only).
- Models: Sonnet for the main session and builders. Opus for the reviewer on library, schema or animation changes and for hard investigations; Sonnet reviewer otherwise.
- Review: the current one-round independent reviewer stays.

### Comment rule (draft; David's real examples replace these)

```md
## Comments
Write a comment only when the code cannot say it: a non-obvious why, a browser bug
workaround, where a magic number comes from. One line, two at most.
Never write: what the code does, how you got here, what changed, options you rejected,
notes to the reader or to yourself. Never mention AI or Claude.
JSDoc only on exported library functions: one sentence, plus params if not obvious.

Good:
  // Safari reports 0 height until the video's metadata loads
  const TABLET = 768 // Figma "Tablet" frame width
Bad:
  // We use a ref here instead of state because state would trigger a re-render,
  // which previously caused the animation to restart. This ensures that...
```

## Round 1: Foundation

Library PR:

- `library/agent/RULES.md`: the one rulebook, built from the starter's `AGENTS.md` and this spec, minus everything lint now enforces. Target under 4 KB.
- Convention lint rules for: inline styles and `element.style`, `css` without `f.responsive`/`f.unresponsive`, `f.mobile`, hand-written SVG components, `??`/`?.`/ternaries/template literals inside `try`, raw `<img>` where `StaticImage`/`SanityImage` belong. Added to the lint that CI already requires.
- `check:comments`: reads only comment lines added in the diff (against the merge base locally, the PR base in CI). Fails on blocks over 2 lines (JSDoc on library exports excepted), lines over about 100 characters, reasoning or history words (`we`, `I`, `now`, `previously`, `instead of`, `this ensures`, `note:`, `in order to`) and AI mentions. Allow-list: `biome-ignore`, `@ts-expect-error`, `eslint-disable`, `oxlint-disable`, `stylelint-disable`.
- Attribution check: a lefthook `commit-msg` job rejecting Claude, Anthropic, AI-generated and the robot line; the same phrases checked in PR titles and bodies in CI.
- Reviewer role file moves to `library/agent/agents/reviewer.md`, with one added check: any added comment explaining reasoning, history or what the code does is a convention finding.
- Delete `library/CLAUDE.md`.

Starter PR:

- `CLAUDE.md`: imports `library/agent/RULES.md`, then project notes. Delete the root `AGENTS.md`.
- `.claude/settings.json`: allow rules, a PostToolUse hook on Edit|Write running `check:comments` on the edited file, the PreToolUse `no-big-reads` hook, the 40% status line. `.claude/agents` and `.claude/skills` link into `library/agent/`.
- `.gitignore`: `STATE.local.md`.
- Move `docs/universal-video/research/` to `docs/archive/`. Fix the README's CONVENTIONS.md link.
- Library pointer bump.

Console and GitHub (David applies; exact JSON and commands drafted in round 1):

- Managed settings deny list and attribution, below.
- Org rulesets and CODEOWNERS, below.

Verified when:

- `pnpm lint` fails on a scratch file with each banned pattern, and passes on the current starter.
- `check:comments` fails on a sample long reasoning comment and passes on an allowed one; existing comments are never flagged.
- A commit with a Claude trailer is rejected.
- `claude doctor` on a second machine shows the managed settings loaded; an agent's `git push origin main` and `gh pr merge` are refused.
- A fresh session in the starter loads under 4 KB of rules (measured).

## Round 2: Workflow skills

Library PR: `/page-spec`, `/schema`, `/figma-match` with `pnpm match`, `/motion` with `motion:extract`, `motion:view` and `motion:frame`, `/qa-intake` with `qa:pull`, `/qa-round`, and the first launch recipes. Playwright added as a dev dependency. ffmpeg is a machine requirement (present on David's machine).

Verified when:

- `pnpm match` on one finished starter section reports the right numbers, and catches a deliberate 8px gap error and a deliberate overflow.
- `motion:extract` on one real scroll-through builds a map that David approves with only small fixes, and `motion:frame` returns the right frame.
- `/qa-round` on a real Userback round of one page produces one commit per card and a PR, and leaves motion cards with the developer.
- Tokens: one section built the old way and one the new way, compared from session usage.

## Round 3: Setup

Library and starter PRs: `pnpm setup-project` and `/new-project`, README split. Verified by setting up one throwaway repo from the template end to end.

## Managed settings (draft)

Needs the Owner or Primary Owner role in the Claude org (requested 2026-10-31). Until then the same deny list ships in the starter's `.claude/settings.json`, where a developer could override it locally; it moves to the console once access is granted, with no other change.

Plain deny rules only, so designers never see a dialog. Deny rules match command text and can be worked around; GitHub rulesets are the backstop.

```json
{
  "permissions": {
    "deny": [
      "Bash(git push --force*)", "Bash(git push -f*)", "Bash(git push * main*)", "Bash(git push * staging*)",
      "Bash(git reset --hard*)", "Bash(git checkout *)", "Bash(git restore *)", "Bash(git stash*)",
      "Bash(git merge *)", "Bash(git rebase *)", "Bash(git commit --amend*)", "Bash(gh pr merge*)",
      "Bash(vercel *)", "Bash(*rule-changes*)",
      "Read(./.env)", "Read(./.env.*)",
      "Edit(./library/agent/**)",
      "Edit(./.claude/**)",
      "Edit(./CLAUDE.md)"
    ]
  },
  "attribution": { "commit": "", "pr": "", "sessionUrl": false }
}
```

The edit denies also block David's own Claude sessions. Rule changes go through the script flow below.

## Changing the rules

The team decides a change together. A rule owner makes it. Rule owners are the members of a GitHub team, `rule-owners` (David, and anyone he adds, such as Adam). Adding or removing someone is a team membership change, with no file to edit.

1. A rule owner asks an agent to draft the change. The agent writes a script to `~/.reform/rule-changes/<date>-<slug>.sh`, outside every repo, so it is never committed and no one else sees it.
2. The script is guarded: it checks each target file is the exact version expected and changes nothing otherwise, makes only the stated edits, runs the checks, and prints the diff.
3. The agent shows the rule owner the exact change. It never runs the script; the deny rule `Bash(*rule-changes*)` blocks it, and the edit denies block a direct edit.
4. The rule owner runs it in their own terminal, reads the diff, commits and opens the library PR.

Only a rule owner can land it. CODEOWNERS names `rule-owners` as the required reviewer for `/agent/` in the library and for `/library`, `/.claude/` and `/CLAUDE.md` in each project, and the rulesets require code owner review there. With two or more owners, they approve each other's PRs. GitHub does not let an author approve their own PR, so a sole owner merges through the bypass.

Other developers can still propose a change: draft the script, run it on their own branch and open a PR. It does nothing until a rule owner approves.

## GitHub org rulesets (draft)

- Safety, on `main` and `staging`: required checks `library / build` and `library / formatting`, block force push and deletion. Bypass: David only. Target only repos that call the library workflow (by name pattern or a custom repository property), or other repos would wait forever for checks that never run.
- Review, on `main`: PR with 1 approval, threads resolved, code owner review required. Bypass: the internal team, through pull requests only, so one developer online can still ship with checks running.
- Rules, on `main` in the library: code owner review required, bypass `rule-owners` only. The internal team's bypass above must not cover the library's `/agent/` path, so this is a separate ruleset on the library repo.
- Projects: the internal team's bypass would also skip code owner review on a project's `/.claude/` and `/CLAUDE.md`. A required CI check `rules-locked` closes it: it fails when a PR changes those paths without a rule owner's approval, or moves the library pointer to a commit that is not on `next-main`. Check bypass is `rule-owners` only.
- CODEOWNERS: in each project `/library`, `/.claude/`, `/CLAUDE.md`; in the library `/agent/`; owner the `rule-owners` team.

## Open inputs from David

1. Real comment examples from past sweeps, kept and deleted (10 or so).
2. Launch integrations done more than once (GTM, consent, HubSpot are guesses).
3. Where the Userback API token lives (default: `USERBACK_API_TOKEN` in `.env`).
4. The internal team name for the rulesets, and who starts in `rule-owners`.

## Verified 2026-10-31

Tested with Claude Code 2.1.302 in a throwaway repo laid out like a project, and from the docs and code.

- `@lib/agent/RULES.md` imported from a project `CLAUDE.md` loads. Works.
- `.claude/skills` and `.claude/agents` as symlinks into the library folder: both load. Works.
- `attribution` with `commit: ""` and `pr: ""` hides the commit trailer and the PR line (settings reference). `sessionUrl: false` also drops the session link. Works.
- Custom lint rules: oxlint 1.89 already loads a JS plugin in `library/config/oxlint.ts` (`capsize.ts`), so convention rules go in the same way. Works. New rules must be `error`, not `warn`: CI's `pnpm lint` only fails on errors, and `capsize/no-layout-text-style` is currently `warn`.
- A `Read(...)` deny on a generated file also blocks Grep on it. Does not work for this. Replaced by a PreToolUse hook, `library/agent/hooks/no-big-reads.mjs`, in the repo settings: it blocks a Read of `sanity.types.ts`, `schema.json`, `pnpm-lock.yaml` or `tsconfig.tsbuildinfo` unless `limit` is 200 lines or fewer. Tested: Grep finds the type, a whole Read is blocked with a message pointing to Grep, a 3-line Read works.
