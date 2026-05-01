import { css, f, styled } from "library/styled"

export default function BlogHomeLayout({ children }: { children: React.ReactNode }) {
	return <Wrapper>{children}</Wrapper>
}

const Wrapper = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		display: grid;
		grid-template-columns: subgrid;
		width: 100%;
		padding-top: 102px;
	`),
	f.small(css`
		width: 100vw;
	`),
])
