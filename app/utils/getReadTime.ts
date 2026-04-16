type PortableTextBlock = {
	_type: string
	children?: Array<{ _type: string; text?: string }>
}

export default function getReadTime(body: PortableTextBlock[] | null | undefined): string {
	const wordCount =
		body?.reduce((count, block) => {
			if (block._type === "block" && Array.isArray(block.children)) {
				return (
					count +
					block.children
						.filter((child) => child._type === "span")
						.reduce(
							(c, span) => c + ((span.text ?? "")?.split(/\s+/).filter(Boolean).length ?? 0),
							0,
						)
				)
			}
			return count
		}, 0) ?? 0
	return `${Math.max(1, Math.ceil(wordCount / 200))} min read`
}
