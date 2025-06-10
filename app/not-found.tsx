import { css, f, fresponsive, styled } from "library/styled"
import colors from "styles/colors"
import textStyles from "styles/text"

export default function NotFound() {
	return <Main>NOT FOUND</Main>
}

const Main = styled("div", {
	...fresponsive(css`
		grid-column: main;
		text-align: center;
		padding: 100px 0;
		color: black;
		background: ${colors.white};
		${textStyles.h1}
	`),
	...f.mobile(css`
		${textStyles.h2}
	`),
})
