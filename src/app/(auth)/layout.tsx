import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In a real app, we check session here. 
  // For now, since we don't have keys, we skip the server-side check 
  // to prevent build errors or crashes.
  
  /*
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }
  */

  return <>{children}</>
}
