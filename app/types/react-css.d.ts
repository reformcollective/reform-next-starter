declare module "csstype" {
	interface Properties {
		[index: `--${string}`]: unknown
	}
}
