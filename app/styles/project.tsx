import { compileTime } from "library/compile-time"
import { foundation } from "library/layers.css"
import { css } from "library/styled"

const style = css`
	@layer ${foundation} {
		/* set base project colors */
		html {
			background: #fdf6ee;
			color: blue;
		}

		/** restore default focus states for elements that need them */
		*:focus-visible {
			outline: 2px solid #00f8;
		}

		/**
		 * the header is fixed, so anchor targets would otherwise land underneath it.
		 * --site-header-height is published by library/useAutoHideHeader.
		 */
		[id] {
			scroll-margin-top: calc(var(--site-header-height, 0px) + 24px);
		}
	}
`

const compiledStyle = await compileTime(async () => style)

export const ProjectStyles = () => <style>{compiledStyle}</style>
