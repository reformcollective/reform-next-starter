import { css, fresponsive, styled } from "library/styled"
import type { Author } from "@/sanity.types"
import UniversalImage from "library/UniversalImage"

export function AuthorLink({ author }: { author: Author | null | undefined }) {
	if (!author) return null

	return (
		<div>
			<AuthorImage
				width={200}
				height={200}
				src={author.photo}
				alt={author?.photo?.alt}
			/>
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
