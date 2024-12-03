import Footer from "components/Footer"
import Header from "components/Header"
import GlobalProviders from "components/Providers"
import Scroll from "library/Scroll"
import {
	GlobalStyles,
	css,
	fresponsive,
	styled,
	unresponsive,
} from "library/styled"
import { VisualEditing } from "next-sanity"
import { colorStyle } from "styles/colors"
import textStyles from "styles/text"

import "the-new-css-reset/css/reset.css"

export const metadata = {
	title: "Reform Starter",
	twitter: {
		card: "summary_large_image",
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body
				// gsap changes with the style attribute, which will cause ssr issues
				suppressHydrationWarning={true}
			>
				<GlobalProviders>
					<GlobalStyles>{globalCss}</GlobalStyles>
					<GlobalStyles>{colorStyle}</GlobalStyles>
					<VisualEditing />
					<Header />
					<Scroll>
						<Spacer />
						hello world
						<Main>{children}</Main>
						<Footer />
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

const Spacer = styled(
	"div",
	fresponsive(css`
		height: 100px;
	`),
)

// TODO: configure a default text color
const globalCss = fresponsive(css`
	/* default text styles */
	html {
		/* if your project uses a dark color for most text, set that here */
		color: black;
		font-family: sans-serif;
		${textStyles.body}
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
