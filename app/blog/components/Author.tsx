import { css, fresponsive, styled } from "library/styled/alpha"
import UniversalImage from "library/UniversalImage"
import type { Author as AuthorType } from "sanity/lib/types"

export function AuthorLink({ author }: { author: AuthorType | null | undefined }) {
	if (!author) return null

	return (
		<div>
			<AuthorImage width={200} height={200} src={author.photo} />
			<div>{author?.fullName}</div>
			<div>{author?.roleAndCompany}</div>
		</div>
	)
}

const AuthorImage = styled(
	UniversalImage,
	fresponsive(css`
		width: 50px;
		border-radius: 50%;
		float: left;
	`),
)
