"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Heart, Share2, Upload, Siren, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { signOut } from "@/lib/supabase/auth-actions"
import { DuressIndicator } from "@/components/layout/duress-indicator"

const navigation = [
  { name: "All Contacts", href: "/contacts", icon: Users },
  { name: "Favorites", href: "/contacts/favorites", icon: Heart },
  { name: "Shared", href: "/contacts/shared", icon: Share2 },
  { name: "Relationships", href: "/relationships", icon: LayoutDashboard },
  { name: "Import/Export", href: "/import-export", icon: Upload },
  { name: "Emergency", href: "/settings/emergency", icon: Siren },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden bg-card md:flex md:h-full md:w-64 md:flex-col shadow-sm relative z-20 border-r border-border/50">
      <div className="flex h-16 items-center px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">ContactVault</span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col gap-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <motion.div
                whileHover={{ rotate: isActive ? 0 : 12, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              </motion.div>
              {item.name}
            </Link>
          )
        })}
      </div>

      <DuressIndicator />

      <div className="p-8 mt-auto border-t border-border/50">
        <div className="flex items-center justify-between px-1">
           <ThemeToggle />
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Sign Out
            </button>
        </div>
      </div>
    </div>
  )
}
