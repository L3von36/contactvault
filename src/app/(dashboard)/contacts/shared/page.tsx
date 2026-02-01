"use client"

import { useState, useEffect } from "react"
import { ContactList } from "@/components/contacts/contact-list"
import { Share2, ExternalLink } from "lucide-react"
import { EmptyState } from "@/components/contacts/empty-state"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

async function getSharedContacts() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get all shared links created by this user for contacts
  const { data: sharedLinks } = await supabase
    .from("shared_links")
    .select("resource_id, expires_at, created_at")
    .eq("owner_id", user.id)
    .eq("resource_type", "contact")
    .order("created_at", { ascending: false })

  if (!sharedLinks || sharedLinks.length === 0) return []

  // Get the actual contacts
  const contactIds = sharedLinks.map(link => link.resource_id)
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .in("id", contactIds)

  // Add share metadata to contacts
  const contactsWithShareInfo = contacts?.map(contact => {
    const shareLink = sharedLinks.find(link => link.resource_id === contact.id)
    return {
      ...contact,
      shared_at: shareLink?.created_at,
      expires_at: shareLink?.expires_at
    }
  }) || []

  return contactsWithShareInfo
}

export default function SharedContactsPage() {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['shared-contacts'],
    queryFn: getSharedContacts,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Shared Contacts</h1>
              <p className="text-sm text-muted-foreground font-medium">
                {isLoading ? "Loading..." : `${contacts.length} ${contacts.length === 1 ? 'contact' : 'contacts'} shared`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState 
            icon={Share2}
            title="No Shared Contacts"
            description="Contacts you share via public links will appear here. Open any contact and click the share button to create a shareable link."
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contacts.map((contact: any) => (
                <div key={contact.id} className="relative">
                  <ContactList 
                    contacts={[contact]} 
                    emptyMessage=""
                  />
                  {contact.expires_at && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-1.5 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-3 py-1.5">
                        <ExternalLink className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                          Shared
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
