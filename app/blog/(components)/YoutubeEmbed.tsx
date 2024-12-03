"use-client"

import { css, fresponsive, styled } from "library/styled"
import ReactPlayer from "react-player"

type Nullish = null | undefined

export function YoutubeEmbed({ url }: { url: string }) {
	return <Embed url={url} />
}

const Embed = styled(
	ReactPlayer,
	fresponsive(css`
		border: 1px solid orange;
		display: grid;
	`),
)
