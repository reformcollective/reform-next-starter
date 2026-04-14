import { type DocumentActionComponent, useDocumentOperation } from "sanity"
import { computeReadTime } from "./ReadTimeInput"

export function createPublishWithReadTime(
	originalPublishAction: DocumentActionComponent,
): DocumentActionComponent {
	const PublishWithReadTime: DocumentActionComponent = (props) => {
		const originalResult = originalPublishAction(props)
		const { patch } = useDocumentOperation(props.id, props.type)

		if (!originalResult) return null

		return {
			...originalResult,
			label: originalResult?.label ?? "Publish",
			onHandle: () => {
				const body = (props.draft as Record<string, unknown> | null)?.body as
					| { _type: string; children?: { _type: string; text?: string }[] }[]
					| undefined
				patch.execute([{ set: { readTime: computeReadTime(body) } }])
				originalResult?.onHandle?.()
			},
		}
	}
	return PublishWithReadTime
}
