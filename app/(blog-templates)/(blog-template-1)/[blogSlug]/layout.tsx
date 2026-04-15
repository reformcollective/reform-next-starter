import { makeResponsiveGrid } from "library/layoutGridBuilder"
import { css, f, styled } from "library/styled/alpha"
import { desktopDesignSize, mobileDesignSize } from "app/styles/media"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <BlogRoot>{children}</BlogRoot>
}

const BlogRoot = styled("div", [
	f.responsive(css`
		grid-column: fullbleed;
		display: grid;
		grid-template-columns: var(--subgrid-columns);
		--subgrid-columns: ${makeResponsiveGrid({
			columnCount: 8,
			gutter: "14px",
			margin: "12px",
			sourceDesignWidth: desktopDesignSize,
		})};
	`),
	f.small(css`
		--subgrid-columns: ${makeResponsiveGrid({
			columnCount: 2,
			gutter: "14px",
			margin: "8px",
			sourceDesignWidth: mobileDesignSize,
		})};
	`),
])
