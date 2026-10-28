function copyWithTextarea(text: string) {
	const area = document.createElement("textarea")
	area.value = text
	area.setAttribute("readonly", "")
	document.body.append(area)
	area.select()
	const copied = document.execCommand("copy")
	area.remove()
	return copied
}

/** Writes plain text to the clipboard, falling back to a hidden textarea. Resolves to whether it worked. */
export function copyText(text: string): Promise<boolean> {
	if (!navigator.clipboard) return Promise.resolve(copyWithTextarea(text))
	return navigator.clipboard
		.writeText(text)
		.then(() => true)
		.catch(() => copyWithTextarea(text))
}
