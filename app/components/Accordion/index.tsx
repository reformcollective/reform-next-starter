"use client"

import type { FaqItem } from "sanity.types"

import { Accordion } from "@base-ui/react/accordion"
import { colors } from "app/styles/colors.css"
import textStyles from "app/styles/text"
import gsap from "gsap"
import { TypedPortableText } from "library/sanity/PortableText"
import { css, f, styled } from "library/styled"
import { useAnimation } from "library/useAnimation"
import { useMedia } from "library/useMedia"
import { type ReactNode, useRef } from "react"

import CaretStrokeSVG from "./caretStroke.inline.svg"

/** query results add `_key` to every array member */
type FaqEntry = FaqItem & { _key: string }

function AccordionItem({ item }: { item: FaqEntry }) {
	return (
		<ItemWrapper value={item._key}>
			<Header>
				<Trigger>
					<QuestionText>{item.question ?? ""}</QuestionText>
					<CaretWrapper>
						<Caret aria-hidden="true" />
					</CaretWrapper>
				</Trigger>
			</Header>
			<Panel>
				<PanelInner>
					<AnswerWrapper>
						{/*
						 * Answers support bold, italic, bulleted/numbered lists, and links.
						 *
						 * WHAT EDITORS CAN WRITE is set by `faqItem` in `library/sanity/reusables`,
						 * not here. To offer more (headings, blockquote, underline…) add it to the
						 * schema there — but trim before content is authored, since removing a mark
						 * later orphans documents that already used it.
						 *
						 * HOW IT LOOKS is already handled: every mark and list has a renderer in
						 * `library/sanity/PortableText`, styled in the `library` cascade layer. Project
						 * styles are unlayered and therefore win, so restyle by editing the plain CSS
						 * in `AnswerWrapper` below — no override needed.
						 *
						 * TO TAKE OVER A RENDERER, add it to `components` like `block.normal` below.
						 * Deleting an entry is safe: it falls back to the library default. Note that
						 * `list` and `listItem` require *both* `bullet` and `number` if you pass them
						 * at all, unlike `block`, whose keys are optional.
						 */}
						<TypedPortableText
							value={item.answer ?? []}
							components={{
								block: {
									normal: ({ children }: { children: ReactNode }) => <StyledP>{children}</StyledP>,
								},
							}}
						/>
					</AnswerWrapper>
				</PanelInner>
			</Panel>
		</ItemWrapper>
	)
}

/**
 * FAQ accordion, built on Base UI's `Accordion` from `@base-ui/react`.
 * {@link https://base-ui.com/react/components/accordion Base UI docs}
 *
 * The part structure is Base UI's, not ours — `Root > Item > (Header > Trigger) + Panel`
 * — and each part below is a `styled` wrapper around it, so Base UI's own props pass
 * through the wrapper to the part underneath.
 *
 * Open behavior is decided here rather than in Sanity, since it is a design decision
 * rather than content. Every knob is a prop on `Root`:
 *
 * - `multiple` — allow several panels open at once. Off by default, so opening an item
 *   collapses the previously open one.
 * - `defaultValue` — the `Item` values expanded on first render, uncontrolled. We pass
 *   the first entry's Sanity `_key`, which is what each `ItemWrapper` uses as its `value`.
 * - `value` + `onValueChange` — use instead of `defaultValue` to drive open state from
 *   outside, e.g. deep-linking to an answer or an "expand all" control.
 * - `keepMounted` / `hiddenUntilFound` — keep closed panels in the DOM. `hiddenUntilFound`
 *   additionally lets the browser's in-page search expand a closed answer, worth turning
 *   on if these answers should be findable with ⌘F.
 * - `disabled` — makes the accordion inert; also accepted on a single `Item`.
 *
 * `orientation` and `loopFocus` are deprecated upstream, following the APG guidance
 * update that removed roving focus, and no longer affect anything.
 *
 * Base UI also supplies the styling hooks the CSS below leans on: `data-open` on `Item`
 * and `Panel` (rotates the caret), and `--accordion-panel-height` alongside
 * `data-starting-style` / `data-ending-style` on `Panel` (animates the height).
 */
