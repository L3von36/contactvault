"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getSharedResource } from "@/lib/supabase/shared-actions"
import { 
  Users, 
  Mail, 
  Phone as PhoneIcon, 
  MapPin, 
  Building2, 
  Briefcase,
  Calendar,
  ShieldCheck,
  Loader2,
  AlertCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function SharedResourcePage() {
  const { token } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['shared', token],
    queryFn: () => getSharedResource(token as string),
    enabled: !!token,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20"
        >
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </motion.div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Decrypting Vault Access...</p>
      </div>
    )
  }

  if (data?.error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="h-20 w-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Access Denied</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">
            This link has expired or the security token is invalid. Please contact the owner for a fresh access key.
          </p>
        </div>
      </div>
    )
  }

  const { type, data: resource } = data as any

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Branding Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
               <ShieldCheck className="h-4 w-4" />
             </div>
             <span className="text-xs font-black uppercase tracking-widest text-foreground">ContactVault <span className="text-muted-foreground/50">Secure Share</span></span>
          </div>
        </div>

        {type === "contact" ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-[3rem] shadow-2xl shadow-primary/5 overflow-hidden"
          >
            {/* Contact Profile Header */}
            <div className="p-10 text-center space-y-4 border-b border-border/30 bg-secondary/10">
              <div className="h-32 w-32 rounded-[2.5rem] bg-primary text-white flex items-center justify-center mx-auto text-4xl font-black shadow-2xl shadow-primary/30 border-4 border-background">
                {resource.first_name[0]}{resource.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">
                  {resource.first_name} {resource.last_name}
                </h1>
                <p className="text-xs font-black uppercase tracking-widest text-primary mt-1">{resource.job_title || "Individual"}</p>
              </div>
            </div>

            <div className="p-10 space-y-10 text-xs uppercase tracking-widest font-black">
              {/* Phones */}
              {resource.phones?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PhoneIcon className="h-3 w-3" />
                    <span>Communications</span>
                  </div>
                  <div className="grid gap-3">
                    {resource.phones.map((p: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-secondary/20 border border-border/30 flex items-center justify-between">
                        <span className="text-muted-foreground/60">{p.label}</span>
                        <span className="text-foreground">{p.number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emails */}
              {resource.emails?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>Digital Channels</span>
                  </div>
                  <div className="grid gap-3">
                    {resource.emails.map((e: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-secondary/20 border border-border/30 flex items-center justify-between">
                        <span className="text-muted-foreground/60">{e.label}</span>
                        <span className="text-foreground lowercase tracking-normal font-bold">{e.address}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Info */}
              {(resource.company || resource.address) && (
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>Affiliations</span>
                  </div>
                  <div className="grid gap-3">
                    {resource.company && (
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/30 flex items-center justify-between">
                        <span className="text-muted-foreground/60">Company</span>
                        <span className="text-foreground">{resource.company}</span>
                      </div>
                    )}
                    {resource.address && (
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/30 space-y-2">
                        <span className="text-muted-foreground/60">Location</span>
                        <p className="text-foreground normal-case font-bold">{resource.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center p-10">
            {/* Group support can be expanded here */}
            <p>Shared Group: {resource.name}</p>
          </div>
        )}

        <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-[0.3em]">
          Powered by ContactVault Zero-Trust Protocol
        </p>
      </div>
    </div>
  )
}
