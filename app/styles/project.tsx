import { foundation } from "library/layers.css"
import { compileTime, css } from "library/styled/alpha"

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

const compiledStyle = compileTime(() => style)

export const ProjectStyles = () => <style>{compiledStyle}</style>