export default function FAQAccordion({ items }: { items?: FaqEntry[] | null }) {
	const rootRef = useRef<HTMLDivElement>(null)
	const isMobile = useMedia(false, false, true, true)
	const firstKey = items?.[0]?._key

	useAnimation(() => {
		if (isMobile || !rootRef.current) return
		const children = rootRef.current.children

		gsap.to(children, {
			y: 0,
			duration: 0.6,
			ease: "power1.out",
			stagger: 0.06,
			scrollTrigger: {
				trigger: rootRef.current,
				start: "top 90%",
			},
		})
	}, [isMobile])

	return (
		/* `defaultValue` matches on the `value` each ItemWrapper is given, so this expands
		 * the first item on load. see the JSDoc above for the other props on `Root`. */
		<Root ref={rootRef} defaultValue={firstKey ? [firstKey] : []}>
			{items?.map((item) => (
				<AccordionItem key={item._key} item={item} />
			))}
		</Root>
	)
}

const Root = styled(Accordion.Root, [
	f.responsive(css`
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 0;
	`),
])

const ItemWrapper = styled(Accordion.Item, [
	f.responsive(css`
		transform: translateY(130px);
		border-bottom: 1px solid ${colors.black};

		&:first-child {
			border-top: 1px solid ${colors.black};
		}
	`),
	f.small(css`
		transform: translateY(0);
	`),
])

const Header = styled(Accordion.Header, [
	f.responsive(css`
		margin: 0;
	`),
])

/**
 * the item's vertical padding lives here rather than on ItemWrapper so the whole
 * band is part of the button — clickable, and covered by the focus ring
 */
const Trigger = styled(Accordion.Trigger, [
	f.responsive(css`
		all: unset;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		width: 100%;
		padding: 32px 0;
		cursor: pointer;
		box-sizing: border-box;

		&:focus-visible {
			outline: 2px solid ${colors.black};
			outline-offset: 2px;
			border-radius: 4px;
		}
	`),
	f.small(css`
		padding: 20px 0;
	`),
])

const QuestionText = styled("span", [
	f.responsive(css`
		${textStyles.h3};
		color: ${colors.black};
		text-align: left;
	`),
])

const CaretWrapper = styled("span", [
	f.responsive(css`
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: ${colors.black};
		color: ${colors.white};
	`),
])

const Caret = styled(CaretStrokeSVG, [
	f.responsive(css`
		display: block;
		width: 10px;
		height: 6px;
		transition: transform 0.3s ease;
		transform: scaleY(-1);

		[data-open] & {
			transform: scaleY(1);
		}
	`),
])

const Panel = styled(Accordion.Panel, [
	f.responsive(css`
		overflow: hidden;
		height: var(--accordion-panel-height);
		transition: height 0.3s ease;

		&[data-starting-style] {
			height: 0;
		}

		&[data-ending-style] {
			height: 0;
		}
	`),
])

/**
 * the gap above the answer is the trigger's bottom padding, so this only needs to
 * restore the space between the answer and the item's bottom border
 */
const PanelInner = styled("div", [
	f.responsive(css`
		padding: 0 0 32px;
	`),
	f.small(css`
		padding: 0 0 20px;
	`),
])

/**
 * Every renderer `TypedPortableText` uses is styled in the `library` cascade layer,
 * so these unlayered project rules win without needing a `components` override.
 *
 * Delete whichever of these your design doesn't use — the elements fall back to the
 * library defaults (`<strong>` bold, `<ul>` disc, `<ol>` decimal, underlined links).
 */
const AnswerWrapper = styled("div", [
	f.responsive(css`
		width: 100%;
		max-width: 640px;

		a {
			color: inherit;
			text-decoration: underline;

			&:hover {
				text-decoration: none;
			}
		}

		strong {
			font-weight: 700;
		}

		em {
			font-style: italic;
		}

		/*
		 * list items render through the listItem component, which the block.normal
		 * override does not reach, so they need their own text styles here or they
		 * will not match the paragraphs around them.
		 *
		 * the text style goes on the list, not on the li, and the li inherits it.
		 * p1 is capsize-generated, so it carries ::before/::after trim pseudo-elements
		 * — on an li those become the first line box and the marker aligns to them
		 * instead of to the text, which floats every bullet and number above its item.
		 */
		ul,
		ol {
			${textStyles.p1};
			color: color-mix(in srgb, ${colors.black} 65%, ${colors.white});
			margin: 8px 0;
			padding-left: 24px;
		}

		li {
			padding: 3px 0;
		}
	`),
	f.small(css`
		ul,
		ol {
			${textStyles.p2};
		}
	`),
])

const StyledP = styled("p", [
	f.responsive(css`
		${textStyles.p1};
		color: color-mix(in srgb, ${colors.black} 65%, ${colors.white});
		padding: 3px 0;
	`),
	f.small(css`
		${textStyles.p2};
	`),
])
