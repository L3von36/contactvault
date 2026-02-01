"use client"

import { Bell, Search, Zap, ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/supabase/auth-actions"
import Link from "next/link"

export function Header() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("q", term)
    } else {
      params.delete("q")
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || "U"
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const userAvatar = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`

  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-card sticky top-0 z-40 border-b border-border/40 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-6 flex-1 max-w-xl">
        <div className="mr-1">
          <MobileSidebar />
        </div>
        <div className="relative w-full group">
          <motion.div 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
            whileHover={{ scale: 1.1 }}
          >
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </motion.div>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("q")?.toString()}
            className="h-10 sm:h-11 w-full rounded-full border border-border bg-secondary/50 px-10 sm:px-11 py-2 text-xs sm:text-sm text-foreground outline-none transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-muted-foreground"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">Cmd</kbd>
            <kbd className="rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="hidden sm:flex rounded-full p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Zap className="h-5 w-5" />
          </motion.div>
        </button>
        <button className="relative rounded-full p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group">
          <motion.div
            whileHover={{ rotate: [0, -15, 15, -15, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Bell className="h-5 w-5" />
          </motion.div>
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-border/50 mx-1 hidden md:block"></div>

        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-full hover:bg-secondary p-1 transition-all group"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 overflow-hidden ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
              {user?.user_metadata?.avatar_url ? (
                <img src={userAvatar} alt={userName} />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div className="hidden lg:flex flex-col items-start leading-tight">
              <span className="text-sm font-bold text-foreground">{userName}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                className="flex items-center"
              >
                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-card p-2 shadow-xl border border-border/50 z-40"
                >
                  <div className="px-3 py-2 border-b border-border/50 mb-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                    <p className="text-sm font-bold text-foreground truncate">{user?.email}</p>
                  </div>
                  
                  <Link 
                    href="/settings/emergency" 
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    Settings
                  </Link>
                  
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <UserIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    Your Profile
                  </Link>

                  <div className="h-[1px] bg-border/50 my-1"></div>

                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false)
                      signOut()
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
                  >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
