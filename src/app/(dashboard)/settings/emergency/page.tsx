"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, KeyRound, Siren, Lock, Loader2, RotateCcw, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { getEmergencySettings, updateEmergencySettings, resetAllData } from "@/lib/supabase/emergency-actions"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function EmergencySettingsPage() {
  const queryClient = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['emergency-settings'],
    queryFn: () => getEmergencySettings(),
  })

  const [pin, setPin] = useState("")

  const updateMutation = useMutation({
    mutationFn: (newSettings: { enabled?: boolean; pin_hash?: string }) => updateEmergencySettings(newSettings),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['emergency-settings'] })
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        if (pin) setPin("")
      } else {
        toast.error(res.error || "Failed to update settings")
      }
    }
  })

  const resetMutation = useMutation({
    mutationFn: () => resetAllData(),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Database wiped successfully")
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        queryClient.invalidateQueries({ queryKey: ['groups'] })
      } else {
        toast.error(res.error || "Failed to reset data")
      }
    }
  })

  const enabled = settings?.enabled || false

  const handleToggle = (newVal: boolean) => {
    updateMutation.mutate({ enabled: newVal })
    toast.success(`Emergency Mode ${newVal ? "enabled" : "disabled"}`)
  }

  const handleSetPin = () => {
    if (pin.length !== 6) {
      toast.error("PIN must be exactly 6 digits")
      return
    }
    updateMutation.mutate({ pin_hash: pin })
    toast.success("Security PIN updated")
  }

  const handleResetData = () => {
    if (confirm("WARNING: This will permanently delete all your contacts and groups. Are you sure?")) {
      resetMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="font-bold text-lg">Encrypting vault...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Under Duress Security</h1>
        <p className="text-muted-foreground mt-2 font-medium">Manage your emergency protocols and fail-safe triggers.</p>
      </div>

      <div className="grid gap-8">
        {/* Main Status */}
        <div className={cn(
          "rounded-[2.5rem] border p-8 transition-all duration-500",
          enabled ? "border-red-500 bg-red-500/10 shadow-xl shadow-red-500/10" : "border-border bg-card shadow-sm"
        )}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className={cn(
              "h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg transition-colors duration-500",
              enabled ? "bg-red-500 text-white shadow-red-500/40" : "bg-secondary text-muted-foreground"
            )}>
              <motion.div
                animate={enabled ? { 
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1]
                } : {}}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              >
                <Siren className="h-10 w-10" />
              </motion.div>
            </div>
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h3 className="font-black text-2xl text-foreground">Panic Protocol</h3>
                <button 
                  onClick={() => handleToggle(!enabled)}
                  className={cn(
                    "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20",
                    enabled ? "bg-red-500 shadow-lg shadow-red-500/30" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform duration-300",
                    enabled ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl font-medium">
                When active, your vault appears in a "safe mode." Deceptive data is shown instead of your private network, and selected emergency contacts are notified if the vault is breached.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Access PIN */}
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }}>
                  <KeyRound className="h-6 w-6 text-primary" />
                </motion.div>
              </div>
              <h3 className="font-bold text-xl text-foreground">Duress PIN</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
              Enter this 6-digit PIN on the login screen to trigger a silent alarm and enter "Emergency Mode".
            </p>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" 
                className="flex-1 h-14 rounded-2xl border border-border bg-secondary/50 px-6 text-center text-xl tracking-[0.5em] focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-black"
                maxLength={6}
              />
              <button 
                onClick={handleSetPin}
                disabled={updateMutation.isPending || pin.length !== 6}
                className="rounded-2xl bg-foreground text-background px-8 text-sm font-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Set"}
              </button>
            </div>
          </div>

          {/* Trusted Contacts */}
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm group hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
             <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <motion.div whileHover={{ scale: 1.2, rotate: [-10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                    <ShieldAlert className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
                <h3 className="font-bold text-xl text-foreground">Fail-safe List</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-medium">
                These contacts will be the ONLY ones visible when the Duress PIN is used.
              </p>
             </div>
            <button className="h-14 rounded-2xl border-2 border-dashed border-border text-sm font-black text-muted-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all">
              + Specify Safe Contacts
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <section className="rounded-[2.5rem] border border-red-500/20 bg-red-500/5 p-10 space-y-10">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
             </div>
             <h2 className="text-2xl font-black text-red-500 tracking-tight">Danger Zone</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-card border border-red-500/10 hover:shadow-lg transition-all">
              <div>
                <p className="font-black text-lg text-foreground">Nuclear Reset</p>
                <p className="text-sm text-muted-foreground font-medium">Permanently delete all contact relationships and group hierarchies.</p>
              </div>
              <button 
                onClick={handleResetData}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-red-500/20 px-8 py-3 text-sm font-black text-red-600 hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Data
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[2rem] bg-red-600 text-white shadow-2xl shadow-red-600/30">
              <div>
                <p className="font-black text-2xl">Purge All Evidence</p>
                <p className="text-sm text-red-100/90 font-medium">Immediate, irreversible destruction of all vault contents.</p>
              </div>
              <button 
                onClick={handleResetData}
                className="rounded-2xl bg-white/20 px-10 py-4 text-sm font-black text-white hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 border border-white/30"
              >
                Execute Master Purge
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
