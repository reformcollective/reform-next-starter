"use client"

import type { HeaderQueryResult } from "sanity.types"

import { colors } from "app/styles/colors.css"
import { css, f, neverResponsive, styled } from "library/styled"
import useAutoHideHeader from "library/useAutoHideHeader"
import useSectionTheme, { useHeaderMode } from "library/useSectionTheme"
import { useRef } from "react"

export default function Header({ headerText }: NonNullable<HeaderQueryResult>) {
	const wrapperRef = useRef<HTMLDivElement>(null)

	// both hooks share the ref: useAutoHideHeader writes data-header-scrolled and
	// --site-header-height onto it, useSectionTheme measures it to place its observer strip
	useAutoHideHeader(wrapperRef)
	useSectionTheme(wrapperRef)
	const mode = useHeaderMode()

	return (
		<Wrapper ref={wrapperRef} data-mode={mode}>
			<Background />
			<Inner>
				<div>Header</div>
				<p>{headerText}</p>
			</Inner>
		</Wrapper>
	)
}

/**
 * fixed rather than sticky, so sections pass *behind* the header — that's what makes
 * `data-header-mode` ("which section is behind the header") and the backdrop blur mean
 * something. the `grid-row: header` track in the page grid collapses as a result, so the
 * first section on each page sits underneath this bar.
 */
const Wrapper = styled("header", [
	f.responsive(css`
		position: fixed;
		top: 0;
		left: 50%;
		width: 100vw;
		transform: translateX(-50%);

		/* re-declare the page grid so Inner can sit on the main column */
		display: grid;
		grid-template-columns: var(--subgrid-columns);
		grid-column: fullbleed;
		grid-row: header;
		view-transition-name: header;
		z-index: 1000;
		transition: backdrop-filter 0.3s ease-out;
		${neverResponsive(css`
			backdrop-filter: blur(0);
		`)}

		&[data-header-scrolled="true"] {
			${neverResponsive(css`
				backdrop-filter: blur(12px);
			`)}
		}
	`),
])

/**
 * the painted surface, kept as its own layer so it can fade independently of the content.
 * hidden at the top of the page and faded in once useAutoHideHeader reports we've scrolled
 * past its threshold.
 */
const Background = styled("div", [
	f.responsive(css`
		grid-column: 1 / -1;
		grid-row: 1 / -1;
		position: absolute;
		inset: 0;
		z-index: 1;
		opacity: 0;
		border-bottom: 1px solid transparent;
		transition:
			opacity 0.3s ease-out,
			background 0.3s ease-out,
			border-color 0.3s ease-out;

		[data-mode="light"] & {
			background: linear-gradient(
				180deg,
				${colors.surfaceLight} 50%,
				color-mix(in srgb, ${colors.surfaceLight} 72%, transparent) 100%
			);
			border-color: color-mix(in srgb, ${colors.surfaceDark} 6%, transparent);
		}

		[data-mode="dark"] & {
			background: linear-gradient(
				180deg,
				${colors.surfaceDark} 50%,
				color-mix(in srgb, ${colors.surfaceDark} 72%, transparent) 100%
			);
			border-color: color-mix(in srgb, ${colors.surfaceLight} 10%, transparent);
		}

		[data-header-scrolled="true"] & {
			opacity: 1;
		}
	`),
])

const Inner = styled("div", [
	f.responsive(css`
		grid-column: main;
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		width: 100%;
		height: 100px;
		transition: color 0.3s ease-out;

		[data-mode="light"] & {
			color: ${colors.surfaceDark};
		}

		[data-mode="dark"] & {
			color: ${colors.surfaceLight};
		}
	`),
])
