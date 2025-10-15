import Footer from "components/Footer"
import Header from "components/Header"
import { Preloader } from "components/Preloader"
import GlobalProviders from "components/Providers"
import { eases } from "library/eases"
import { makeResponsiveGrid } from "library/layoutGridBuilder"
import { ResetStyles } from "library/reset"
import { css, f, fresponsive, GlobalStyles, styled } from "library/styled"
import { defineQuery, stegaClean } from "next-sanity"
import { lazy, Suspense } from "react"
import { sanityFetch } from "sanity/lib/live"
import colors from "styles/colors"
import { desktopDesignSize, mobileDesignSize } from "styles/media"

const SanityLive = lazy(() => import("sanity/lib/live"))
const PageTransition = lazy(() => import("components/PageTransition"))

const headerQuery = defineQuery(`*[_type == "header"][0]`)

const footerQuery = defineQuery(`*[_type == "footer"][0]`)

const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

export default async function RootLayout(props: LayoutProps<"/">) {
	const { children } = props
	const { data: headerData } = await sanityFetch({ query: headerQuery })
	const { data: footerData } = await sanityFetch({ query: footerQuery })
	const { data: settings } = await sanityFetch({ query: settingsQuery })

	return (
		<html lang="en">
			<body>
				<GlobalProviders>
					<Suspense>
						<SanityLive />
					</Suspense>
					<GlobalStyles>{globalCss}</GlobalStyles>
					<ResetStyles />

					<PageRoot className="root-layout">
						<Suspense>
							<PageTransition />
						</Suspense>
						<Preloader />
						{headerData && <Header {...headerData} />}
						{children}
						{footerData && <Footer {...footerData} />}
					</PageRoot>
				</GlobalProviders>
				{settings?.tags?.map(
					(tag: { _key: string; embed?: string }) =>
						tag.embed && (
							<div
								key={tag._key}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: embeds and scripts
								dangerouslySetInnerHTML={{ __html: stegaClean(tag.embed) }}
							/>
						),
				)}
			</body>
		</html>
	)
}

const PageRoot = styled("div", {
	...fresponsive(css`
		/*  ensure modals, portals, etc. don't appear behind the page */
		isolation: isolate;

		/* ensure page content fills the view vertically */
		min-height: 100svh;
		grid-template-rows: auto auto auto 1fr;
		display: grid;
		grid-template-columns: var(--subgrid-columns);
		--subgrid-columns: ${makeResponsiveGrid({
			columnCount: 10,
			gutter: "20px",
			margin: "50px",
			sourceDesignWidth: desktopDesignSize,
		})};

		/* reset colors */
		color: ${colors.black};

		/* prevent x overflow on touch devices */
		overflow-x: clip;

		main {
			background: ${colors.white};
			color: ${colors.black};
		}
	`),

	...f.small(css`
		--subgrid-columns: ${makeResponsiveGrid({
			columnCount: 4,
			gutter: "10px",
			margin: "24px",
			sourceDesignWidth: mobileDesignSize,
		})};
	`),
})

const globalCss = fresponsive(css`
	html {
		color: ${colors.black};
		font-family: sans-serif;

		/* hide scrollbars */
		/* stylelint-disable-next-line plugin/no-unsupported-browser-features */
		scrollbar-width: none;

		body::-webkit-scrollbar {
			display: none;
		}
	}

	body {
		overflow-x: clip;
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
	 * comment below back in if using view transitions
	 */

	/* ::view-transition-group(*) {
		animation-timing-function: ${eases.cubic.inOut};
	} */

	/**
	 * this is a workaround for lvh being calculated incorrectly
	 * - on iOS safari
	 * - AND only in the webview
	 * - AND only before the page has resized (sometimes)
	 *
	 * this will only be visible if lvh is calculated incorrectly
	 * safari is such a good browser with no problems
	 */
	@supports not (cursor: cell) {
		body::before {
			content: "";
			pointer-events: none;
			position: fixed;
			top: 100lvh;
			left: 0;
			width: 100vw;
			height: 100lvh;
			background: red;
			z-index: 999;
		}
	}
`)
