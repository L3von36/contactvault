import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Emergency Settings",
}

export default function EmergencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
