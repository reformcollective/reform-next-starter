export { metadata, viewport } from "next-sanity/studio"

export default function RootLayout({ children }: LayoutProps<"/">) {
	return <>{children}</>
}
