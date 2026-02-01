"use client"

import { useState } from "react"
import { Share2, Link as LinkIcon, Copy, Check, Clock, Globe, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { generateSharedLink } from "@/lib/supabase/shared-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ShareSheetProps {
  resourceId: string
  resourceType: "contact" | "group"
  onClose: () => void
}

export function ShareSheet({ resourceId, resourceType, onClose }: ShareSheetProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (days?: number) => {
    setIsGenerating(true)
    const res = await generateSharedLink({
      resource_id: resourceId,
      resource_type: resourceType,
      expiresInDays: days
    })

    if (res.success && res.token) {
      const url = `${window.location.origin}/shared/${res.token}`
      setShareUrl(url)
      toast.success("Link generated successfully")
    } else {
      toast.error(res.error || "Failed to generate link")
    }
    setIsGenerating(false)
  }

  const copyToClipboard = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="relative w-full max-w-lg bg-card border border-border/50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Vault Sharing</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Public Access Control</p>
              </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!shareUrl ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Generate a unique, secure link to share this {resourceType} with others. You can set it to expire automatically.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleGenerate(7)}
                  disabled={isGenerating}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-secondary/30 border border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all text-center group"
                >
                  <Clock className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none">7 Days</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">Temporary Access</p>
                  </div>
                </button>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-primary/5 border border-primary/10 hover:bg-primary/10 hover:border-primary/20 transition-all text-center group"
                >
                  <Globe className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest leading-none">Permanent</p>
                    <p className="text-[10px] text-primary/70 font-medium mt-1 uppercase tracking-tight">Until revoked</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-3xl bg-secondary/30 border border-border/50 space-y-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Generated Public URL</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 h-12 rounded-xl border border-border/40 bg-background/50 px-4 text-xs font-bold text-foreground outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                      copied ? "bg-green-500 text-white" : "bg-primary text-white hover:scale-105"
                    )}
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => setShareUrl(null)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Generate new link
                </button>
              </div>
            </motion.div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center z-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
