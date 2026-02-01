"use client"

import { useQuery } from "@tanstack/react-query"
import { getEmergencySettings } from "@/lib/supabase/emergency-actions"
import { Siren, ShieldAlert } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function DuressIndicator() {
  const { data: settings } = useQuery({
    queryKey: ['emergency-settings'],
    queryFn: () => getEmergencySettings(),
  })

  const isEnabled = settings?.enabled || false

  return (
    <AnimatePresence>
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="mx-4 mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 group relative overflow-hidden"
        >
          {/* Subtle Background Pulse */}
          <motion.div
            animate={{ 
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.2, 1] 
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 bg-red-500"
          />

          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white shadow-lg shadow-red-500/40">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
            >
              <Siren className="h-4 w-4" />
            </motion.div>
          </div>
          <div className="relative z-10 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 leading-tight">Panic Active</p>
            <p className="text-[8px] font-bold text-red-400/80 uppercase tracking-widest truncate leading-tight mt-0.5">Vault is in Safe Mode</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
