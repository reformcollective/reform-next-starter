"use client"

import nativeSmoothPin from "library/nativeSmoothPin"
import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled/alpha"

const sizeOrder: Array<"square" | "100vh" | "120vh"> = ["square", "100vh", "120vh"]
const topOrder: Array<"zero" | "neg" | "pos"> = ["zero", "neg", "pos"]

const sizeLabel: Record<(typeof sizeOrder)[number], string> = {
	square: "square",
	"100vh": "100vh",
	"120vh": "120vh",
}
const topLabel: Record<(typeof topOrder)[number], string> = {
	zero: "top: 0",
	neg: "top: -100px",
	pos: "top: 100px",
}

const topStr: Record<(typeof topOrder)[number], string> = {
	zero: "0",
	neg: "-100px",
	pos: "100px",
}

export default function StickyVisualTestPage() {
	return (
		<Wrapper>
			<h1>Sticky behavior test</h1>
			<UniversalLink href="/visual-tests">← visual tests</UniversalLink>

			{topOrder.flatMap((top, topIdx) =>
				sizeOrder.map((size, sizeIdx) => {
					const base = topIdx * 9 + sizeIdx * 3
					const label = `${sizeLabel[size]} · ${topLabel[top]}`
					return (
						<Group key={`${top}-${size}`}>
							<GroupLabel>{label}</GroupLabel>
							<Row>
								<StickyColumn>
									<StickyElement size={size} top={top} goopType="start">
										{String(base + 1)}
									</StickyElement>
								</StickyColumn>
								<StickyColumn>
									<StickyElement size={size} top={top} goopType="end">
										{String(base + 2)}
									</StickyElement>
								</StickyColumn>
								<StickyColumn>
									<StickyElement size={size} top={top} goopType="both">
										{String(base + 3)}
									</StickyElement>
								</StickyColumn>
							</Row>
						</Group>
					)
				}),
			)}
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	fresponsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		gap: 32px;
		padding: 24px;
	`),
)

const Group = styled(
	"div",
	fresponsive(css`
		display: flex;
		flex-direction: column;
		gap: 8px;
	`),
)

const GroupLabel = styled(
	"div",
	fresponsive(css`
		font-size: 0.875rem;
		font-weight: 600;
		color: #444;
	`),
)

const Row = styled(
	"div",
	fresponsive(css`
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 16px;
	`),
)

const StickyColumn = styled(
	"div",
	fresponsive(css`
		height: 200vh;
		display: flex;
		flex-direction: column;
		outline: 1px solid #888;
		background: #f5f5f5;
		border-radius: 8px;
		padding: 12px;
	`),
)

const StickyElement = styled("div", {
	base: [
		fresponsive(css`
			position: sticky;
			padding: 16px;
			background: #e0e0ff;
			border: 2px solid #666;
			border-radius: 6px;
			font-weight: 600;
			font-size: 1.25rem;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
		`),
	],
	variants: {
		size: {
			square: [{ width: "100%", aspectRatio: "1" }],
			"100vh": [{ height: "100vh" }],
			"120vh": [{ height: "120vh" }],
		},
		top: {
			zero: [],
			neg: [],
			pos: [],
		},
		goopType: {
			start: [],
			end: [],
			both: [],
		},
	},
	defaultVariants: { size: "square", top: "zero" },
	compoundVariants: topOrder.flatMap((top) =>
		(["start", "end", "both"] as const).map((goopType) => ({
			top,
			goopType,
			base: [
				fresponsive(css`
          ${
						top === "neg"
							? css`
									*:has(> &) {
										border: 2px solid red;
										container-type: size;
									}
								`
							: ""
					}

          ${nativeSmoothPin({
						top: topStr[top],
						goopType,
						containerAware: top === "neg",
					})}
        `),
			],
		})),
	),
})
