import { css, f, styled } from "library/styled/alpha"
import UniversalImage from "library/UniversalImage"
import type { RawAuthor } from "../types"

export function AuthorLink({ author }: { author: RawAuthor | null | undefined }) {
	if (!author) return null

	return (
		<div>
			<AuthorImage width={200} height={200} src={author.image} />
			<div>{author.name}</div>
		</div>
	)
}

const AuthorImage = styled(UniversalImage, [
	f.responsive(css`
		width: 50px;
		border-radius: 50%;
		float: left;
	`),
])
