"use client"

import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Tab {
  id: string
  label: string
  count?: number
}

interface FilterTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  layoutId?: string
  rightElement?: React.ReactNode
}

export function FilterTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  layoutId = "activeTabPill",
  rightElement
}: FilterTabsProps) {
  return (
    <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm p-1 rounded-2xl border border-border/50">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth px-1 relative">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "group relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors duration-200",
              activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="relative z-10">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "relative z-10 px-1.5 py-0.5 rounded-md text-[10px] transition-colors duration-200",
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground group-hover:bg-secondary/80"
              )}>
                {tab.count}
              </span>
            )}
            
            {activeTab === tab.id && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="flex items-center pl-2 pr-1 border-l border-border/50 ml-2">
        {rightElement || (
          <button className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl text-xs font-bold transition-all">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort</span>
          </button>
        )}
      </div>
    </div>
  )
}
