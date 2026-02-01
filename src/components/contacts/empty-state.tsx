"use client"

import { motion } from "framer-motion"
import { Users, Plus, Upload, UserPlus, LucideIcon } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  onAddClick?: () => void
  icon?: LucideIcon
}

export function EmptyState({ title, description, onAddClick, icon: Icon = Users }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 sm:p-20 text-center space-y-8 bg-white dark:bg-card border border-border/50 rounded-[3rem] shadow-xl shadow-primary/5 mt-10"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative h-24 w-24 rounded-[2.5rem] bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "easeInOut"
            }}
          >
            <Icon className="h-12 w-12" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-md space-y-3">
        <h3 className="text-2xl font-black tracking-tight text-foreground">{title}</h3>
        <p className="text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group"
          >
            <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Add Contact
          </button>
        )}
        <Link
          href="/import-export"
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-secondary px-6 py-4 text-sm font-bold text-foreground border border-border/40 hover:bg-secondary/80 transition-all active:scale-95 group"
        >
          <Upload className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
          Import CSV/VCF
        </Link>
      </div>
    </motion.div>
  )
}
