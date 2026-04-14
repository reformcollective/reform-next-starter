"use client"

import Userback from "@userback/widget"
import gsap, { ScrollTrigger } from "gsap/all"
import { browserData, isBrowser } from "library/deviceDetection"
import { PageTransitionProvider } from "library/link/usePageTransition"
import { ResetStyles } from "library/reset"
import { ScreenProvider } from "library/ScreenContext"
import { SmoothScrollStyle } from "library/Scroll"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ProjectStyles } from "styles/project"

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.defaults({
	// pinSpacing is bad for page loading, false is a better default
	pinSpacing: false,
})

/**
 * userback, only if the URL includes 'netlify' or 'vercel'
 */
if (
	isBrowser &&
	(window.location.href.includes("netlify") || window.location.href.includes("vercel"))
)
	void Userback("A-v0IzZWe1Wp6WdUZsgSwl1T41O")

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
	return (
		<NuqsAdapter>
			<ScreenProvider>
				<PageTransitionProvider>
					<SmoothScrollStyle allowNestedScroll />
					<ProjectStyles />
					<ResetStyles />

					{children}
				</PageTransitionProvider>
			</ScreenProvider>
		</NuqsAdapter>
	)
}

/**
 * we are proud of our work
 */
const d = (t: string) => t.replace(/(\d+)(\D)/g, (_, c: number, h: string) => h.repeat(c))
const logo =
	"%c▄3█23▀172█▄553 4█26 69█4▀97█553 4█7 ▄5█▌14 14█15 █15 ▌14 3█12 3█15 █7 5█6 56█553 4█5 8█▌14 14█5 5#5 ▐6 9▀▌6 8▀█6 4▄6 █5 5#5 ▐9 █8 56█553 4█3 10█▌14 14█15 █15 ▌14 ▌6 4█6 █15 █18 56█553 4█2 ▐10█▌14 14█5 4█5 ╙█6 9▀▌6 10█14 2█5 4█5 ╟█5 ▐▄4 ▄▌5 56█553 4█2 11█▌14 14█5▄5█5▄█15▄▌6▄12█3▄4 3▄4█5▄5█5▄█6▄2█2▄2█6▄56█553 4█2 11█▌14 168█553 4█3 10█▌14 17█2▀7 2▀6█2▀7 2▀4█6 8█6 8█15 3█2▀7 2▀3█▌15 ▌5 █5 6█▀4 ║▌14 4█553 4█4 9█▌14 14█▌14 ╙2█15 2█6 8█6 8█6 9▄█15 ╟▌15 ▌5 █▌5 4█▀5 █▌5 9▄4█553 4█5 ▀7█▌14 14█6 5█5▄╫6 5█6 █6 8█6 8█14 ▐▌6 5█5▄5█6 5█▌5 2█▌5 2█▀5 2█▌14 4█553 4█8 ▀4█▌14 14█6 5▀5 █6 5▀5 2█13 █13 ▐6 9▀▌6 5▀5 5█6 5█▌5 3█▌5 ▀5 3█▌5 9▀4█553 4█28 15█▄12 ▄4█▄11 ▄3█13 █13 ▐15 2█▄12 ▄6█6 5█▌5 4█▌9 4█▌14 4█553 ▀198█▀"

if (isBrowser)
	console.info(
		d(logo),
		`font-family:monospace;display:inline-block;background:black;color:#eee;${
			browserData.isSafari
				? "font-size:5px"
				: "font-size:3px;padding:20px;border-radius:20px;margin:10px"
		}`,
	)
else
	console.info(
		`%c
            Designed & Developed by Reform Collective\n
                  https://reformcollective.com\n\n`,
		"",
	)
