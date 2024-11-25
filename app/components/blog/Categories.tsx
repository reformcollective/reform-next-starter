import UniversalLink from "library/Loader/UniversalLink"
import { useQueryState } from "nuqs"
import styled from "styled-components"
import { sanityFetch } from "sanity/lib/fetch"
import { categoryQuery } from "sanity/lib/queries"
import type { PostQueryResult } from "@/sanity.types"

export function Categories({ data }: { data: PostQueryResult[] }) {
	const [, setCategory] = useQueryState("category")

	//   const categories = await sanityFetch({ query: categoryQuery });

	console.log(data)

	return (
		<Wrapper>
			<h1>Categories</h1>
			{/* {categories.allContentfulUnifiedTemplateBlogArticle.items.map((item) => {
        return (
          <Button
            type="button"
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </Button>
        );
      })} */}
		</Wrapper>
	)
}

const Wrapper = styled.div`
	display: flex;
	gap: 8px;
`

const Button = styled.button``
