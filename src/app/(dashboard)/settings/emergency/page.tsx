"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, KeyRound, Siren, Lock, Loader2, RotateCcw, AlertTriangle, Search, Check, X, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getEmergencySettings, updateEmergencySettings, resetAllData } from "@/lib/supabase/emergency-actions"
import { getContacts, toggleEmergencySafe } from "@/lib/supabase/contact-actions"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function EmergencySettingsPage() {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['emergency-settings'],
    queryFn: () => getEmergencySettings(),
  })

  const { data: contactsData } = useQuery({
    queryKey: ['contacts-all'],
    queryFn: () => getContacts(),
  })

  const [pin, setPin] = useState("")
  const [isSafeContactsOpen, setIsSafeContactsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const updateMutation = useMutation({
    mutationFn: (newSettings: { enabled?: boolean; pin_hash?: string }) => updateEmergencySettings(newSettings),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['emergency-settings'] })
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        if (pin) {
          setPin("")
          toast.success("Security PIN updated")
        }
      } else {
        toast.error(res.error || "Failed to update settings")
      }
    }
  })

  const resetMutation = useMutation({
    mutationFn: () => resetAllData(),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("All vault data cleared permanently")
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        queryClient.invalidateQueries({ queryKey: ['relationships'] })
      } else {
        toast.error(res.error || "Failed to reset data")
      }
    }
  })

  const toggleSafeMutation = useMutation({
    mutationFn: ({ id, isSafe }: { id: string, isSafe: boolean }) => toggleEmergencySafe(id, isSafe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts-all'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    }
  })

  const enabled = settings?.enabled || false
  const safeContacts = contactsData?.contacts?.filter((c: any) => c.is_emergency_safe) || []
  const filteredContacts = contactsData?.contacts?.filter((c: any) => 
    `${c.first_name} ${c.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleToggle = (newVal: boolean) => {
    updateMutation.mutate({ enabled: newVal })
    if (newVal) {
        toast.info("Enabling Panic Protocol...")
    } else {
        toast.success("Panic mode disabled")
    }
  }

  const handleSetPin = () => {
    if (pin.length !== 6) {
      toast.error("PIN must be exactly 6 digits")
      return
    }
    updateMutation.mutate({ pin_hash: pin })
  }

  const handleResetData = () => {
    if (confirm("CRITICAL WARNING: This will permanently delete ALL contacts, relationships, and history. This cannot be undone. Are you absolutely certain?")) {
      resetMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="font-bold text-lg italic uppercase tracking-widest">Encrypting protocols...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Fail-Safe Protocols</h1>
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Manage your vault's emergency overrides and duress triggers.</p>
      </div>

      <div className="grid gap-6">
        {/* Main Status */}
        <div className={cn(
          "rounded-3xl border p-6 transition-all duration-500 relative overflow-hidden",
          enabled ? "border-red-500 bg-red-500/10 shadow-xl shadow-red-500/10" : "border-border bg-card shadow-sm"
        )}>
          {enabled && (
             <div className="absolute top-0 right-0 p-4">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
             </div>
          )}
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
              enabled ? "bg-red-500 text-white shadow-red-500/30 scale-105" : "bg-secondary text-muted-foreground"
            )}>
              <motion.div
                animate={enabled ? { 
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <Siren className="h-10 w-10" />
              </motion.div>
            </div>
            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h3 className="font-black text-xl text-foreground tracking-tight">Active Panic Mode</h3>
                <button 
                  onClick={() => handleToggle(!enabled)}
                  disabled={updateMutation.isPending}
                  className={cn(
                    "relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20",
                    enabled ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 flex items-center justify-center",
                    enabled ? "translate-x-9" : "translate-x-1"
                  )}>
                    {updateMutation.isPending && <Loader2 className="h-3 w-3 animate-spin text-red-500" />}
                  </span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl font-medium">
                When Panic Mode is activated, your vault presents a sanitized environment. Only "Safe Contacts" will be visible, protecting your most sensitive connections during a compromised entry.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Access PIN */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm group hover:shadow-lg transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }}>
                  <KeyRound className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
              <h3 className="font-bold text-lg text-foreground tracking-tight">Security Override PIN</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-medium">
              Enter this 6-digit numeric sequence on the login screen to trigger the Panic Response protocols.
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" 
                className="flex-1 h-12 rounded-xl border border-border bg-secondary/50 px-4 text-center text-lg tracking-[0.4em] focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-black placeholder:text-muted-foreground/20"
                maxLength={6}
              />
              <button 
                onClick={handleSetPin}
                disabled={updateMutation.isPending || pin.length !== 6}
                className="rounded-xl bg-foreground text-background px-6 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set"}
              </button>
            </div>
          </div>

          {/* Trusted Contacts */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm group hover:shadow-lg transition-all duration-500 flex flex-col justify-between">
             <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <motion.div whileHover={{ scale: 1.2, rotate: [-10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>
                <h3 className="font-bold text-lg text-foreground tracking-tight">Fail-safe List</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed font-medium">
                Identify the contacts allowed to remain visible in the vault while Panic Mode is engaged.
              </p>
             </div>
            <button 
                onClick={() => setIsSafeContactsOpen(true)}
                className="group h-12 rounded-xl bg-secondary/20 hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-between px-4 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                    {safeContacts.length} Safe Individuals
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary border-b border-primary/30">Edit</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <section className="rounded-3xl border border-red-500/10 bg-red-500/[0.02] p-8 space-y-8">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
             </div>
             <h2 className="text-xl font-black text-red-500 tracking-tight uppercase tracking-wider">Deactivation Zone</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-2xl bg-card border border-red-500/10 hover:shadow-md transition-all">
              <div>
                <p className="font-black text-base text-foreground">Nuclear Data Wipe</p>
                <p className="text-[11px] text-muted-foreground font-medium italic">Purge all vault entries, relationship mappings, and security logs.</p>
              </div>
              <button 
                onClick={handleResetData}
                disabled={resetMutation.isPending}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-500/10 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {resetMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                Execute Reset
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Safe Contacts Selector Modal */}
      <AnimatePresence>
        {isSafeContactsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-background/80 backdrop-blur-md"
               onClick={() => setIsSafeContactsOpen(false)}
             />
             <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 10 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 10 }}
               className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-3xl flex flex-col max-h-[80vh] overflow-hidden"
             >
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-foreground tracking-tight">Manage Fail-safe List</h2>
                            <p className="text-xs text-muted-foreground font-medium">Select individuals to bypass Panic Mode concealment.</p>
                        </div>
                        <button onClick={() => setIsSafeContactsOpen(false)} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <input 
                            type="text"
                            placeholder="Search Vault..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-secondary/30 rounded-xl border border-border focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all font-bold text-xs"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredContacts.map((contact: any) => (
                        <div 
                            key={contact.id}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                                contact.is_emergency_safe 
                                    ? "bg-primary/5 border-primary/20" 
                                    : "bg-transparent border-transparent hover:bg-secondary/50 hover:border-border/50"
                            )}
                            onClick={() => toggleSafeMutation.mutate({ id: contact.id, isSafe: !contact.is_emergency_safe })}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-black text-xs">
                                    {contact.first_name[0]}{contact.last_name?.[0] || ""}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-foreground">{contact.first_name} {contact.last_name}</p>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{contact.company || "No Company"}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                contact.is_emergency_safe ? "bg-primary border-primary text-primary-foreground" : "border-border"
                            )}>
                                {contact.is_emergency_safe && <Check className="h-3 w-3 stroke-[4]" />}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-border/50 bg-secondary/10">
                    <button 
                        onClick={() => setIsSafeContactsOpen(false)}
                        className="w-full h-12 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-black/5"
                    >
                        Save Protocols
                    </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
