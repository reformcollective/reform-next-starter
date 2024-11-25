import GlobalProviders from "components/Providers"
import Scroll from "library/Scroll"
import { GlobalStyles, css, styled, unresponsive } from "library/styled"
import { colorStyle } from "styles/colors"

import "the-new-css-reset/css/reset.css"

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
				<GlobalProviders>
					<GlobalStyles>{globalCss}</GlobalStyles>
					<GlobalStyles>{colorStyle}</GlobalStyles>
					<Scroll>
						<Main>{children}</Main>
					</Scroll>
				</GlobalProviders>
			</body>
		</html>
	)
}

const Main = styled(
	"main",
	unresponsive(css`
		overflow-x: clip;
	`),
)

// TODO: configure a default text color
const globalCss = unresponsive(css`
	/* default text styles */
	html {
		/* if your project uses a dark color for most text, set that here */
		color: black;
		font-family: sans-serif;
		// TODO textStyles.body
	}

	* {
		/* need this so that fonts match figma */
		text-rendering: geometricprecision;
		-webkit-font-smoothing: antialiased;
	}

	/** restore default focus states for elements that need them */
	*:focus-visible {
		outline: 2px solid #00f8;
	}
`)
