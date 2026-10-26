import textStyles from "app/styles/text"
import UniversalLink from "library/link"
import { PageCommitSignal } from "library/link/usePageTransition"
import { listStaticRoutes } from "library/list-pages"
import { css, f, styled } from "library/styled"

const prefix = "/visual-tests/"

export default function VisualTestsPage() {
	const tests = listStaticRoutes().filter((route) => route.startsWith(prefix))

	return (
		<Wrapper>
			<PageCommitSignal />
			<h1>Visual tests</h1>
			<List>
				{tests.map((route) => (
					<Item key={route}>
						<UniversalLink href={route}>{route.slice(prefix.length)}</UniversalLink>
					</Item>
				))}
			</List>
		</Wrapper>
	)
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: calc(var(--site-header-height, 100px) + 48px) 0 48px;
	`),
])

const List = styled("ul", [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		gap: 12px;
		list-style: none;
		padding: 0;
	`),
])

const Item = styled("li", [
	f.responsive(css`
		${textStyles.p1}
	`),
])
