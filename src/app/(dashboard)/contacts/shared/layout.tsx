import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shared with Me",
}

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
