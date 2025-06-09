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
			<Embed className={className}>
				<ReactPlayer url={video.url} width="100%" height="100%" />
			</Embed>
		</ClientOnly>
	)
}

const Embed = styled(
	"div",
	fresponsive(css`
		display: grid;
		width: 600px;
		height: 400px;

		> div {
			width: 100% !important;
			height: 100% !important;
		}
	`),
)
