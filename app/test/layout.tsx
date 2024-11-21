import "../globals.css";

import { Inter } from "next/font/google";
import { fresponsive, styled, css } from "../library/styled";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={inter.variable}>
			<body className="min-h-screen">{children}</body>
		</html>
	);
}
