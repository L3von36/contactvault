"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Shield, Camera, Edit2, Check, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setFullName(user.user_metadata?.full_name || "")
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })
      if (error) throw error
      toast.success("Profile updated successfully")
      setIsEditing(false)
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser()
      setUser(updatedUser)
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Edit2 className="h-8 w-8 text-primary opacity-20" />
        </motion.div>
      </div>
    )
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || "U"
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const userAvatar = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1.5"
      >
        <h1 className="text-2xl font-black tracking-tight text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground font-medium">Manage your personal information and account security.</p>
      </motion.div>

      <div className="grid gap-8">
        {/* Profile Card */}
        <section className="bg-card rounded-3xl border border-border/50 p-8 sm:p-10 shadow-xl shadow-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary border-4 border-card shadow-lg shadow-primary/10 overflow-hidden">
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center border-4 border-card shadow-lg hover:scale-110 active:scale-95 transition-all">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-6 w-full text-center md:text-left">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      className={cn(
                        "flex-1 h-11 bg-secondary/50 rounded-xl px-4 text-sm font-bold border border-transparent transition-all outline-none",
                        isEditing ? "bg-background border-primary/20 ring-4 ring-primary/5" : "cursor-not-allowed opacity-80"
                      )}
                      placeholder="Your Full Name"
                    />
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="h-11 px-5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs transition-all flex items-center justify-center gap-2 group"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={handleUpdateProfile}
                          disabled={isLoading}
                          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Check className="h-3.5 w-3.5" /></motion.div>
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditing(false)
                            setFullName(user.user_metadata?.full_name || "")
                          }}
                          className="h-11 px-5 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs hover:bg-red-500/20 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="h-11 bg-secondary/30 rounded-xl px-4 text-xs font-medium text-muted-foreground flex items-center gap-3 border border-border/40 select-none">
                    <Mail className="h-3.5 w-3.5" />
                    {user?.email}
                    <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Details & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="bg-card rounded-3xl border border-border/50 p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Shield className="h-4.5 w-4.5 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Account Security</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">Two-Factor Auth</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Recommended</p>
                  </div>
                  <button className="text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">Enable</button>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">Change Password</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Last changed 2 months ago</p>
                  </div>
                  <button className="text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">Update</button>
                </div>
              </div>
           </section>

           <section className="bg-slate-900 rounded-3xl p-7 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all duration-700"></div>
              <div className="relative z-10 space-y-3">
                 <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-primary" />
                 </div>
                 <h3 className="font-bold text-base">Identity Verification</h3>
                 <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Your identity helps prioritize high-security recovery requests for your contact vault.</p>
                 <button className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-all bg-white/5 border border-white/10 hover:bg-primary hover:border-primary px-4 py-2.5 rounded-lg w-full">
                   Verify Identity Now
                 </button>
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}
