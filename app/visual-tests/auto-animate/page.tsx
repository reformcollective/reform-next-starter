"use client"

import AutoAnimate from "library/AutoAnimate"
import UniversalLink from "library/link"
import { css, fresponsive, styled } from "library/styled"
import { type ComponentProps, Fragment, useEffect, useState } from "react"

const BaseWrapper = styled(
	AutoAnimate,
	fresponsive(css`
		outline: 1px solid red;
	`),
)

function Animate(
	props: Omit<ComponentProps<typeof BaseWrapper>, "duration" | "skipFirstAnimation">,
) {
	return <BaseWrapper duration={3} skipFirstAnimation={false} {...props} />
}

const OpacityWrapper = styled(
	AutoAnimate,
	fresponsive(css`
		outline: 1px solid green;
	`),
)

function OpacityAnimate(
	props: Omit<
		ComponentProps<typeof OpacityWrapper>,
		"duration" | "skipFirstAnimation" | "parameters"
	>,
) {
	return (
		<OpacityWrapper
			duration={3}
			skipFirstAnimation={false}
			parameters={{ yPercent: undefined, opacity: 0 }}
			{...props}
		/>
	)
}

export default function AutoTests() {
	const [flipper, setFlipper] = useState(false)

	useEffect(() => {
		const interval = setTimeout(() => {
			setFlipper(!flipper)
		}, 4000)

		return () => clearTimeout(interval)
	}, [flipper])

	const [shortFlipper, setShortFlipper] = useState(false)

	useEffect(() => {
		const interval = setTimeout(() => {
			setShortFlipper(!shortFlipper)
		}, 200)

		return () => clearTimeout(interval)
	}, [shortFlipper])

	return (
		<Wrapper>
			<h1>AutoAnimate Tests</h1>
			<UniversalLink href="/">go home</UniversalLink>
			<h2>standard</h2>
			<Animate alignment="start">{flipper ? "start" : "antidisestablishmentarianism"}</Animate>
			<Animate alignment="center">{flipper ? "center" : "antidisestablishmentarianism"}</Animate>
			<Animate alignment="end">{flipper ? "end" : "antidisestablishmentarianism"}</Animate>
			<h2>tall</h2>
			<Row>
				<Animate alignment="start">
					{flipper ? (
						<Fragment key="a">start</Fragment>
					) : (
						<Tall key="b">antidisestablishmentarianism</Tall>
					)}
				</Animate>
				<Animate alignment="center">
					{flipper ? (
						<Fragment key="c">center</Fragment>
					) : (
						<Tall key="d">antidisestablishmentarianism</Tall>
					)}
				</Animate>
				<Animate alignment="end">
					{flipper ? (
						<Fragment key="e">end</Fragment>
					) : (
						<Tall key="f">antidisestablishmentarianism</Tall>
					)}
				</Animate>
			</Row>
			<h2>tall w/opacity</h2>
			<Row>
				<OpacityAnimate alignment="start">
					{flipper ? (
						<PurpleBox key="a">start</PurpleBox>
					) : (
						<Tall key="b">antidisestablishmentarianism</Tall>
					)}
				</OpacityAnimate>
				<OpacityAnimate alignment="center">
					{flipper ? (
						<PurpleBox key="c">center</PurpleBox>
					) : (
						<Tall key="d">antidisestablishmentarianism</Tall>
					)}
				</OpacityAnimate>
				<OpacityAnimate alignment="end">
					{flipper ? (
						<PurpleBox key="e">end</PurpleBox>
					) : (
						<Tall key="f">antidisestablishmentarianism</Tall>
					)}
				</OpacityAnimate>
			</Row>
			<h2>dynamic content</h2>
			{/* the sizing during the animation doesn't really matter here, as long as the
				height is dynamic when not animating */}
			<Row>
				<Animate>
					{flipper ? (
						"short"
					) : (
						<div key="a">
							<div>two</div>
							{shortFlipper && <div>lines</div>}
						</div>
					)}
				</Animate>
				<Animate>
					{flipper ? (
						"short"
					) : (
						<div key="a">
							<div>now</div>
							<div>3</div>
							{shortFlipper && <div>lines</div>}
						</div>
					)}
				</Animate>
			</Row>
			<h2>text wrapping</h2>
			<Animate>{flipper ? "short" : "long text that will not wrap!"}</Animate>
			<h2>restrict width</h2>
			<RestrictWidth>
				<Animate>
					{flipper
						? "long text that will wrap but only in one place and only because of the (new line!) restricted width that is put in place on this element!"
						: "long text that will not wrap!"}
				</Animate>
			</RestrictWidth>

			<h2>fixed size</h2>
			<FixedArea>
				<FillAnimate fill>
					<Filler key={flipper ? "a" : "b"}>
						<FillImage
							alt=""
							src={flipper ? "https://picsum.photos/1920/1080" : "https://picsum.photos/1080/1920"}
						/>
					</Filler>
				</FillAnimate>
			</FixedArea>

			<h2>width change</h2>
			<Animate
				parameters={{ yPercent: undefined }}
				toParameters={{ xPercent: 100 }}
				fromParameters={{ xPercent: -100 }}
			>
				<NonFillImage
					alt=""
					key={flipper ? "a" : "b"}
					style={{ height: 400 }}
					src={flipper ? "https://picsum.photos/1920/1080" : "https://picsum.photos/1080/1920"}
				/>
			</Animate>
			<Animate
				parameters={{ yPercent: undefined }}
				toParameters={{ xPercent: 100 }}
				fromParameters={{ xPercent: -100 }}
				alignment="center"
			>
				<NonFillImage
					alt=""
					style={{ height: 400 }}
					key={flipper ? "a" : "b"}
					src={flipper ? "https://picsum.photos/1920/1080" : "https://picsum.photos/1080/1920"}
				/>
			</Animate>
			<Animate
				parameters={{ yPercent: undefined }}
				toParameters={{ xPercent: 100 }}
				fromParameters={{ xPercent: -100 }}
				alignment="end"
			>
				<NonFillImage
					alt=""
					style={{ height: 400 }}
					key={flipper ? "a" : "b"}
					src={flipper ? "https://picsum.photos/1920/1080" : "https://picsum.photos/1080/1920"}
				/>
			</Animate>
			<h2>height change</h2>
			<Row>
				<div style={{ width: 400 }}>
					<Animate>
						<NonFillImage
							alt=""
							key={flipper ? "a" : "b"}
							src={flipper ? "https://picsum.photos/1920/1080" : "https://picsum.photos/1080/1920"}
						/>
					</Animate>
				</div>
				<div style={{ width: 400 }}>
					<Animate alignment="center">
						<NonFillImage
							alt=""
							key={flipper ? "a" : "b"}
							src={flipper ? "https://picsum.photos/1920/1080" : "https://picsum.photos/1080/1920"}
						/>
					</Animate>
				</div>
				<div style={{ width: 400 }}>
					<Animate alignment="end">
						<NonFillImage
							alt=""
							key={flipper ? "a" : "b"}
							src={flipper ? "https://picsum.photos/1920/1080" : "https://picsum.photos/1080/1920"}
						/>
					</Animate>
				</div>
			</Row>
		</Wrapper>
	)
}

