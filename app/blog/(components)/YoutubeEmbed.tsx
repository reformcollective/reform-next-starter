import ClientOnly from "library/ClientOnly"
import { css, fresponsive, styled } from "library/styled"
import ReactPlayer from "react-player"

export function YoutubeEmbed({ url }: { url: string }) {
	return (
		<ClientOnly>
			<Embed url={url} />
		</ClientOnly>
	)
}

const Embed = styled(
	ReactPlayer,
	fresponsive(css`
		display: grid;
		width: 600px;
		height: 400px;
	`),
)
