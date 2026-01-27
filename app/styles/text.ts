import { createStyleString } from "@capsizecss/core"
import { css } from "library/styled"
import { geist } from "./fonts/typography"

/**
 * if text height is capped to baseline, use this utility to set text size
 */
const makeStyleString = (options: Parameters<typeof createStyleString>[1]) =>
	createStyleString("&", options).replaceAll(".&", "&")

/**
 * Helper function to create typography styles with consistent formatting
 * @param options Typography style configuration options
 * @returns CSS string with properly formatted typography styles
 */
export function createStyle({
	fontFamily,
	fontMetrics,
	fontStyle = "normal",
	fontWeight = 400,
	letterSpacingPx: letterSpacing,
	fontSizePx: fontSize,
	lineHeightPercent: lineHeight = 100,
	textTransform = "none",
}: {
	fontFamily: { style: { fontFamily: string } }
	fontMetrics: {
		capHeight: number
		ascent: number
		descent: number
		lineGap: number
		unitsPerEm: number
	}
	fontStyle?: "normal" | "italic" | "oblique"
	fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
	/**
	 * a letter spacing value in pixels, will be converted to em using the provided font size
	 */
	letterSpacingPx: number
	/**
	 * font size in pixels
	 */
	fontSizePx: number
	/**
	 * line height as a percentage
	 */
	lineHeightPercent?: number
	textTransform?: "uppercase" | "lowercase" | "capitalize" | "none"
}) {
	const leading = fontSize * (lineHeight / 100)

	return css`
		font-family: ${fontFamily.style.fontFamily};
		font-style: ${fontStyle};
		font-weight: ${fontWeight};
		letter-spacing: ${letterSpacing / fontSize}em;
		text-transform: ${textTransform};
		${makeStyleString({
			fontSize,
			leading,
			fontMetrics,
		})}
	`
}

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

const textStyles = {
	/**
	 * if you need to add one-off styles, do that here!
	 */
	custom: {},
	// don't wrap these in a fresponsive or unresponsive call!
	// that should happen at the component level
	h1: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 50,
		lineHeightPercent: 120,
		letterSpacingPx: 0,
	}),
	h2: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 40,
		lineHeightPercent: 120,
		letterSpacingPx: 0,
	}),
	h3: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 30,
		lineHeightPercent: 120,
		letterSpacingPx: 0,
	}),
}

export default textStyles
