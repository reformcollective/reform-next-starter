import { createStyleString } from "@capsizecss/core"
import { css } from "library/styled"

export const transparentText = css`
	/* stylelint-disable-next-line property-no-vendor-prefix  */
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-moz-text-fill-color: transparent;
	background-size: 100%;
	background-clip: text;
`

export const clampText = (lines: number) => css`
	overflow: hidden;
	text-overflow: ellipsis;
	/* stylelint-disable-next-line property-no-vendor-prefix  */
	-webkit-text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: ${lines};
`

const sampleMetrics = {
	capHeight: 682,
	ascent: 1006,
	descent: -194,
	lineGap: 286,
	unitsPerEm: 1000,
}

/**
 * if text height is capped to baseline, use this utility to set text size
 */
const makeStyleString = (options: Parameters<typeof createStyleString>[1]) =>
	createStyleString("&", options).replaceAll(".&", "&")

const textStyles = {
	/**
	 * if you need to add one-off styles, do that here!
	 */
	custom: {},
	// don't wrap these in a fresponsive or unresponsive call!
	// that should happen at the component level
	h1: css`
		font-family:
			${
				/* myFontFromTypography.style.fontFamily */
				// ^ use the font from the typography file
				""
			},
			sans-serif;
		${makeStyleString({
			fontSize: 50,
			leading: 50 * 1.2, // same as line height 120%
			fontMetrics: sampleMetrics,
		})};
		font-style: normal;
		font-weight: 300;
	`,
	h2: css``,
	h3: css``,
	body: css``,
}

export default textStyles
