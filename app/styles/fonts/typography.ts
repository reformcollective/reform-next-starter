import localFont from "next/font/local"

export const roboto = localFont({
	adjustFontFallback: "Arial",
	variable: "--font-roboto",
	display: "swap",
	src: [
		{
			path: "./Roboto-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./Roboto-Italic.woff2",
			weight: "400",
			style: "italic",
		},
		{
			path: "./Roboto-Bold.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "./Roboto-BoldItalic.woff2",
			weight: "700",
			style: "italic",
		},
	],
})

/*

using the font would look something like:

add it to your layout:
<body class={roboto.variable}>

and use it in your css:
font-family: var(--font-roboto);

*/
