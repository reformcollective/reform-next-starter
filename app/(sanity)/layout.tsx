import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export { metadata, viewport } from "next-sanity/studio"

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <>{children}</>
}
