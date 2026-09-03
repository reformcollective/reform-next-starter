import getReadTime, { countWords } from "app/utils/getReadTime"
import { useFormValue } from "sanity"

type ArticleSection = {
	_type: string
	body?: Parameters<typeof countWords>[0]
}

export function ReadTimeInput() {
	const sections = useFormValue(["sections"]) as ArticleSection[] | undefined
	const body = sections?.flatMap((section) =>
		section._type === "blogArticle" ? (section.body ?? []) : [],
	)

	return (
		<p style={{ margin: "8px 0", color: "var(--card-muted-fg-color)" }}>
			~{getReadTime(body)} ({countWords(body)} words)
		</p>
	)
}
