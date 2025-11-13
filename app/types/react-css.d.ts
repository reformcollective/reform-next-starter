// My css.d.ts file
import type * as CSS from "csstype"

// load bearing type declaration
type _ThisIsRequired = CSS.Properties

declare module "csstype" {
	interface Properties {
		// Allow any CSS Custom Properties
		[index: `--${string}`]: string | number | undefined
	}
}
