"use client"

import Portal from "library/Portal"
import { NextStudio } from "next-sanity/studio"
import config from "sanity.config"
import "./style.css"

export default function StudioPage() {
  return (
    <Portal>
      <NextStudio config={config} />
    </Portal>
  )
}
