## Repo Context

This repository may exist in multiple checkouts, including git worktrees or separate clones. Work only in the current checkout and keep searches scoped to this directory.

Use `pnpm`.

`library/` is a git submodule shared across projects. Changes there affect multiple websites and must stay generic. After pulling a newer `library/` revision, read `library/CHANGELOG.md` for migration notes.

Never commit, push, start a merge/rebase, or amend unless the user says "yolo". Even if the user specifically asks, they must say the magic word first.

## Conventions

Prefer existing utilities in `library/` over one-off code. Search `library/` and real call sites first, and read the JSDoc.

- Styling: follow `library/styled/README.md` and existing styled components. Use tokens from `app/styles/colors` and `app/styles/text`.
- No inline styles, ever (`style={{}}`, `element.style.x = ...`). For runtime values use the `styled` `tokens` feature (see "tokens (dynamic values)" in `library/styled/README.md`). If that can't express it, ask.
- Capsize text styles use `::before`/`::after`. Apply them only to the element that directly contains text, never to flex/grid wrappers.
- The `css` helper always needs `f.responsive` or `f.unresponsive`.
- Animation: use the shared GSAP pattern around `library/useAnimation`.
- Images: `StaticImage` for raster, `SanityImage` for CMS. Shared assets in `app/images/`, component assets co-located.
- SVGs: `*.inline.svg` for React component imports, plain `.svg` for image assets. Never hand-write SVG components.
- Types: use Sanity-inferred types. No `any`, and casts only at documented structural mismatches or external API boundaries.
- React Compiler: compute `??`, `?.`, ternaries and template literals into variables above a `try`, never inside it.
- Responsive overrides use `f.small` (covers mobile and tablet), not `f.mobile`.

Figma work has extra rules in `.claude/rules/figma.md`.

## Workflow

Do what was asked, at the scope asked. No extra refactors, comments, features, tests or docs. If something extra would help, mention it at the end instead of doing it.

Keep working until the request is done. Ask only when you can't proceed or before a risky or irreversible step. If you could describe the change in one sentence, just make it. For larger or ambiguous work, ask the few questions that would change the approach, then proceed.

Verify with checks you can run, and show the output as evidence:

- Always: `WIREIT_LOGGER=metrics pnpm lint` once when the work is done. It includes type-aware oxlint, stylelint and the typegen/projection checks, so it is the type check. Fix what it reports. Formatting is handled by the pre-commit hook, so don't run `pnpm format`.
- Never on your own initiative: `pnpm build`, `pnpm dev`, browser automation, screenshots. The user usually has a dev server running already. If something can only be confirmed visually, say what you couldn't confirm.
- Prefer verification that doesn't run the app: `pnpm exec tsc --noEmit`, `sanity schema validate`, typegen.

### Review

For non-trivial changes, once lint passes, run one independent review before reporting: multi-file changes, new sections or components, anything in `library/`, Sanity schema or GROQ changes, animation logic.

1. Spawn the `reviewer` subagent (`.claude/agents/reviewer.md`) on the diff. Don't pass it your reasoning or conclusions.
2. Fix findings that are correctness bugs, missed requirements, or violations of the conventions above. Ignore style preferences and speculative edge cases.
3. One round only. Don't re-review unless a fix was substantial. Report what you fixed and which findings you rejected, with a reason.

Skip the review for small, well-understood changes and for pure copy or content edits.

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated, the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
