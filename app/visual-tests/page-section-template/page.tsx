import PageSection from "app/sections/PageSectionTemplate"
import UniversalLink from "library/link"
import { PageCommitSignal } from "library/link/usePageTransition"
import { css, f, styled } from "library/styled"

/**
 * everything below `Nav` is a hardcoded copy-paste of
 * `app/sections/PageSectionTemplate.tsx` — that's the thing being tested.
 */

export default function PageSectionTemplateTests() {
	return (
		<>
			<PageCommitSignal />
			<Nav>
				<h1>Page Section Template Tests</h1>
				<UniversalLink href="/visual-tests">← visual tests</UniversalLink>
				<Note>
					the <code>Wrapper</code> / <code>Inner</code> pair below is a hardcoded copy-paste of{" "}
					<strong>app/sections/PageSectionTemplate.tsx</strong>, with content dropped in. Its
					wrapper should run edge to edge, while its content lines up with this text and with the
					header and footer.
				</Note>

				<Note>
					<strong>why there is no max-width on the inner element.</strong> the page grid brackets{" "}
					<code>main</code> with <code>calc((100vw - sourceDesignWidth) / 2)</code> spacer tracks (
					<code>library/layoutGridBuilder.tsx</code>). those px run through the same responsive
					conversion as every other px, so what they resolve to depends on the breakpoint — and{" "}
					<code>main</code> ends up capping and centering itself at every size. resize the window
					and watch the bordered edges below:
				</Note>

				<Table>
					<tbody>
						<tr>
							<th>mobile ≤700</th>
							<td>
								<code>375px</code> → <code>100vw</code>
							</td>
							<td>spacers 0</td>
							<td>fluid, full margin-to-margin</td>
						</tr>
						<tr>
							<th>tablet 701–1024</th>
							<td>
								<code>375px</code> → <code>701px</code>
							</td>
							<td>
								<code>(100vw - 701px) / 2</code>
							</td>
							<td>capped 701px, centered</td>
						</tr>
						<tr>
							<th>desktop 1025–1600</th>
							<td>
								<code>1440px</code> → <code>100vw</code>
							</td>
							<td>spacers 0</td>
							<td>fluid, full margin-to-margin</td>
						</tr>
						<tr>
							<th>fullWidth ≥1601</th>
							<td>
								<code>1440px</code> → <code>1601px</code>
							</td>
							<td>
								<code>(100vw - 1601px) / 2</code>
							</td>
							<td>capped 1601px, centered</td>
						</tr>
					</tbody>
				</Table>

				<Note>
					this holds because <code>app/libraryConfig.ts</code> sets <code>scaleFully: false</code> —
					that&rsquo;s what makes px pin above 1600 and the spacer tracks grow. flip it to{" "}
					<code>true</code> and nothing caps <code>main</code> anymore, at which point a max-width
					becomes real. same if you put content on <code>fullbleed</code> or{" "}
					<code>scaled-main</code> instead of <code>main</code>.
				</Note>
			</Nav>

			<Marker>↑ this text is on `main` — everything below should line up with it</Marker>

			<Wrapper>
				<Inner>
					<h2>Wrapper + Inner</h2>
					<p>
						the scaffold, copy-pasted and filled in. the wrapper is fullbleed and re-declares the
						page grid; this inner element sits on `grid-column: main`.
					</p>
				</Inner>
			</Wrapper>

			<TintedWrapper>
				<Inner>
					<h2>Wrapper + Inner, tinted</h2>
					<p>
						same scaffold with a background on the wrapper, so you can see it bleed past both edges
						of the viewport while the content stays on `main`.
					</p>
				</Inner>
			</TintedWrapper>

			<Marker>↓ the bare template import, unmodified</Marker>

			<PageSection />

			<Nav>
				<p>
					the bare template renders an empty `Inner`, so it collapses to no height — if there's a
					border on it you'll see a thin line above, otherwise nothing. that's expected.
				</p>
			</Nav>
		</>
	)
}

const Nav = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		padding: 48px 0;
	`),
])

const Note = styled("p", [
	f.responsive(css`
		max-width: 640px;
		padding: 16px;
		border: 1px solid black;
		background: #ffd;
	`),
])

const Table = styled("table", [
	f.responsive(css`
		border-collapse: collapse;
		text-align: left;

		th,
		td {
			padding: 4px 16px 4px 0;
			vertical-align: top;
			white-space: nowrap;
		}
	`),
])

const Marker = styled("p", [
	f.responsive(css`
		grid-column: main;
		padding: 8px 0;
		color: #c00;
	`),
])

/* ------------------------------------------------------------------------- */
/* copy-pasted from app/sections/PageSectionTemplate.tsx                       */
/* ------------------------------------------------------------------------- */

/**
 * spans the full width of the page and re-declares the page grid,
 * so that children can use `grid-column: main` (or any other column)
 */
const Wrapper = styled("div", [
	f.unresponsive(css`
		grid-column: fullbleed;
		grid-template-columns: var(--subgrid-columns);
		position: relative;
		display: grid;
		align-items: center;
		overflow: hidden;
	`),
])

/** `main` is already centered and constrained to the design width */
const Inner = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		padding: 96px 0;
	`),
	f.small(css`
		padding: 48px 0;
	`),
])

const TintedWrapper = styled(Wrapper, [
	f.unresponsive(css`
		background: #def;

		> div {
			background: tomato;
			padding: 14px;
		}
	`),
])
