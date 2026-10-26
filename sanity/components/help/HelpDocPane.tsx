import { Box, Card, Container, Flex, Heading, Stack, Text } from "@sanity/ui"
import { Fragment, type ReactNode } from "react"

import { helpDocs, type HelpBlock } from "./helpDocs"

type Props = {
	options?: {
		docId?: unknown
	}
}

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`)/g

function renderInline(text: string): ReactNode {
	return text
		.split(INLINE_PATTERN)
		.filter(Boolean)
		.map((part, position) => {
			const key = `${position}-${part}`
			if (part.startsWith("**") && part.endsWith("**")) {
				return <strong key={key}>{part.slice(2, -2)}</strong>
			}
			if (part.startsWith("`") && part.endsWith("`")) {
				return (
					<code key={key} className="studio-code">
						{part.slice(1, -1)}
					</code>
				)
			}
			return <Fragment key={key}>{part}</Fragment>
		})
}

function renderList(items: string[], marker: (index: number) => string) {
	return (
		<Stack space={4}>
			{items.map((item, index) => (
				<Flex key={index} gap={3} align="flex-start">
					<Box flex="none" paddingTop={1}>
						<Text size={1} weight="semibold" muted>
							{marker(index)}
						</Text>
					</Box>
					<Box flex={1}>
						<Text size={2}>{renderInline(item)}</Text>
					</Box>
				</Flex>
			))}
		</Stack>
	)
}

function renderTable(columns: string[], rows: string[][]) {
	const flex = (column: number) => (column === 0 ? 1 : 2)

	return (
		<Card border radius={2} overflow="hidden">
			<Card tone="transparent" padding={3} borderBottom>
				<Flex gap={4}>
					{columns.map((column, position) => (
						<Box key={position} flex={flex(position)}>
							<Text size={1} weight="semibold" muted>
								{column}
							</Text>
						</Box>
					))}
				</Flex>
			</Card>
			{rows.map((row, rowPosition) => (
				<Card key={rowPosition} padding={3} borderTop={rowPosition > 0}>
					<Flex gap={4} align="flex-start">
						{row.map((cell, position) => (
							<Box key={position} flex={flex(position)}>
								<Text size={2}>{renderInline(cell)}</Text>
							</Box>
						))}
					</Flex>
				</Card>
			))}
		</Card>
	)
}

function renderBlock(block: HelpBlock) {
	switch (block.type) {
		case "h2":
			return (
				<Box paddingTop={5}>
					<Heading as="h2" size={3}>
						{block.text}
					</Heading>
				</Box>
			)
		case "h3":
			return (
				<Box paddingTop={3}>
					<Heading as="h3" size={2}>
						{block.text}
					</Heading>
				</Box>
			)
		case "p":
			return <Text size={2}>{renderInline(block.text)}</Text>
		case "note":
			return (
				<Card tone="primary" border radius={2} padding={3}>
					<Text size={2}>{renderInline(block.text)}</Text>
				</Card>
			)
		case "ul":
			return renderList(block.items, () => "•")
		case "ol":
			return renderList(block.items, (index) => `${index + 1}.`)
		case "table":
			return renderTable(block.columns, block.rows)
	}
}

export default function HelpDocPane({ options }: Props) {
	const doc = helpDocs.find((item) => item.id === options?.docId)

	if (!doc) {
		return (
			<Box padding={5}>
				<Text size={2}>This help page could not be found.</Text>
			</Box>
		)
	}

	return (
		<Box padding={5} paddingBottom={7}>
			<Container width={1} marginLeft={0}>
				<Stack space={5}>
					{doc.blocks.map((block, position) => (
						<Fragment key={position}>{renderBlock(block)}</Fragment>
					))}
				</Stack>
			</Container>
		</Box>
	)
}
