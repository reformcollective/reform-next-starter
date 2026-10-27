import textStyles from "app/styles/text"
import { PageCommitSignal } from "library/link/usePageTransition"
import { assetMetadataFunctions, type VideoField } from "library/sanity/assetMetadata"
import { css, f, styled } from "library/styled"
import { defineQuery } from "next-sanity"
import { sanityFetch } from "sanity/lib/live"

import type { CaseMap } from "./types"

import { Showcase } from "./Showcase"

const videoTestCasesQuery = defineQuery(`
	${assetMetadataFunctions}

	*[_type == "videoTestCase" && defined(key) && defined(video)] | order(scenario asc, order asc) {
		_id,
		key,
		title,
		scenario,
		note,
		"video": reform::video(video)
	}
`)

export default async function UniversalVideoVisualTestPage() {
	const { data } = await sanityFetch({ query: videoTestCasesQuery })

	const cases: CaseMap = {}
	for (const item of data) {
		if (!item.key || !item.scenario) continue
		cases[item.key] = {
			_id: item._id,
			key: item.key,
			title: item.title ?? item.key,
			scenario: item.scenario,
			note: item.note ?? "",
			// the query result type and the hand-written VideoField describe the same projection
			video: item.video as unknown as VideoField,
		}
	}

	const seeded = Object.keys(cases).length > 0

	return (
		<>
			<PageCommitSignal />
			{seeded ? null : (
				<Banner>
					<Message>
						No seeded test cases found, so examples that need them show &quot;Missing fixture&quot;.
						Run the seed script, then reload:
					</Message>
					<Command>
						node --env-file=.env --experimental-strip-types scripts/seed-video-tests.ts
					</Command>
				</Banner>
			)}
			<Showcase cases={cases} />
		</>
	)
}

const Banner = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: calc(var(--site-header-height, 100px) + 24px) 0 0;
	`),
])

const Message = styled("p", [
	f.responsive(css`
		${textStyles.p1}
	`),
])

const Command = styled("code", [
	f.responsive(css`
		${textStyles.p2}
		padding: 12px 16px;
		background: rgb(128 128 128 / 15%);
		border-radius: 8px;
		width: fit-content;
	`),
])
