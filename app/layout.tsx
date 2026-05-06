import type { Metadata } from "next"

import Footer from "app/components/Footer"
import Header from "app/components/Header"
import { Preloader } from "app/components/Preloader"
import GlobalProviders from "app/components/Providers"
import { desktopDesignSize, mobileDesignSize } from "app/styles/media"
import { makeResponsiveGrid } from "library/layoutGridBuilder"
import { siteURL } from "library/siteURL"
import { css, f, styled } from "library/styled"
import "app/styles/colors.css"
import { defineQuery, stegaClean } from "next-sanity"
import { Suspense, lazy } from "react"
import SanityLive, { sanityFetch } from "sanity/lib/live"

const PageTransition = lazy(() => import("app/components/PageTransition"))

const headerQuery = defineQuery(`*[_type == "header"][0]`)
const footerQuery = defineQuery(`*[_type == "footer"][0]`)
const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

export const metadata: Metadata = {
	metadataBase: siteURL,
}

export * from "library/segmentDefaults"

export default async function RootLayout({ children }: LayoutProps<"/">) {
	const { data: headerData } = await sanityFetch({ query: headerQuery })
	const { data: footerData } = await sanityFetch({ query: footerQuery })
	const { data: settings } = await sanityFetch({ query: settingsQuery })

	return (
		<html lang="en">
			<body>
				<GlobalProviders>
					<PageRoot className="root-layout">
						<Preloader />
						<Suspense>
							<PageTransition />
						</Suspense>
						<SanityLive />
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

const PageRoot = styled("div", [
	f.responsive(css`
		/*  ensure modals, portals, etc. don't appear behind the page */
		isolation: isolate;

		/* layout grid setup */
		min-height: 100svh;
		display: grid;
		grid-template: "header" auto "content" 1fr "footer" auto;
		grid-template-columns: var(--subgrid-columns);
		--subgrid-columns: ${makeResponsiveGrid({
			columnCount: 10,
			gutter: "20px",
			margin: "50px",
			sourceDesignWidth: desktopDesignSize,
		})};

		/* prevent x overflow on touch devices */
		overflow-x: clip;
	`),

	f.small(css`
		--subgrid-columns: ${makeResponsiveGrid({
			columnCount: 4,
			gutter: "10px",
			margin: "24px",
			sourceDesignWidth: mobileDesignSize,
		})};
	`),
])
