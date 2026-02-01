"use client"

import { Phone, Mail, MoreVertical, Heart, MapPin, Building2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

import Link from "next/link"
import { motion } from "framer-motion"
import { Ripple } from "@/components/effects/ripple"
import { toggleFavorite } from "@/lib/supabase/contact-actions"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface ContactCardProps {
  contact: {
    id: string
    first_name: string
    last_name: string
    phones: any[]
    emails: any[]
    company?: string
    address?: string
    profile_picture_url?: string
    is_favorite?: boolean
    relationships?: string[]
  }
}

export function ContactCard({ contact: initialContact }: ContactCardProps) {
  const queryClient = useQueryClient()
  const [contact, setContact] = useState(initialContact)
  
  useEffect(() => {
    setContact(initialContact)
  }, [initialContact])

  const primaryPhone = contact.phones?.[0]?.number
  const primaryEmail = contact.emails?.[0]?.address

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newStatus = !contact.is_favorite
    setContact({ ...contact, is_favorite: newStatus }) // Optimistic update
    
    const res = await toggleFavorite(contact.id, newStatus)
    if (!res.success) {
      setContact({ ...contact, is_favorite: !newStatus }) // Rollback
      toast.error("Failed to update favorite status")
    } else {
      toast.success(newStatus ? "Added to favorites" : "Removed from favorites")
      // Invalidate both the general list and the specific favorites tab
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  }

  return (
    <div 
      className="group relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-[2rem] border border-border bg-card p-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 overflow-hidden"
    >
      <Link 
        href={`/contacts/${contact.id}`} 
        className="absolute inset-0 z-10"
        aria-label={`View ${contact.first_name} ${contact.last_name}`}
      />
      <Ripple>
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full relative">
          {/* Top Section / Header Section */}
          <div className="flex items-center justify-between sm:justify-start gap-4 min-w-0 sm:min-w-[200px]">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-[1.25rem] bg-primary/10 text-sm sm:text-base font-bold text-primary shadow-sm border border-primary/10">
                {contact.profile_picture_url ? (
                  <img src={contact.profile_picture_url} alt="" className="h-full w-full rounded-xl sm:rounded-[1.25rem] object-cover" />
                ) : (
                  `${contact.first_name?.[0] || '?'}${contact.last_name?.[0] || ''}`
                )}
                {contact.is_favorite && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                    <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm sm:text-base font-bold text-foreground">
                  {contact.first_name} {contact.last_name || ''}
                </h3>
                {contact.company && (
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{contact.company}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {contact.relationships?.map((rel: string) => (
                    <span 
                      key={rel} 
                      className="inline-flex items-center rounded-md bg-primary/5 px-1.5 py-0.5 text-[8px] font-bold text-primary border border-primary/10"
                    >
                      {rel}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Quick Actions */}
            <div className="flex sm:hidden items-center gap-1.5 relative z-20">
              {primaryPhone && (
                <a 
                  href={`tel:${primaryPhone}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md shadow-blue-100 active:scale-90 transition-all cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Phone className="h-3.5 w-3.5 fill-current" />
                  </motion.div>
                </a>
              )}
              <button 
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-90 cursor-pointer",
                  contact.is_favorite 
                    ? "bg-red-50 border-red-100 text-red-500 shadow-sm" 
                    : "bg-secondary border-border text-muted-foreground"
                )}
                onClick={handleToggleFavorite}
              >
                <Heart className={cn("h-4.5 w-4.5", contact.is_favorite && "fill-red-500")} />
              </button>
            </div>
          </div>

          {/* Middle Section: Contact Details */}
          <div className="grid grid-cols-1 sm:flex flex-1 items-center gap-3 sm:gap-8 min-w-0 py-1 sm:py-0 border-t border-slate-50 sm:border-0 mt-1 sm:mt-0 pt-3 sm:pt-0">
            {/* Email */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-[10px] sm:text-xs font-medium text-muted-foreground sm:text-foreground/70">
                {primaryEmail || "No email"}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-[10px] sm:text-xs font-medium text-muted-foreground sm:text-foreground/70">
                {primaryPhone || "No phone"}
              </span>
            </div>
          </div>

          {/* Quick Actions (Desktop Specific) */}
          <div className="hidden sm:flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
            {primaryPhone && (
              <>
                <a 
                  href={`tel:${primaryPhone}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all active:scale-90 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Phone className="h-4 w-4 fill-current" />
                  </motion.div>
                </a>
                <a 
                  href={`sms:${primaryPhone}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 dark:bg-slate-700 text-white shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-900 transition-all active:scale-90 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <MessageSquare className="h-4 w-4 fill-current" />
                  </motion.div>
                </a>
              </>
            )}
            <button 
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/20 transition-all active:scale-90 cursor-pointer"
              onClick={handleToggleFavorite}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart className={cn("h-4 w-4", contact.is_favorite && "fill-red-500 text-red-500")} />
              </motion.div>
            </button>
            <button 
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all active:scale-90 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Ripple>
    </div>
  )
}
