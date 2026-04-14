"use client"

import { createContext, useContext, useEffect, useState } from "react"

type HeaderTheme = "light" | "dark"

const HeaderThemeContext = createContext<{
	theme: HeaderTheme
	setTheme: (theme: HeaderTheme) => void
}>({
	theme: "light",
	setTheme: () => undefined,
})

export function HeaderThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<HeaderTheme>("light")
	return (
		<HeaderThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</HeaderThemeContext.Provider>
	)
}

/**
 * Use `"dark"` if the page has a dark background behind the header on initial load.
 * The header will automatically revert to dark colors once the frosted glass appears.
 */
export function useHeaderTheme(theme: HeaderTheme) {
	const { setTheme } = useContext(HeaderThemeContext)
	useEffect(() => {
		setTheme(theme)
		return () => setTheme("light")
	}, [theme, setTheme])
}

export function useHeaderThemeValue() {
	return useContext(HeaderThemeContext).theme
}
