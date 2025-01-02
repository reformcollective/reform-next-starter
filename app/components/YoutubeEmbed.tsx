import ClientOnly from "library/ClientOnly"
import { css, fresponsive, styled } from "library/styled"
import ReactPlayer from "react-player"

export function YoutubeEmbed({
	className,
	video,
}: {
	className?: string
	video: { url?: string | null | undefined }
}) {
	if (!video.url) return null

	return (
		<ClientOnly>
			<Embed url={video.url} className={className} />
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
