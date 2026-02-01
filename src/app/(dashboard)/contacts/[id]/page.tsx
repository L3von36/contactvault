import { getContact } from "@/lib/supabase/contact-actions"
import ContactDetailsClient from "./contact-detail-client"
import { Metadata } from "next"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = (await params).id
  const contact = await getContact(id)
  
  if (!contact) {
    return {
      title: "Contact Not Found",
    }
  }

  return {
    title: `${contact.first_name} ${contact.last_name || ""}`,
  }
}

export default function ContactDetailsPage() {
  return <ContactDetailsClient />
}
