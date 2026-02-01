"use client"

import { ContactCard } from "./contact-card"

export function ContactList({ contacts = [] }: ContactListProps) {
  const displayContacts = contacts

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      {displayContacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  )
}
