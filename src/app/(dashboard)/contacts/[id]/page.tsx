"use client"

import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Mail, 
  Phone as PhoneIcon, 
  MapPin, 
  Building2, 
  Star, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Share2,
  Calendar,
  MessageSquare,
  Globe,
  Tag,
  Hash
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect } from "react"
import { getContact, toggleFavorite, deleteContact, updateContact } from "@/lib/supabase/contact-actions"
import { toast } from "sonner"
import { ContactForm } from "@/components/contacts/contact-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ShareSheet } from "@/components/contacts/share-sheet"

export default function ContactDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContact(id as string),
    enabled: !!id,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const favoriteMutation = useMutation({
    mutationFn: (newStatus: boolean) => toggleFavorite(contact.id, newStatus),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['contacts', id] })
      const previousContact = queryClient.getQueryData(['contacts', id])
      queryClient.setQueryData(['contacts', id], (old: any) => ({
        ...old,
        is_favorite: newStatus,
      }))
      return { previousContact }
    },
    onError: (err, newStatus, context) => {
      queryClient.setQueryData(['contacts', id], context?.previousContact)
      toast.error("Failed to update favorite status")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', id] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateContact(contact.id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Contact updated")
        setIsEditing(false)
        queryClient.invalidateQueries({ queryKey: ['contacts', id] })
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
      } else {
        toast.error(res.error || "Failed to update contact")
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteContact(contact.id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Contact deleted")
        router.push("/contacts")
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
      }
    },
  })

  const handleToggleFavorite = () => {
    favoriteMutation.mutate(!contact.is_favorite)
  }

  const handleUpdate = (data: any) => {
    updateMutation.mutate(data)
  }

  const handleShare = () => {
    setIsSharing(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-20 w-20 rounded-[2rem] bg-secondary animate-pulse" />
        <div className="h-4 w-48 bg-secondary animate-pulse rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Navigation & Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="group flex items-center px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-950 transition-colors -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Contacts
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="group inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-100 bg-white text-xs font-bold text-slate-600 shadow-sm hover:border-primary/20 transition-all"
          >
            <motion.div whileHover={{ scale: 1.1, rotate: -10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Share2 className="mr-2 h-4 w-4" />
            </motion.div>
            Share
          </button>
          <button 
            onClick={() => setIsEditing(true)}
            className="group inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-100 bg-white text-xs font-bold text-slate-600 shadow-sm hover:border-primary/20 transition-all"
          >
            <motion.div whileHover={{ scale: 1.1, x: 1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Edit2 className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
            </motion.div>
            Edit
          </button>
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to delete this contact?")) {
                deleteMutation.mutate()
              }
            }}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center p-2 rounded-xl border border-red-50 bg-white text-red-500 shadow-sm hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Trash2 className="h-4 w-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Hero Section Card */}
      <div className="relative rounded-[2.5rem] bg-white border border-slate-100 p-8 sm:p-12 shadow-xl shadow-blue-500/5 overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          {/* Large Avatar */}
          <div className="h-32 w-32 rounded-[2.5rem] bg-blue-50 flex items-center justify-center text-4xl font-black text-primary border-4 border-white shadow-lg shadow-blue-100">
             {contact.first_name?.[0] || '?'}{contact.last_name?.[0] || ''}
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {contact.first_name} {contact.last_name || ''}
                </h1>
                <button 
                  onClick={handleToggleFavorite}
                  className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-primary transition-all hover:border-primary/20 hover:shadow-md"
                >
                   <Star className={cn("h-5 w-5", contact.is_favorite && "fill-primary text-primary")} />
                </button>
              </div>
              {(contact.job_title || contact.company) && (
                <p className="text-xl font-medium text-slate-500 flex items-center justify-center md:justify-start gap-2">
                  <Building2 className="h-5 w-5 text-slate-300" />
                  {contact.job_title ? (
                    <>
                      {contact.job_title} {contact.company && `at `}
                      <span className="text-slate-900">{contact.company}</span>
                    </>
                  ) : (
                    <span className="text-slate-900">{contact.company}</span>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className={cn(
                "rounded-full px-4 py-1 font-extrabold uppercase tracking-wider text-[10px] border",
                contact.status === 'qualified' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                contact.status === 'contacted' ? "bg-blue-50 text-blue-600 border-blue-100" : 
                "bg-slate-50 text-slate-500 border-slate-100"
              )}>
                 {contact.status?.toUpperCase() || 'NEW'}
              </span>
              
              {contact.groups?.map((groupName: string) => (
                <span 
                  key={groupName} 
                  className="rounded-full px-4 py-1 bg-primary/5 text-primary border border-primary/20 font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1.5 shadow-sm"
                >
                  <Hash className="h-3 w-3" />
                  {groupName}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[160px]">
             <a 
               href={`tel:${contact.phones[0].number}`}
               className="flex items-center justify-center gap-2 h-12 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all"
             >
               <PhoneIcon className="h-4 w-4 fill-current" />
               Call Now
             </a>
             <a 
               href={`sms:${contact.phones[0].number}`}
               className="flex items-center justify-center gap-2 h-12 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-950 hover:scale-[1.02] active:scale-95 transition-all"
             >
               <MessageSquare className="h-4 w-4 fill-current" />
               Send Message
             </a>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Contact Info */}
        <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              Contact Information
            </h2>
            <div className="grid gap-8">
              {/* Emails */}
              {contact.emails && contact.emails.length > 0 && contact.emails.some((e: any) => e.address) && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Addresses</p>
                  {contact.emails.filter((e: any) => e.address).map((email: any, i: number) => (
                    <motion.div 
                      key={`email-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-primary transition-all duration-300">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">{email.label}</p>
                        <a href={`mailto:${email.address}`} className="font-medium text-slate-800 hover:text-primary transition-colors">{email.address}</a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Phones */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Numbers</p>
                {contact.phones?.map((phone: any, i: number) => (
                  <motion.div 
                    key={`phone-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (contact.emails?.length || 0) * 0.05 + i * 0.05 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-primary transition-all duration-300">
                      <PhoneIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">{phone.label}</p>
                      <a href={`tel:${phone.number}`} className="font-medium text-slate-800 hover:text-primary transition-colors">{phone.number}</a>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Address */}
              {contact.address && (
                <div className="space-y-4 pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</p>
                   <div className="flex items-center gap-4 group">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-slate-800">{contact.address}</p>
                   </div>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Notes</h2>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-slate-600 leading-relaxed italic">
               "{contact.notes}"
            </div>
          </section>
        </div>

        {/* Right Column: Metadata & Activity */}
        <div className="space-y-8">
           <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Details</h2>
             <div className="space-y-6">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-medium">Added</span>
                   <span className="text-slate-900 font-bold">{new Date(contact.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-medium">Status</span>
                   <span className="rounded-full px-3 py-0.5 border border-primary/10 bg-primary/5 text-primary font-bold text-[10px] uppercase">{contact.status || 'NEW'}</span>
                </div>
             </div>
           </section>

           <section className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700"></div>
              <div className="relative z-10 space-y-4">
                 <motion.div 
                   className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"
                   whileHover={{ rotate: 360 }}
                   transition={{ duration: 0.8, ease: "easeInOut" }}
                 >
                    <Globe className="h-5 w-5 text-primary" />
                 </motion.div>
                 <h3 className="font-bold">Social Profiles</h3>
                 <p className="text-xs text-slate-400">Sync with LinkedIn or Twitter to get latest updates from Sarah.</p>
                 <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors p-0 bg-transparent border-0 cursor-pointer group flex items-center gap-1">
                   Connect Account 
                   <motion.span
                     animate={{ x: [0, 5, 0] }}
                     transition={{ repeat: Infinity, duration: 1.5 }}
                   >
                     →
                   </motion.span>
                 </button>
              </div>
           </section>
        </div>
      </div>
      {/* Premium Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-background rounded-3xl shadow-2xl border border-border/40 z-10 custom-scrollbar"
            >
              <ContactForm 
                onCancel={() => setIsEditing(false)} 
                onSubmit={handleUpdate} 
                initialData={contact}
                isSubmitting={updateMutation.isPending}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSharing && (
          <ShareSheet 
            resourceId={contact.id} 
            resourceType="contact" 
            onClose={() => setIsSharing(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
