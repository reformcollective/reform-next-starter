import { listStaticRoutes } from "library/list-pages"

import { testPrefix, VisualTestsList } from "./VisualTestsList"

export default function VisualTestsPage() {
	const tests = listStaticRoutes().filter((route) => route.startsWith(testPrefix))

	return <VisualTestsList tests={tests} />
}
