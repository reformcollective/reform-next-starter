import Image from "next/image"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          alt="Next.js logo"
          className={styles.logo}
          height={20}
          priority
          src="/next.svg"
          width={100}
        />
        <div className={styles.intro}>
          <h1>To get started, edit the page.tsx file.</h1>
          <p>
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              rel="noopener noreferrer"
              target="_blank"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              rel="noopener noreferrer"
              target="_blank"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="Vercel logomark"
              className={styles.logo}
              height={16}
              src="/vercel.svg"
              width={16}
            />
            Deploy Now
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  )
}
