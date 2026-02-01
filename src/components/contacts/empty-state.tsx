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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 sm:p-14 text-center space-y-7 bg-white dark:bg-card border border-border/50 rounded-3xl shadow-xl shadow-primary/5 mt-8"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/30">
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
            <Icon className="h-10 w-10" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-md space-y-2.5">
        <h3 className="text-xl font-black tracking-tight text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95 group"
          >
            <UserPlus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            Add Individual
          </button>
        )}
        <Link
          href="/import-export"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-xs font-bold text-foreground border border-border/40 hover:bg-secondary/80 transition-all active:scale-95 group"
        >
          <Upload className="h-3.5 w-3.5 text-muted-foreground group-hover:scale-110 transition-transform" />
          Batch Import
        </Link>
      </div>
    </motion.div>
  )
}
