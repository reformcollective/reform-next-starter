import Image from "next/image"
import Link from "next/link"
import { css, fresponsive, styled } from "library/styled"
import { urlForImage } from "@/sanity/lib/utils"

type Nullish = null | undefined

export type AuthorInfo =
	| {
			fullName: string | Nullish
			roleAndCompany: string | Nullish
			photo: string
			slug: {
				current: string
			}
	  }
	| Nullish

export function Author({ author }: { author: AuthorInfo }) {
	if (!author) return null

	const imageURL = urlForImage(author?.photo)?.url()

	return (
		<Link href={`/blog/author/${author.slug}`}>
			{imageURL && <AuthorImage src={imageURL} alt={author?.fullName ?? ""} />}
			{author?.fullName}
			<br />
			{author?.roleAndCompany}
		</Link>
	)
}

const AuthorImage = styled(
	Image,
	fresponsive(css`
		width: 50px;
		height: 50px;
		border-radius: 50%;
		float: left;
	`),
)
