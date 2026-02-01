"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ContactList } from "@/components/contacts/contact-list"
import { ContactForm } from "@/components/contacts/contact-form"
import { Plus, Filter } from "lucide-react"
import { FilterTabs } from "@/components/contacts/filter-tabs"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getContacts, createContact } from "@/lib/supabase/contact-actions"
import { EmptyState } from "@/components/contacts/empty-state"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"


export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="h-20 w-full rounded-2xl bg-secondary/50 animate-pulse" />}>
      <ContactsContent />
    </Suspense>
  )
}

function ContactsContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', { q, activeTab }],
    queryFn: () => getContacts({ query: q, tab: activeTab }),
  })

  const contacts = data?.contacts || []
  const counts = data?.counts || { all: 0, new: 0, qualified: 0, contacted: 0 }

  const createMutation = useMutation({
    mutationFn: (data: any) => createContact(data),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Contact created!")
        setIsCreating(false)
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
      }
    },
    onError: (error) => {
      toast.error("An unexpected error occurred")
    }
  })

  useEffect(() => {
    if (isCreating) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isCreating])

  const tabs = [
    { id: "all", label: "All Contacts", count: (counts as any).all },
    { id: "new", label: "New", count: (counts as any).new },
    { id: "qualified", label: "Qualified", count: (counts as any).qualified },
    { id: "contacted", label: "Contacted", count: (counts as any).contacted },
  ]

  const handleCreate = async (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Contact created successfully!")
      },
      onError: () => {
        toast.error("Failed to create contact")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Contacts</h1>
          <p className="text-xs text-muted-foreground font-medium">
            {isLoading ? "Querying..." : `${contacts.length} entries identified`}
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Individual
        </button>
      </div>

      <FilterTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        layoutId="contactsTabPill"
        rightElement={
          <button className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl text-xs font-bold transition-all">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        }
      />

      <div className="pb-10">
        {isLoading ? (
          <div className="flex flex-col gap-3">
             {[1, 2, 3].map(i => (
                <div key={i} className="h-20 w-full rounded-2xl bg-secondary/30 animate-pulse" />
             ))}
          </div>
        ) : contacts.length > 0 ? (
          <ContactList contacts={contacts} />
        ) : (
          <EmptyState 
            title={q ? "No matches found" : "No contacts yet"} 
            description={q ? `We couldn't find any contacts matching "${q}".` : "Your vault is empty. Add your first contact manually or import them from a CSV/VCF file."}
            onAddClick={() => setIsCreating(true)}
          />
        )}
      </div>

      {/* Premium Centered Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop with enhanced blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md" 
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-background rounded-3xl shadow-2xl border border-border/40 z-10 custom-scrollbar"
            >
              <ContactForm 
                onCancel={() => setIsCreating(false)} 
                onSubmit={handleCreate}
                isSubmitting={createMutation.isPending}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
