"use client"

import { usePreloader } from "library/link/usePreloader"
import { css, f, styled } from "library/styled"

import { eases } from "library/eases"
import { useRef } from "react"
import colors from "styles/colors"

export function Preloader() {
	const preloaderLogo = useRef<HTMLDivElement>(null)

	const { completed, ready, devKey } = usePreloader({
		minDuration: 1700,
		scope: preloaderLogo,
		stopNoWaitAnimations: ".svg",
		stopAnimations: ".wait",
	})

	// const hide = ready ? { opacity: 0 } : {}
	// const moveRight = ready
	// 	? {
	// 			transform: "translateX(37%)",
	// 			opacity: 0,
	// 			"--opacity-delay": "0.75s",
	// 			"--opacity-duration": "0.05s",
	// 		}
	// 	: {}
	// const moveLeft = ready
	// 	? {
	// 			transform: "translateX(-25%)",
	// 			opacity: 0,
	// 			"--opacity-delay": "0.75s",
	// 			"--opacity-duration": "0.05s",
	// 		}
	// 	: {}

	return (
		<Wrapper ready={ready} completed={completed} key={devKey}>
			Preloader Logo
		</Wrapper>
	)
}

const Wrapper = styled(
	"div",
	({ ready, completed }: { ready: boolean; completed: boolean }) => ({
		...f.responsive(css`
			position: fixed;
			inset: 0;
			z-index: 999;
			display: grid;
			place-items: center;
			translate: 0 ${ready ? "50%" : 0};
			transition:
				translate 1.05s 0.79s ${eases.cubic.out},
				opacity 0.5s ease-in-out;
			opacity: ${completed ? 0 : 1};
			pointer-events: ${completed ? "none" : "auto"};

			&::before,
			&::after {
				content: "";
				position: absolute;
				left: 0;
				width: 100%;
				background: ${colors.red};
				z-index: -1;
				transition: translate 1.05s 0.79s ${eases.cubic.out};
			}

			&::before {
				top: 0;
				height: 50%;
				translate: 0 ${ready ? "-200%" : 0};
			}

			&::after {
				top: 50%;
				height: 100%;
			}
		`),
	}),
)
