import UniversalLink from "library/Loader/UniversalLink"
import { css, fresponsive, styled } from "library/styled"

export default function Footer() {
	return (
		<Wrapper data-header-hide>
			<Content>
				<h1>Footer</h1>
				<p>The header is hidden while the Footer is in view</p>
			</Content>
			<UniversalLink href="/">Home</UniversalLink>
		</Wrapper>
	)
}

const Wrapper = styled(
	"footer",
	fresponsive(css`
		background-color: rebeccapurple;
		color: white;
		display: grid;
		place-items: center;
		height: 300px;
	`),
)

const Content = styled(
	"div",
	fresponsive(css`
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 10px;
	`),
)
