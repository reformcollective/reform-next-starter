"use client"

import type { CaseMap } from "./types"

import { CarouselDemo } from "./Carousel"
import { CompatPairs } from "./Compat"
import { Concurrency } from "./Concurrency"
import { CustomControlsExamples } from "./CustomControls"
import { ExampleFrame } from "./Frame"
import { MuxPosterCompare } from "./MuxPosterCompare"
import { SafariHiddenDemo } from "./SafariHidden"
import { LazySection } from "./Section"
import { Triggers } from "./Triggers"

export const EXTRA_NAV = [
	{ id: "extra-poster-time", label: "Poster time" },
	{ id: "extra-carousel", label: "Carousel" },
	{ id: "extra-safari", label: "Safari hidden" },
	{ id: "extra-concurrency", label: "Concurrency" },
	{ id: "extra-triggers", label: "Triggers" },
	{ id: "extra-compat", label: "Compat wrappers" },
	{ id: "extra-custom-controls", label: "Custom controls" },
]

/** Secondary scenarios that are not tied to one provider. Each mounts only near the viewport. */
export function Extras({ cases }: { cases: CaseMap }) {
	const carousel = cases["carousel-clone"]
	const safari = cases["safari-hidden"]
	const concurrency = cases["trigger-inview"]

	return (
		<>
			<LazySection
				id="extra-poster-time"
				title="Poster time comparison (poster only)"
				note="Mux thumbnail frames by posterTime. Nothing plays here; it only compares the poster frames."
			>
				<MuxPosterCompare />
			</LazySection>
			<LazySection
				id="extra-carousel"
				title="Carousel with cloned slides"
				note="Twelve slides clone one playback ID; the concurrency cap holds and offscreen clones load nothing."
			>
				{carousel ? (
					<CarouselDemo testCase={carousel} />
				) : (
					<ExampleFrame title="carousel-clone" missingKey="carousel-clone" />
				)}
			</LazySection>
			<LazySection
				id="extra-safari"
				title="Safari hidden video"
				note="Hide the video with display, visibility or an offscreen transform; it must paint again within a second."
			>
				{safari ? (
					<SafariHiddenDemo testCase={safari} />
				) : (
					<ExampleFrame title="safari-hidden" missingKey="safari-hidden" />
				)}
			</LazySection>
			<LazySection
				id="extra-concurrency"
				title="Concurrency (maxConcurrent)"
				note="A small set of autoplay tiles under a low maxConcurrent cap."
			>
				{concurrency ? (
					<Concurrency testCase={concurrency} />
				) : (
					<ExampleFrame title="concurrency" missingKey="trigger-inview" />
				)}
			</LazySection>
			<LazySection
				id="extra-triggers"
				title="Triggers"
				note="Built-in inView, a GSAP ScrollTrigger and a useVideo hook, one at a time."
			>
				<Triggers cases={cases} />
			</LazySection>
			<LazySection
				id="extra-compat"
				title="Compat wrappers"
				note="The old library/videos components beside their UniversalVideo equivalents, with the events each receives."
			>
				<CompatPairs cases={cases} />
			</LazySection>
			<LazySection
				id="extra-custom-controls"
				title="Custom controls via children"
				note="Parts assembled by hand inside UniversalVideo, and useVideo from a sibling child."
			>
				<CustomControlsExamples cases={cases} />
			</LazySection>
		</>
	)
}
