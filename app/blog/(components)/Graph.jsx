const utils = globalThis.helpers

export default function Graph(node) {
	if (node.internal.type === "ContentfulUnifiedTemplateBlogArticle") {
		const mainImage = node.mainImage___NODE
			? utils.getNode(node.mainImage___NODE)
			: null

		const author = node.author___NODE ? utils.getNode(node.author___NODE) : null
		const authorImage = author ? utils.getNode(author.photo___NODE) : null

		return (
			<div
				style={{
					display: "flex",
					padding: 48,
					paddingRight: 48 * 2,
					height: "100%",
					width: "100px",
					backgroundColor: "whitesmoke",
					gap: 36,
				}}
			>
				{mainImage && (
					<img
						src={mainImage.url}
						alt=""
						style={{
							width: "50%",
							height: "100%",
							objectFit: "cover",
							borderRadius: 24,
						}}
					/>
				)}
				<div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
					<h1 style={{ fontSize: 72, fontWeight: "bold" }}>{node.title}</h1>
					{author && (
						<div style={{ display: "flex", alignItems: "center", gap: 24 }}>
							{authorImage && (
								<img
									alt=""
									src={authorImage.url}
									style={{
										borderRadius: "50%",
										aspectRatio: "1/1",
										objectFit: "cover",
										width: 75,
									}}
								/>
							)}
							<p
								style={{
									fontSize: 48,
								}}
							>
								{author.fullName}
							</p>
						</div>
					)}
				</div>
			</div>
		)
	}

	return <div>Default OG image</div>
}
