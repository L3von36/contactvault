"use client"

import { useState, useEffect } from "react"
import { Users, Plus, MoreVertical, Hash, Loader2, Trash2 } from "lucide-react"
import { getGroups, createGroup, deleteGroup } from "@/lib/supabase/group-actions"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-yellow-500", 
  "bg-pink-500", "bg-indigo-500", "bg-orange-500", "bg-cyan-500"
]

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchGroups = async () => {
    setIsLoading(true)
    const data = await getGroups()
    setGroups(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    setIsSubmitting(true)
    const res = await createGroup(newGroupName)
    if (res.success) {
      toast.success("Group created successfully")
      setNewGroupName("")
      setIsCreating(false)
      fetchGroups()
    } else {
      toast.error(res.error || "Failed to create group")
    }
    setIsSubmitting(false)
  }

  const handleDeleteGroup = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this group? Contacts will not be deleted.")) return
    
    const res = await deleteGroup(id)
    if (res.success) {
      toast.success("Group deleted")
      fetchGroups()
    } else {
      toast.error(res.error || "Failed to delete group")
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Groups</h1>
          <p className="text-muted-foreground mt-2 font-medium">Organize your network into specialized lists.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Create Group
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="font-bold">Loading your groups...</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {groups.map((group, index) => (
              <motion.div 
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`absolute left-0 top-0 h-full w-2 ${COLORS[index % COLORS.length]}`} />
                
                <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <button 
                    onClick={(e) => handleDeleteGroup(group.id, e)}
                    className="rounded-xl p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                  <Hash className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-bold text-foreground truncate">{group.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 font-bold bg-secondary/50 w-fit px-3 py-1 rounded-full">
                  <Users className="h-3.5 w-3.5" />
                  {group.count} {group.count === 1 ? 'contact' : 'contacts'}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* New Group Placeholder */}
          <button 
            onClick={() => setIsCreating(true)}
            className="group flex h-full min-h-[180px] flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-border bg-secondary/20 p-8 hover:bg-secondary/40 hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background border border-border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-500">
              <Plus className="h-7 w-7" />
            </div>
            <span className="text-sm font-black tracking-wide uppercase">New Group</span>
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-300 px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-[2.5rem] border border-border bg-card p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-black text-foreground tracking-tight">Create Group</h2>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              Give your new segment a powerful name.
            </p>
            
            <div className="mt-10 space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest ml-1">Group Name</label>
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Platinum Clients"
                  className="flex h-14 w-full rounded-2xl border border-border bg-secondary/50 px-6 py-2 text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary/50 placeholder:text-muted-foreground/50"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="rounded-2xl px-6 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateGroup}
                  disabled={isSubmitting || !newGroupName.trim()}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create Group
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
