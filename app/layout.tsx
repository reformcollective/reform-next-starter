import Footer from "components/Footer"
import Header from "components/Header"
import GlobalProviders from "components/Providers"
import { ResetStyles } from "library/reset"
import { resolveOpenGraphImage } from "library/sanity/utils"
import { siteURL } from "library/siteURL"
import {
	css,
	fresponsive,
	GlobalStyles,
	styled,
	unresponsive,
} from "library/styled"
import type { Metadata } from "next"
import { defineQuery } from "next-sanity"
import { sanityFetch, SanityLive } from "sanity/lib/live"

const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

export const generateMetadata = async (): Promise<Metadata> => {
	const { data: settings } = await sanityFetch({
		query: settingsQuery,
	})

	const imageData =
		settings?.ogImage && resolveOpenGraphImage(settings?.ogImage)
	const newImage = imageData ? [imageData] : undefined

	return {
		metadataBase: new URL(siteURL),
		title: settings?.defaultTitle,
		description: settings?.defaultDescription,
		twitter: {
			card: "summary_large_image",
			images: newImage,
		},
		openGraph: {
			images: newImage,
		},
	}
}

const headerQuery = defineQuery(`*[_type == "header"][0]`)
const footerQuery = defineQuery(`*[_type == "footer"][0]`)

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { data: headerData } = await sanityFetch({ query: headerQuery })
	const { data: footerData } = await sanityFetch({ query: footerQuery })

	return (
		<html lang="en">
			<body
				// gsap messes with the style attribute, which will cause ssr issues
				suppressHydrationWarning
			>
				<ResetStyles />
				<GlobalProviders>
					<SanityLive />
					<GlobalStyles>{globalCss}</GlobalStyles>
					<PageRoot className="root-layout">
						{headerData && <Header {...headerData} />}
						<Main>{children}</Main>
						{footerData && <Footer {...footerData} />}
					</PageRoot>
				</GlobalProviders>
			</body>
		</html>
	)
}

const PageRoot = styled(
	"div",
	unresponsive(css`
		/*  ensure modals, portals, etc. don't appear behind the page */
		isolation: isolate;

		/* ensure page content fills the view */
		min-height: 100lvh;
		display: grid;
		grid-template-rows: auto 1fr auto;
	`),
)

const Main = styled(
	"main",
	unresponsive(css`
		overflow-x: clip;
		isolation: isolate;
	`),
)

// TODO: configure a default text color and background
const globalCss = fresponsive(css`
	html {
		/* if your project uses a dark color for most text, set that here */
		background: #151515;
		color: #f9f9fb;
		font-family: sans-serif;
	}

	body {
		overflow-x: hidden;
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

	/**
	 * this is a workaround for lvh being calculated incorrectly
	 * - on iOS safari
	 * - AND only in the webview
	 * - AND only before the page has resized (sometimes)
	 *
	 * this will only be visible if lvh is calculated incorrectly
	 * safari is such a good browser with no problems
	 */
	body::before {
		content: "";
		pointer-events: none;
		position: fixed;
		top: 100lvh;
		left: 0;
		width: 100vw;
		height: 100lvh;
		background: currentcolor;
		z-index: 999;
	}
`)
