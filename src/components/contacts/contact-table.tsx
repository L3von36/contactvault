"use client"

import { Star, MoreHorizontal, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Mock Data (Moved to a shared location in a real app)
export const MOCK_CONTACTS = [
  {
    id: "1",
    first_name: "Sarah",
    last_name: "Connor",
    phones: [{ label: "Mobile", number: "+1 (555) 0123-4567" }],
    emails: [{ label: "Work", address: "sarah@skynet.com" }],
    company: "Cyberdyne Systems",
    address: "Los Angeles, CA",
    is_favorite: true,
  },
  {
    id: "2",
    first_name: "John",
    last_name: "Smith",
    phones: [{ label: "Mobile", number: "+1 (555) 9876-5432" }],
    emails: [{ label: "Personal", address: "john.smith@gmail.com" }],
    company: "Acme Corp",
    is_favorite: false,
  },
  {
    id: "3",
    first_name: "Emily",
    last_name: "Chen",
    phones: [{ label: "Work", number: "+1 (555) 555-0199" }],
    emails: [{ label: "Work", address: "emily@techstart.io" }],
    company: "TechStart",
    address: "San Francisco, CA",
    is_favorite: true,
  },
  {
    id: "4",
    first_name: "Michael",
    last_name: "Scott",
    phones: [{ label: "Work", number: "+1 (570) 555-0123" }],
    emails: [{ label: "Work", address: "michael.scott@dundermifflin.com" }],
    company: "Dunder Mifflin",
    address: "Scranton, PA",
    is_favorite: false,
  },
  {
    id: "5",
    first_name: "Jessica",
    last_name: "Jones",
    phones: [{ label: "Mobile", number: "+1 (555) 000-0000" }],
    emails: [{ label: "Personal", address: "jessica@alias.com" }],
    company: "Alias Investigations",
    address: "New York, NY",
    is_favorite: false,
  },
]

import { useSearchParams } from "next/navigation"

interface ContactTableProps {
  contacts?: typeof MOCK_CONTACTS
}

export function ContactTable({ contacts = MOCK_CONTACTS }: ContactTableProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get("q")?.toLowerCase() || ""

  const filteredContacts = contacts.filter((contact) => {
    if (!query) return true
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase()
    return fullName.includes(query) || 
           contact.company?.toLowerCase().includes(query) ||
           contact.emails?.[0]?.address.toLowerCase().includes(query)
  })

  return (
    <div className="w-full space-y-4">
      {/* List Header / Filter Bar */}
      <div className="flex items-center justify-between rounded-xl bg-card p-2 shadow-sm border border-border/50 mb-6">
         <div className="flex items-center gap-1">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm">
              All Contacts ({filteredContacts.length})
            </button>
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              New (2)
            </button>
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Qualified (2)
            </button>
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Contacted (2)
            </button>
         </div>
         <div className="px-4">
             <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Filters
             </button>
         </div>
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-4">
        {filteredContacts.map((contact) => (
          <div 
            key={contact.id} 
            className="group relative flex flex-col items-start gap-6 rounded-2xl bg-card p-6 shadow-sm border border-border/50 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-all duration-300"
          >
            {/* Left: Avatar & Name */}
            <div className="flex items-center gap-5 min-w-[300px]">
               <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
                  {contact.first_name[0]}{contact.last_name?.[0]}
               </div>
               <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {contact.company ? (
                      <span className="flex items-center gap-2">
                         {contact.company}
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground/60">No Company</span>
                    )}
                  </p>
               </div>
            </div>

            {/* Middle: Contact Info */}
            <div className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-8">
               <div className="flex items-center gap-2 min-w-[200px]">
                  <span className="text-muted-foreground/70">@</span>
                  <span className="truncate max-w-[180px]">{contact.emails?.[0]?.address || "No Email"}</span>
               </div>
               <div className="flex items-center gap-2 min-w-[150px]">
                   <span className="text-muted-foreground/70">#</span>
                   <span>{contact.phones?.[0]?.number || "No Phone"}</span>
               </div>
               <div className="flex items-center gap-2">
                   <span className="text-muted-foreground/70">Loc</span>
                   <span>{contact.address || "San Francisco, CA"}</span>
               </div>
            </div>

            {/* Right: Tags & Actions */}
            <div className="flex items-center gap-6">
                {/* Mock Tags */}
                {contact.is_favorite ? (
                   <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Qualified</span>
                ) : (
                   <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">Contacted</span>
                )}
                
                <div className="text-right hidden xl:block">
                   <p className="text-xs text-muted-foreground">Deal Value</p>
                   <p className="text-sm font-bold text-green-600">$85K</p>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const link = `https://contactvault.io/share/${contact.id}-${Math.random().toString(36).substr(2, 9)}`
                        navigator.clipboard.writeText(link)
                        toast.success("Share link copied to clipboard!")
                      }}
                      className="rounded-full p-2 text-muted-foreground/50 hover:bg-blue-50 hover:text-blue-500 transition-all"
                      title="Generate Share Link"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button 
                      className={cn(
                        "rounded-full p-2 transition-all hover:bg-yellow-100",
                        contact.is_favorite ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-500"
                      )}
                    >
                      <Star className={cn("h-5 w-5", contact.is_favorite && "fill-current")} />
                    </button>
                    <button className="rounded-full p-2 text-muted-foreground/50 hover:bg-slate-100 hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
