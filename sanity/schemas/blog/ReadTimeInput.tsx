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
		<p className="studio-read-time">
			~{getReadTime(body)} ({countWords(body)} words)
		</p>
	)
}
