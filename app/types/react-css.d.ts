// My css.d.ts file
import type * as CSS from "csstype"

type _Test = CSS.Properties

declare module "csstype" {
	interface Properties {
		// Allow any CSS Custom Properties
		[index: `--${string}`]: string | number | undefined
	}
}
