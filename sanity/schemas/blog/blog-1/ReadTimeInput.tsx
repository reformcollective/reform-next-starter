import { useFormValue } from "sanity"

interface PortableTextSpan {
	_type: string
	text?: string
}

interface PortableTextBlock {
	_type: string
	children?: PortableTextSpan[]
}

export function computeReadTime(body: PortableTextBlock[] | undefined): string {
	const wordCount =
		body?.reduce((count, block) => {
			if (block._type === "block" && block.children) {
				return (
					count +
					block.children
						.filter((child) => child._type === "span")
						.reduce((c, span) => c + (span.text?.split(/\s+/).filter(Boolean).length ?? 0), 0)
				)
			}
			return count
		}, 0) ?? 0
	return `${Math.max(1, Math.ceil(wordCount / 200))} min read`
}

export function ReadTimeInput() {
	const body = useFormValue(["body"]) as PortableTextBlock[] | undefined
	const readTime = computeReadTime(body)
	const wordCount =
		body?.reduce((count, block) => {
			if (block._type === "block" && block.children) {
				return (
					count +
					block.children
						.filter((child) => child._type === "span")
						.reduce((c, span) => c + (span.text?.split(/\s+/).filter(Boolean).length ?? 0), 0)
				)
			}
			return count
		}, 0) ?? 0

	return (
		<p style={{ margin: "8px 0", color: "var(--card-muted-fg-color)" }}>
			~{readTime} ({wordCount} words)
		</p>
	)
}
