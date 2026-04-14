import { css, f, styled } from "library/styled/alpha"

export default function BlogHomeLayout({ children }: { children: React.ReactNode }) {
	return <Wrapper>{children}</Wrapper>
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		grid-template-columns: subgrid;
		place-items: center;
		width: 100%;
		padding-top: 102px;
	`),
	f.small(css`
		width: 100vw;
		padding: 0 8px;
	`),
])
