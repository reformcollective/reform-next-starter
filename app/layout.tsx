import GlobalProviders from "components/Providers"
import Scroll from "library/Scroll"
import "styles/reset.css"

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
