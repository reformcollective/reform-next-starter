import GlobalProviders from "components/Providers"
import Scroll from "library/Scroll"

import "the-new-css-reset/css/reset.css"

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
				<GlobalProviders>
					<Scroll>{children}</Scroll>
				</GlobalProviders>
			</body>
		</html>
	)
}
