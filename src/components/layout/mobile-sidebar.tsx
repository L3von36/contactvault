"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Heart, Share2, Upload, Siren, LogOut, Menu, X, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { signOut } from "@/lib/supabase/auth-actions"
import { DuressIndicator } from "@/components/layout/duress-indicator"

const navigation = [
  { name: "All Contacts", href: "/contacts", icon: Users },
  { name: "Favorites", href: "/contacts/favorites", icon: Heart },
  { name: "Shared", href: "/contacts/shared", icon: Share2 },
  { name: "Relationships", href: "/relationships", icon: LayoutDashboard },
  { name: "Import/Export", href: "/import-export", icon: Upload },
  { name: "Emergency", href: "/settings/emergency", icon: Siren },
  { name: "My Profile", href: "/profile", icon: UserIcon },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const sidebarContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" 
            onClick={() => setOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative flex h-full w-full max-w-[280px] flex-col bg-card border-r border-border shadow-2xl px-6 py-8 z-[101]"
          >
            <div className="flex items-center justify-between mb-10 px-2">
              <Link href="/" className="flex items-center gap-3 font-semibold group" onClick={() => setOpen(false)}>
                <div className="h-10 w-10 rounded-2xl bg-primary/5 text-primary-foreground flex items-center justify-center border border-primary/20 group-hover:bg-primary/10 transition-colors shadow-lg overflow-hidden">
                  <Image 
                    src="/logo.png" 
                    alt="ContactVault Logo" 
                    width={40} 
                    height={40}
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-black tracking-tighter text-foreground uppercase tracking-widest">ContactVault</span>
              </Link>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <motion.div whileTap={{ scale: 0.9, rotate: -90 }}>
                  <X className="h-6 w-6" />
                </motion.div>
              </button>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary font-bold shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                    </motion.div>
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <DuressIndicator />

            <div className="mt-auto pt-6 px-2">
               <div className="flex items-center justify-between border-t border-border/50 pt-6">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <ThemeToggle />
                    <span className="text-xs font-black uppercase tracking-widest">Theme</span>
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors group"
                  >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
      >
        <motion.div whileTap={{ scale: 0.9, rotate: 90 }}>
          <Menu className="h-6 w-6" />
        </motion.div>
      </button>

      {mounted && createPortal(sidebarContent, document.body)}
    </div>
  )
}
