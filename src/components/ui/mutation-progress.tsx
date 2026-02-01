"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MutationProgressProps {
  isVisible: boolean
  status: "loading" | "success" | "error"
  message: string
  progress?: number // 0 to 100
}

export function MutationProgress({ isVisible, status, message, progress }: MutationProgressProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
        >
          <div className={cn(
            "bg-card border h-16 rounded-2xl shadow-2xl flex items-center gap-4 px-6 relative overflow-hidden",
            status === "loading" ? "border-primary/20" : 
            status === "success" ? "border-green-500/20" : "border-red-500/20"
          )}>
            {/* Progress Bar Background */}
            {status === "loading" && progress !== undefined && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full"
              />
            )}
            {/* Active Progress Bar */}
            {status === "loading" && progress !== undefined && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute bottom-0 left-0 h-1 bg-primary"
              />
            )}

            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              status === "loading" ? "bg-primary/10 text-primary" :
              status === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground truncate">
                {message}
              </p>
              {status === "loading" && progress !== undefined && (
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {progress}% Complete
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
