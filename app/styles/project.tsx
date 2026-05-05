import { foundation } from "library/layers.css"
import { compileTime } from "library/compile-time"
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

// oxlint-disable-next-line typescript-eslint(await-thenable)
const compiledStyle = await compileTime(() => style)

export const ProjectStyles = () => <style>{compiledStyle}</style>
