/// <reference types="next" />

declare module "*.png" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.jpg" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.jpeg" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.gif" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.webp" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.avif" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.ico" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.bmp" {
	const content: import("next/image").StaticImageData

	export default content
}

declare module "*.inline.svg" {
	import type { FC, SVGProps } from "react"
	const content: FC<SVGProps<SVGElement>>
	export default content
}

declare module "*.mp4" {
	const content: string
	export default content
}

declare module "*.svg" {
	const content: import("next/image").StaticImageData
	export default content
}

declare module "*.webm" {
	const content: string
	export default content
}
