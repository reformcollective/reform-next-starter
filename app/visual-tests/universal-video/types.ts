import type { VideoField } from "library/sanity/assetMetadata"
import type { UniversalVideoProps } from "library/videos/types"

export interface ShowcaseCase {
	_id: string
	key: string
	title: string
	scenario: string
	note: string
	video: VideoField
}

export type CaseMap = Record<string, ShowcaseCase | undefined>

/** Props a scenario stage hands to each UniversalVideo it renders. The stage chooses `trigger` and `ref`. */
export type StageVideoProps = Omit<UniversalVideoProps, "ref" | "trigger">
