"use client"

import { css, fresponsive, styled } from "library/styled/alpha"
import useAutoHideHeader from "library/useAutoHideHeader"
import { useRef } from "react"
import type { HeaderQueryResult } from "sanity.types"

export default function Header({ headerText }: NonNullable<HeaderQueryResult>) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  useAutoHideHeader(wrapperRef)

  return (
    <Wrapper ref={wrapperRef}>
      <div>Header</div>
      <p>{headerText}</p>
    </Wrapper>
  )
}

const Wrapper = styled(
  "header",
  fresponsive(css`
    display: grid;
    grid-column: fullbleed;
    grid-row: header;
    place-items: center;
    position: sticky;
    top: 0;
    width: 100%;
    height: 100px;
    background-color: rebeccapurple;
    color: white;
    view-transition-name: header;
  `),
)
