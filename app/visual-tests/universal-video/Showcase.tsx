"use client"

import textStyles from "app/styles/text"
import { useScrollLock } from "library/Scroll"
import { css, f, styled } from "library/styled"

import "./consoleCapture"

import type { CaseMap } from "./types"

import { EventLogProvider } from "./EventLog"
import { Extras, EXTRA_NAV } from "./Extras"
import { Sandbox } from "./Sandbox"

const SHOW_EXTRAS = false

export function Showcase({ cases }: { cases: CaseMap }) {
	useScrollLock("unlock", true)

	return (
		<EventLogProvider>
			<Page>
				<Intro>
					<Title>UniversalVideo showcase</Title>
				</Intro>
				{SHOW_EXTRAS ? (
					<Bar>
						<NavLinks>
							<Divider>Extras</Divider>
							{EXTRA_NAV.map((item) => (
								<a key={item.id} href={`#${item.id}`}>
									{item.label}
								</a>
							))}
						</NavLinks>
					</Bar>
				) : null}
				<Sandbox cases={cases} />
				{SHOW_EXTRAS ? (
					<>
						<GroupTitle>Extras</GroupTitle>
						<Extras cases={cases} />
					</>
				) : null}
			</Page>
		</EventLogProvider>
	)
}

const Page = styled("div", [
	f.responsive(css`
		grid-column: main;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: calc(var(--site-header-height, 100px) + 16px) 0 48px;
	`),
])

const Intro = styled("header", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px 24px;
	`),
])

const Bar = styled("nav", [
	f.responsive(css`
		position: sticky;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 8px 12px;
		border: 1px solid rgb(128 128 128 / 40%);
		border-radius: 8px;
		background: Canvas;
		color: CanvasText;
	`),
	f.unresponsive(css`
		top: calc(var(--site-header-height, 100px) + 8px);
	`),
	f.small(css`
		position: static;
		flex-direction: column;
		align-items: flex-start;
	`),
])

const NavLinks = styled("div", [
	f.responsive(css`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 14px;

		& a {
			text-decoration: underline;
		}
	`),
])

const Divider = styled("span", [
	f.responsive(css`
		${textStyles.kicker2}
		opacity: 0.6;
		text-transform: uppercase;
	`),
])

const Title = styled("h1", [
	f.responsive(css`
		${textStyles.h8Sans}
	`),
])

const GroupTitle = styled("h2", [
	f.responsive(css`
		${textStyles.h8Sans}
		padding-top: 48px;
	`),
])
