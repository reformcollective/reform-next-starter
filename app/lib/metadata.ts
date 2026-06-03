export function resolveMetaTitle({
	separator,
	suffix,
	title,
}: {
	separator?: string | null
	suffix?: string | null
	title?: string | null
}) {
	const cleanTitle = title?.trim()
	const cleanSuffix = suffix?.trim()

	if (!cleanTitle) return cleanSuffix
	if (!cleanSuffix || cleanTitle === cleanSuffix) return cleanTitle

	return `${cleanTitle} ${separator?.trim() || "|"} ${cleanSuffix}`
}
