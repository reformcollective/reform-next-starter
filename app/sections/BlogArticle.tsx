import type { GetSectionType } from "page"

export default function BlogArticleSection({ body }: GetSectionType<"blogArticle">) {
	return <div>{body?.length} blocks</div>
}
