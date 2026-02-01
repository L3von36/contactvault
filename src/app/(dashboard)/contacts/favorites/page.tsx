"use client"

import { useState, useEffect, Suspense } from "react"
import { ContactList } from "@/components/contacts/contact-list"
import { ContactForm } from "@/components/contacts/contact-form"
import { Plus, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getContacts, createContact } from "@/lib/supabase/contact-actions"
import { EmptyState } from "@/components/contacts/empty-state"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"


export default function FavoritesPage() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', { tab: 'favorites' }],
    queryFn: () => getContacts({ tab: 'favorites' }),
  })

  const contacts = data?.contacts || []
  const favoriteCount = data?.counts?.favorites || 0

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
    onError: () => {
      toast.error("Failed to create contact")
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Favorites</h1>
              <p className="text-sm text-muted-foreground font-medium">
                {isLoading ? "Loading..." : `${favoriteCount} favorite ${favoriteCount === 1 ? 'contact' : 'contacts'}`}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
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
            icon={Heart}
            title="No Favorite Contacts"
            description="Mark contacts as favorites by clicking the heart icon on their profile."
          />
        ) : (
          <ContactList 
            contacts={contacts} 
            emptyMessage="No favorite contacts found"
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
