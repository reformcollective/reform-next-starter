import ClientOnly from "library/ClientOnly"
import { css, fresponsive, styled } from "library/styled"
import ReactPlayer from "react-player"

/**
 * A React component for playing a variety of URLs, including file paths, HLS, DASH, YouTube, Vimeo, Wistia and Mux.
 */
export function VideoEmbed({
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
				<ReactPlayer src={video.url} width="100%" height="100%" />
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
