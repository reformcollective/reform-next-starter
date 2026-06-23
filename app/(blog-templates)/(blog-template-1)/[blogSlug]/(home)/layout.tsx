import { css, f, styled } from "library/styled"

export default function BlogHomeLayout({ children }: { children: React.ReactNode }) {
	return <Wrapper>{children}</Wrapper>
}

const Wrapper = styled("div", [
	f.responsive(css`
		display: grid;
		width: 100%;
		padding-top: 102px;
		grid-column: fullbleed;
		grid-template-columns: subgrid;
	`),
	f.small(css`
		width: 100vw;
	`),
])