const RestrictWidth = styled(
	"div",
	fresponsive(css`
		max-width: 500px;
		border: 1px solid orange;
	`),
)

const Wrapper = styled(
	"div",
	fresponsive(css`
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 40px;
		padding: 100px;
		grid-column: main;
	`),
)

const Row = styled(
	"div",
	fresponsive(css`
		display: flex;
		min-height: 200px;
		gap: 40px;
		align-items: start;
	`),
)

const Tall = styled(
	"div",
	fresponsive(css`
		height: 200px;
		border: 1px solid blue;
	`),
)

const PurpleBox = styled(
	"div",
	fresponsive(css`
		border: 1px solid purple;
	`),
)

const FixedArea = styled(
	"div",
	fresponsive(css`
		width: 500px;
		height: 500px;
		background: purple;
	`),
)

const FillAnimate = styled(
	Animate,
	fresponsive(css`
		width: 100%;
		height: 100%;
	`),
)

const Filler = styled(
	"div",
	fresponsive(css`
		width: 100%;
		height: 100%;
		border: 10px solid yellow;
	`),
)

const FillImage = styled("img", [
	fresponsive(css`
		width: 100%;
		height: 100%;
		aspect-ratio: unset;
	`),
])

const NonFillImage = styled(
	"img",
	fresponsive(css`
		border: 10px solid green;
		opacity: 0.8;
	`),
)
