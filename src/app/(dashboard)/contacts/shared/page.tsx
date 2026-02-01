"use client"

import { useState } from "react"
import { Share2, Clock, Trash2, ExternalLink, Shield, Loader2, Globe } from "lucide-react"
import { EmptyState } from "@/components/contacts/empty-state"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { revokeSharedLink } from "@/lib/supabase/shared-actions"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

async function getSharedLinks() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: sharedLinks, error } = await supabase
    .from("shared_links")
    .select(`
      *,
      contact:contacts(*)
    `)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching shared links:", error)
    return []
  }

  return sharedLinks || []
}

export default function SharedContactsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"outgoing" | "incoming">("outgoing")
  
  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ['shared-links'],
    queryFn: getSharedLinks,
  })

  const { data: importedContacts = [], isLoading: importedLoading } = useQuery({
    queryKey: ['imported-contacts'],
    queryFn: async () => {
       const supabase = createClient()
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) return []
       const { data } = await supabase
         .from("contacts")
         .select("*")
         .ilike("notes", "%Saved from shared link%")
         .eq("user_id", user.id)
       return data || []
    },
    enabled: activeTab === "incoming"
  })

  const isLoading = activeTab === "outgoing" ? linksLoading : importedLoading

  const revokeMutation = useMutation({
    mutationFn: (token: string) => revokeSharedLink(token),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Access revoked successfully")
        queryClient.invalidateQueries({ queryKey: ['shared-links'] })
      } else {
        toast.error(res.error || "Failed to revoke access")
      }
    },
  })

  const handleRevoke = (token: string) => {
    if (confirm("Are you sure you want to revoke this access link? Anyone with the link will lose access immediately.")) {
      revokeMutation.mutate(token)
    }
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Access Control Center</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-none mt-1">
                {isLoading ? "Synchronizing..." : activeTab === "outgoing" ? `${links.length} Active Protocols` : `${importedContacts.length} Resources Imported`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-border/50 w-fit">
          <button
            onClick={() => setActiveTab("outgoing")}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "outgoing" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Shared Links
          </button>
          <button
            onClick={() => setActiveTab("incoming")}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "incoming" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Saved to Vault
          </button>
        </div>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-3xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : activeTab === "outgoing" ? (
          links.length === 0 ? (
            <EmptyState 
              icon={Shield}
              title="No Active Shares"
              description="Your vault is currently sealed. Any contacts you share through the protocol will appear here for management."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {links.map((link: any) => (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-sm font-black text-foreground">
                              {link.contact?.first_name?.[0]}{link.contact?.last_name?.[0] || ''}
                           </div>
                           <div>
                              <p className="text-sm font-black text-foreground truncate max-w-[120px]">
                                {link.contact?.first_name} {link.contact?.last_name}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Contact Resource</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => copyLink(link.id)}
                           className="h-8 w-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                        >
                           <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-border/30">
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="text-[10px] font-medium">
                              {link.expires_at ? `Exp: ${new Date(link.expires_at).toLocaleDateString()}` : 'Permanent'}
                            </span>
                         </div>
                         <button 
                          onClick={() => handleRevoke(link.id)}
                          disabled={revokeMutation.isPending}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                         >
                           {revokeMutation.isPending && revokeMutation.variables === link.id ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                             <Trash2 className="h-4 w-4" />
                           )}
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        ) : (
          importedContacts.length === 0 ? (
            <EmptyState 
              icon={Globe}
              title="No Imported Contacts"
              description="Contacts you save from public sharing links will appear here for quick access."
            />
          ) : (
             <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {importedContacts.map((contact: any) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-card border border-border/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary">
                          {contact.first_name?.[0]}{contact.last_name?.[0] || ''}
                       </div>
                       <div>
                          <p className="text-sm font-black text-foreground">{contact.first_name} {contact.last_name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Imported Resource</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          )
        )}
      </div>
    </div>
  )
}
