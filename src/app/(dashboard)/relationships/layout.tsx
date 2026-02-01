import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Relationships",
}

export default function RelationshipsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
