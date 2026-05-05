import { compileTime } from "library/compile-time"
import { foundation } from "library/layers.css"
import { css } from "library/styled"

const style = css`
	@layer ${foundation} {
		/* set base project colors */
		html {
			background: orange;
			color: blue;
		}

		/** restore default focus states for elements that need them */
		*:focus-visible {
			outline: 2px solid #00f8;
		}
	}
`

const compiledStyle = await compileTime(async () => style)

export const ProjectStyles = () => <style>{compiledStyle}</style>
