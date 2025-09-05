export { metadata, viewport } from "next-sanity/studio"

export default function RootLayout(props: LayoutProps<"/">) {
	const { children } = props
	return <>{children}</>
}
