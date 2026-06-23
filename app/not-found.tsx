import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import { css, f, styled } from "library/styled"

export default function NotFound() {
	return <Main>NOT FOUND</Main>
}

const Main = styled("div", [
	f.responsive(css`
		padding: 100px 0;
		background: ${colors.white};
		color: black;
		grid-column: main;
		text-align: center;
		${textStyles.h1}
	`),
	f.mobile(css`
		${textStyles.h2}
	`),
])
