"use client"

import GlobalProviders from "components/Providers"

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
				<GlobalProviders>{children}</GlobalProviders>
			</body>
		</html>
	)
}
