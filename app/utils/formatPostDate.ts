export const formatPostDate = (publishedAt: string) =>
	new Date(publishedAt).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	})
