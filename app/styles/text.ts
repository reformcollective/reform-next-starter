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
	capHeight: 728,
	ascent: 968,
	descent: -242,
	lineGap: 0,
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

	// ---------------------------------------------------------------------------
	// Blog Template 1 Text Styles
	// NOTE: These use geist as a placeholder for both serif and sans roles.
	// Replace font references (and metrics) when adopting this template with
	// project fonts. Sizes and weights match the enzo reference design.
	// ---------------------------------------------------------------------------

	// Headings Serif (placeholder: geist — replace with project serif font)
	h1Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 154,
		fontWeight: 400,
		lineHeightPercent: 100,
		letterSpacingPx: -7.7,
	}),
	h2Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 84,
		fontWeight: 400,
		lineHeightPercent: 100,
		letterSpacingPx: -4.2,
	}),
	h3Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 70,
		fontWeight: 400,
		lineHeightPercent: 100,
		letterSpacingPx: -3.5,
	}),
	h4Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 50,
		fontWeight: 400,
		lineHeightPercent: 100,
		letterSpacingPx: -2.5,
	}),
	h5Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 40,
		fontWeight: 400,
		lineHeightPercent: 100,
		letterSpacingPx: -2,
	}),
	h6Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 26,
		fontWeight: 400,
		lineHeightPercent: 120,
		letterSpacingPx: -0.52,
	}),
	h7Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 21,
		fontWeight: 400,
		lineHeightPercent: 120,
		letterSpacingPx: 0,
	}),
	h8Serif: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 15,
		fontWeight: 400,
		lineHeightPercent: 120,
		letterSpacingPx: 0,
	}),

	// Headings Sans (placeholder: geist — replace with project sans font)
	h1Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 154,
		fontWeight: 600,
		lineHeightPercent: 100,
		letterSpacingPx: -7.7,
	}),
	h2Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 98,
		fontWeight: 600,
		lineHeightPercent: 100,
		letterSpacingPx: -4.9,
	}),
	h3Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 80,
		fontWeight: 600,
		lineHeightPercent: 100,
		letterSpacingPx: -4,
	}),
	h4Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 70,
		fontWeight: 600,
		lineHeightPercent: 100,
		letterSpacingPx: -3.5,
	}),
	h5Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 50,
		fontWeight: 600,
		lineHeightPercent: 100,
		letterSpacingPx: -2.5,
	}),
	h6Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 40,
		fontWeight: 600,
		lineHeightPercent: 100,
		letterSpacingPx: -2,
	}),
	h7Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 40,
		fontWeight: 400,
		lineHeightPercent: 120,
		letterSpacingPx: -0.4,
	}),
	h8Sans: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 32,
		fontWeight: 600,
		lineHeightPercent: 120,
		letterSpacingPx: -1.6,
	}),

	// Paragraphs
	p1: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 18,
		fontWeight: 500,
		lineHeightPercent: 150,
		letterSpacingPx: -0.18,
	}),
	p2: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 14,
		fontWeight: 500,
		lineHeightPercent: 150,
		letterSpacingPx: -0.14,
	}),
	p3: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 12,
		fontWeight: 500,
		lineHeightPercent: 150,
		letterSpacingPx: -0.12,
	}),
	p4: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 11,
		fontWeight: 500,
		lineHeightPercent: 150,
		letterSpacingPx: -0.11,
	}),
	p5: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 10,
		fontWeight: 400,
		lineHeightPercent: 150,
		letterSpacingPx: -0.11,
	}),

	// Kicker Text
	kicker1: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 18,
		fontWeight: 600,
		lineHeightPercent: 120,
		letterSpacingPx: -0.9,
	}),
	kicker2: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 13,
		fontWeight: 600,
		lineHeightPercent: 120,
		letterSpacingPx: -0.65,
	}),

	// Links
	link1: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 14,
		fontWeight: 600,
		lineHeightPercent: 130,
		letterSpacingPx: -0.14,
	}),
	link2: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 13,
		fontWeight: 600,
		lineHeightPercent: 150,
		letterSpacingPx: -0.13,
	}),
	link3: createStyle({
		fontFamily: geist,
		fontMetrics: sampleMetrics,
		fontSizePx: 11,
		fontWeight: 600,
		lineHeightPercent: 150,
		letterSpacingPx: -0.11,
	}),
}

// ---------------------------------------------------------------------------
// Blog Template 1 — semantic text style mappings
// Replace these values with project-specific fonts/sizes when adopting.
// ---------------------------------------------------------------------------
const blog1TextStyles = {
	h2Serif: textStyles.h2Serif,
	h4Sans: textStyles.h4Sans,
	h4Serif: textStyles.h4Serif,
	h5Sans: textStyles.h5Sans,
	h7Serif: textStyles.h7Serif,
	h8Sans: textStyles.h8Sans,
	h8Serif: textStyles.h8Serif,
	kicker1: textStyles.kicker1,
	kicker2: textStyles.kicker2,
	link1: textStyles.link1,
	link2: textStyles.link2,
	link3: textStyles.link3,
	p1: textStyles.p1,
	p2: textStyles.p2,
	p3: textStyles.p3,
}

export default { ...textStyles, blog1: blog1TextStyles }
