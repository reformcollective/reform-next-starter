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
import { draftMode } from "next/headers"
import { Suspense, lazy } from "react"
import SanityLive, {
	getDynamicFetchOptions,
	sanityFetch,
	type DynamicFetchOptions,
} from "sanity/lib/live"

const PageTransition = lazy(() => import("app/components/PageTransition"))

const headerQuery = defineQuery(`*[_type == "header"][0]`)
const footerQuery = defineQuery(`*[_type == "footer"][0]`)
const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

export const metadata: Metadata = {
	metadataBase: siteURL,
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
	const { isEnabled: isDraftMode } = await draftMode()

	return (
		<html lang="en">
			<body>
				<GlobalProviders>
					<PageRoot className="root-layout">
						<Preloader />
						<Suspense>
							<PageTransition />
						</Suspense>
						<SanityLive includeDrafts={isDraftMode} />
						{isDraftMode ? (
							<Suspense fallback={null}>
								<DynamicHeader />
							</Suspense>
						) : (
							<CachedHeader perspective="published" stega={false} />
						)}
						{children}
						{isDraftMode ? (
							<Suspense fallback={null}>
								<DynamicFooter />
							</Suspense>
						) : (
							<CachedFooter perspective="published" stega={false} />
						)}
					</PageRoot>
				</GlobalProviders>
				{isDraftMode ? (
					<Suspense fallback={null}>
						<DynamicSettingsTags />
					</Suspense>
				) : (
					<CachedSettingsTags perspective="published" stega={false} />
				)}
			</body>
		</html>
	)
}

async function DynamicHeader() {
	const { perspective, stega } = await getDynamicFetchOptions()
	return <CachedHeader perspective={perspective} stega={stega} />
}

async function CachedHeader({
	perspective,
	stega,
}: Pick<DynamicFetchOptions, "perspective" | "stega">) {
	"use cache"
	const { data: headerData } = await sanityFetch({ query: headerQuery, perspective, stega })
	return headerData ? (
		<Suspense fallback={null}>
			<Header {...headerData} />
		</Suspense>
	) : null
}

async function DynamicFooter() {
	const { perspective, stega } = await getDynamicFetchOptions()
	return <CachedFooter perspective={perspective} stega={stega} />
}

async function CachedFooter({
	perspective,
	stega,
}: Pick<DynamicFetchOptions, "perspective" | "stega">) {
	"use cache"
	const { data: footerData } = await sanityFetch({ query: footerQuery, perspective, stega })
	return footerData ? (
		<Suspense fallback={null}>
			<Footer {...footerData} />
		</Suspense>
	) : null
}

async function DynamicSettingsTags() {
	const { perspective, stega } = await getDynamicFetchOptions()
	return <CachedSettingsTags perspective={perspective} stega={stega} />
}

async function CachedSettingsTags({
	perspective,
	stega,
}: Pick<DynamicFetchOptions, "perspective" | "stega">) {
	"use cache"
	const { data: settings } = await sanityFetch({ query: settingsQuery, perspective, stega })

	return settings?.tags?.map(
		(tag: { _key: string; embed?: string }) =>
			tag.embed && (
				<div
					key={tag._key}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: embeds and scripts
					dangerouslySetInnerHTML={{ __html: stegaClean(tag.embed) }}
				/>
			),
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
