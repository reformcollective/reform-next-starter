import type { GetSectionType } from "page"

export default function BlogHubSection({ featuredPost }: GetSectionType<"blogHub">) {
	return <div>{featuredPost?.title}</div>
}
