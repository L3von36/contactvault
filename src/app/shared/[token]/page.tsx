"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getSharedResource, saveSharedContact } from "@/lib/supabase/shared-actions"
import { 
  Users, 
  Mail, 
  Phone as PhoneIcon, 
  MapPin, 
  Building2, 
  ShieldCheck,
  Loader2,
  AlertCircle,
  Hash
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function SharedResourcePage() {
  const { token } = useParams()
  const [isSaving, setIsSaving] = useState(false)

  const { data: user } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  const { data, isLoading } = useQuery({
    queryKey: ['shared', token],
    queryFn: () => getSharedResource(token as string),
    enabled: !!token,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10"
        >
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Decrypting Vault...</p>
      </div>
    )
  }

  if (data?.error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="h-20 w-20 rounded-3xl bg-red-50 flex items-center justify-center border border-red-100">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-foreground tracking-tight">Access Protocol Failed</h1>
          <p className="text-xs text-muted-foreground max-w-[240px] mx-auto font-medium leading-relaxed">
            This security token is invalid or has expired. Please request a new access link from the vault owner.
          </p>
        </div>
      </div>
    )
  }

  const { type, data: resource } = data as any

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Branding Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={32} 
                height={32} 
                className="object-cover opacity-80"
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">ContactVault</span>
          </div>

          {user && !isLoading && data && !data.error && (
            <button
              onClick={async () => {
                setIsSaving(true)
                const res = await saveSharedContact(token as string)
                if (res.success) {
                  toast.success("Contact saved to your vault!")
                } else {
                  toast.error(res.error || "Failed to save contact")
                }
                setIsSaving(false)
              }}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save to Vault"}
            </button>
          )}
        </div>

        {type === "contact" ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/40 rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden"
          >
            {/* Contact Profile Header */}
            <div className="p-8 sm:p-10 text-center space-y-5 border-b border-border/20 bg-primary/[0.02]">
              <div className="h-24 w-24 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto text-3xl font-black shadow-xl shadow-primary/20 border-4 border-background">
                {resource.first_name[0]}{resource.last_name?.[0]}
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  {resource.first_name} {resource.last_name}
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                    {resource.job_title || "Individual"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 space-y-10">
              {/* Communication Section */}
              {resource.phones?.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <PhoneIcon className="h-3 w-3" />
                    Communications
                  </p>
                  <div className="grid gap-3">
                    {resource.phones.map((p: any, i: number) => (
                      <div key={i} className="group p-4 rounded-2xl bg-secondary/30 border border-border/20 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{p.label}</span>
                        <a href={`tel:${p.number}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors">{p.number}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Channels Section */}
              {resource.emails?.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Digital Channels
                  </p>
                  <div className="grid gap-3">
                    {resource.emails.map((e: any, i: number) => (
                      <div key={i} className="group p-4 rounded-2xl bg-secondary/30 border border-border/20 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{e.label}</span>
                        <a href={`mailto:${e.address}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors lowercase tracking-tight">{e.address}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affiliations & Location */}
              {(resource.company || resource.address) && (
                <div className="space-y-4 pt-6 border-t border-border/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Context & Meta
                  </p>
                  <div className="grid gap-3">
                    {resource.company && (
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/20 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Company</span>
                        <span className="text-sm font-bold text-foreground">{resource.company}</span>
                      </div>
                    )}
                    {resource.address && (
                      <div className="p-4 rounded-2xl bg-secondary/30 border border-border/20 space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Primary Location</span>
                        <p className="text-sm font-bold text-foreground leading-relaxed">{resource.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center p-12 bg-card border border-border/40 rounded-3xl">
            <h2 className="text-xl font-black text-foreground">Vault Resource</h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Shared Resource: {resource.name}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-600">Zero-Trust Protocol Active</span>
          </div>
          <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity">
            ContactVault Security Foundation
          </p>
        </div>
      </div>
    </div>
  )
}
