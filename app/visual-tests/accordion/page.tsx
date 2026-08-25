import type { FaqItem } from "sanity.types"

import FAQAccordion from "app/components/Accordion"
import UniversalLink from "library/link"
import { css, f, styled } from "library/styled"

/**
 * hardcoded FAQ content covering every mark `faqItem()` enables by default, so the
 * accordion can be checked without authoring anything in Sanity.
 *
 * the point of the second item is that `app/components/Accordion` overrides only
 * `block.normal` — bold, italic, lists and links all still render, through the
 * defaults in `library/sanity/PortableText`.
 */
const items: (FaqItem & { _key: string })[] = [
	{
		_type: "faqItem",
		_key: "plain",
		question: "Does a plain answer still render normally?",
		answer: [
			{
				_type: "block",
				_key: "p1",
				style: "normal",
				markDefs: [],
				children: [
					{
						_type: "span",
						_key: "p1s1",
						text: "Yes. This is a single unstyled paragraph.",
						marks: [],
					},
				],
			},
		],
	},
	{
		_type: "faqItem",
		_key: "rich",
		question: "What about bold, italic, lists and links?",
		answer: [
			{
				_type: "block",
				_key: "r1",
				style: "normal",
				markDefs: [],
				children: [
					{ _type: "span", _key: "r1s1", text: "This paragraph has ", marks: [] },
					{ _type: "span", _key: "r1s2", text: "bold text", marks: ["strong"] },
					{ _type: "span", _key: "r1s3", text: " and ", marks: [] },
					{ _type: "span", _key: "r1s4", text: "italic text", marks: ["em"] },
					{ _type: "span", _key: "r1s5", text: " in it.", marks: [] },
				],
			},
			{
				_type: "block",
				_key: "r2",
				style: "normal",
				listItem: "bullet",
				level: 1,
				markDefs: [],
				children: [{ _type: "span", _key: "r2s1", text: "A bulleted item", marks: [] }],
			},
			{
				_type: "block",
				_key: "r3",
				style: "normal",
				listItem: "bullet",
				level: 1,
				markDefs: [],
				children: [{ _type: "span", _key: "r3s1", text: "A second bulleted item", marks: [] }],
			},
			{
				_type: "block",
				_key: "r4",
				style: "normal",
				listItem: "number",
				level: 1,
				markDefs: [],
				children: [{ _type: "span", _key: "r4s1", text: "A numbered step", marks: [] }],
			},
			{
				_type: "block",
				_key: "r5",
				style: "normal",
				listItem: "number",
				level: 1,
				markDefs: [],
				children: [{ _type: "span", _key: "r5s1", text: "A second numbered step", marks: [] }],
			},
			{
				_type: "block",
				_key: "r6",
				style: "normal",
				markDefs: [{ _type: "link", _key: "lnk", href: "https://example.com" }],
				children: [
					{ _type: "span", _key: "r6s1", text: "And a closing paragraph with ", marks: [] },
					{ _type: "span", _key: "r6s2", text: "a link", marks: ["lnk"] },
					{ _type: "span", _key: "r6s3", text: " in it.", marks: [] },
				],
			},
		],
	},
]

export default function AccordionTests() {
	return (
		<>
			<Nav>
				<h1>Accordion Tests</h1>
				<UniversalLink href="/visual-tests">← visual tests</UniversalLink>
				<Note>
					open the second item. <strong>bold</strong>, <em>italic</em>, bulleted and numbered lists,
					and the link should all render and match the surrounding paragraph styles — even though{" "}
					<code>app/components/Accordion</code> only overrides <code>block.normal</code>.
				</Note>
				<Note>
					list items are the thing worth staring at: they render through portable text&rsquo;s{" "}
					<code>listItem</code> component, which the <code>block.normal</code> override does not
					reach, so they are styled by the <code>ul, ol</code> rule in <code>AnswerWrapper</code>.
					that rule sits on the list rather than the <code>li</code> on purpose — the text styles
					are capsize-generated, and their trim pseudo-elements knock every bullet and number out of
					line when applied to a list item directly.
				</Note>
			</Nav>
			<Stage>
				<FAQAccordion items={items} />
			</Stage>
		</>
	)
}

/**
 * the root layout is itself a grid (`PageRoot` in `app/layout.tsx`), so anything
 * rendered straight into it is a grid item and needs to claim its columns — without
 * `grid-column` these auto-place into one narrow column each, side by side
 */
const Nav = styled("div", [
	f.unresponsive(css`
		grid-column: main;
		display: grid;
		gap: 12px;
		padding: 40px;
		background: whitesmoke;
	`),
])

const Note = styled("p", [
	f.unresponsive(css`
		max-width: 70ch;
		margin: 0;
		line-height: 1.5;
	`),
])

/** 800px is roughly what `FaqColumn` resolves to in the real section at design width */
const Stage = styled("div", [
	f.unresponsive(css`
		grid-column: main;
		padding: 40px;
		max-width: 800px;
	`),
])
