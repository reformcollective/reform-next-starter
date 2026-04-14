import { css, f, styled } from "library/styled/alpha"
import { colors } from "styles/colors.css"
import textStyles from "styles/text"

export default function NotFound() {
	return <Main>NOT FOUND</Main>
}

const Main = styled("div", [
	f.responsive(css`
		grid-column: main;
		text-align: center;
		padding: 100px 0;
		color: black;
		background: ${colors.white};
		${textStyles.h1}
	`),
	f.mobile(css`
		${textStyles.h2}
	`),
])
