"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Plus, Trash2, Save, X, User, Phone, Mail, MapPin, Building2, ImagePlus, Hash, Briefcase, Info, Map as MapIcon, Loader2, ShieldAlert } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getGroups } from "@/lib/supabase/group-actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  phones: z.array(z.object({
    label: z.string(),
    number: z.string().min(1, "Phone number is required"),
  })).min(1, "At least one phone number is required"),
  emails: z.array(z.object({
    label: z.string(),
    address: z.string().email("Invalid email address").or(z.literal("")),
  })).optional(),
  job_title: z.string().optional(),
  status: z.enum(["new", "qualified", "contacted"]).optional(),
  group_ids: z.array(z.string()).optional(),
  is_emergency_safe: z.boolean().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

interface ContactFormProps {
  onCancel: () => void
  onSubmit: (data: ContactFormValues) => void
  initialData?: Partial<ContactFormValues>
  isSubmitting?: boolean
}

export function ContactForm({ onCancel, onSubmit, initialData, isSubmitting = false }: ContactFormProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      company: initialData?.company || "",
      address: initialData?.address || "",
      phones: initialData?.phones || [{ label: "Mobile", number: "" }],
      emails: initialData?.emails || [],
      job_title: initialData?.job_title || "",
      status: initialData?.status || "new",
      group_ids: initialData?.group_ids || [],
      is_emergency_safe: initialData?.is_emergency_safe || false,
    },
  })

  const [availableGroups, setAvailableGroups] = useState<any[]>([])
  const [isLocating, setIsLocating] = useState(false)

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          if (data.display_name) {
            form.setValue("address", data.display_name)
            toast.success("Location identified!")
          }
        } catch (error) {
          toast.error("Could not fetch address from coordinates")
        } finally {
          setIsLocating(false)
        }
      },
      (error) => {
        toast.error("Location access denied")
        setIsLocating(false)
      }
    )
  }

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getGroups()
      setAvailableGroups(groups)
    }
    fetchGroups()
  }, [])

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: "phones",
  })

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control: form.control,
    name: "emails",
  })

  return (
    <div className="flex flex-col bg-background relative">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-md z-30">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-foreground tracking-tight">
            {initialData ? "Edit Contact" : "New Contact"}
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {initialData ? "Update Info" : "Vault Entry"}
          </p>
        </div>
        <button 
          onClick={onCancel} 
          className="rounded-xl p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all group"
        >
          <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="px-6 py-6 border-b border-border/30">
        <div id="contact-form" className="space-y-6 max-w-lg mx-auto">
          
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-border/30 pb-6">
            <div className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-3xl bg-secondary/40 shadow-inner border border-dashed border-border/50 transition-all hover:bg-secondary/60">
              <div className="h-full w-full rounded-3xl overflow-hidden flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100">
                <ImagePlus className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-background shadow-lg border border-border flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                 <Plus className="h-4 w-4 text-primary" />
              </div>
            </div>

            <div className="flex-1 grid gap-4 w-full">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    {...form.register("first_name")}
                    className="h-10 w-full rounded-xl border border-border/40 bg-secondary/20 px-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="First Name"
                  />
                  <input
                    {...form.register("last_name")}
                    className="h-10 w-full rounded-xl border border-border/40 bg-secondary/20 px-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="Last Name"
                  />
                </div>
                {form.formState.errors.first_name && (
                  <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-1">{form.formState.errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Lifecycle Status</label>
                <select
                  {...form.register("status")}
                  className="h-10 w-full rounded-xl border border-border/40 bg-secondary/20 px-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 appearance-none cursor-pointer"
                >
                  <option value="new">New Contact</option>
                  <option value="qualified">Qualified</option>
                  <option value="contacted">Contacted</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Professional Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">Profile Details</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Company</label>
                  <input
                    {...form.register("company")}
                    className="h-10 w-full rounded-xl border border-border/40 bg-secondary/15 px-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Position</label>
                  <input
                    {...form.register("job_title")}
                    className="h-10 w-full rounded-xl border border-border/40 bg-secondary/15 px-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="Role"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Address</label>
                  <button
                    type="button"
                    onClick={handleFetchLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Locating...
                      </>
                    ) : (
                      <>
                        <MapIcon className="h-3 w-3" /> Use Current Location
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    {...form.register("address")}
                    className="h-10 w-full rounded-xl border border-border/40 bg-secondary/15 pl-10 pr-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 placeholder:text-muted-foreground/30"
                    placeholder="Physical or Digital Address"
                  />
                </div>
              </div>
            </div>

            {/* Communication */}
            <div className="space-y-6 pt-2">
              {/* Phones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">Phones</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => appendPhone({ label: "Mobile", number: "" })}
                    className="h-7 px-2 rounded-lg bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {phoneFields.map((field, index) => (
                      <motion.div 
                        key={field.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <select
                          {...form.register(`phones.${index}.label`)}
                          className="w-24 rounded-xl border border-border/40 bg-secondary/15 px-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground outline-none focus:bg-background cursor-pointer"
                        >
                          <option>Mobile</option>
                          <option>Work</option>
                          <option>Home</option>
                        </select>
                        <input
                          {...form.register(`phones.${index}.number`)}
                          className="h-10 flex-1 rounded-xl border border-border/40 bg-secondary/15 px-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 placeholder:text-muted-foreground/30"
                          placeholder="Number"
                        />
                        {phoneFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhone(index)}
                            className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Emails */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">Emails</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => appendEmail({ label: "Personal", address: "" })}
                    className="h-7 px-2 rounded-lg bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {emailFields.map((field, index) => (
                      <motion.div 
                        key={field.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <select
                          {...form.register(`emails.${index}.label`)}
                          className="w-24 rounded-xl border border-border/40 bg-secondary/15 px-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground outline-none focus:bg-background cursor-pointer"
                        >
                          <option>Personal</option>
                          <option>Work</option>
                          <option>Other</option>
                        </select>
                        <input
                          {...form.register(`emails.${index}.address`)}
                          className="h-10 flex-1 rounded-xl border border-border/40 bg-secondary/15 px-4 text-xs font-bold text-foreground outline-none transition-all focus:bg-background focus:border-primary/40 placeholder:text-muted-foreground/30"
                          placeholder="Email"
                        />
                        {emailFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmail(index)}
                            className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Groups */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 px-1">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">Assigned Groups</h3>
                </div>
                <div className="flex flex-wrap gap-2 px-1 text-xs">
                  {availableGroups.map((group) => {
                    const isSelected = form.watch("group_ids")?.includes(group.id)
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          const current = form.getValues("group_ids")
                          if (isSelected) {
                            form.setValue("group_ids", (current || []).filter(id => id !== group.id))
                          } else {
                            form.setValue("group_ids", [...(current || []), group.id])
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                          isSelected 
                            ? "bg-primary text-primary-foreground border-primary shadow-md" 
                            : "bg-secondary/10 text-muted-foreground border-transparent hover:border-primary/20"
                        )}
                      >
                        {group.name}
                      </button>
                    )
                  })}
                  {availableGroups.length === 0 && (
                    <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-widest italic ml-1">No groups created.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-background/95 backdrop-blur-md sticky bottom-0 z-30 border-t border-border/40">
        <div className="flex items-center justify-between max-w-lg mx-auto mb-4 p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Emergency Safe</p>
              <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest leading-none">Visible during panic protocols</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => form.setValue("is_emergency_safe", !form.watch("is_emergency_safe"))}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none",
              form.watch("is_emergency_safe") ? "bg-red-500" : "bg-muted-foreground/20"
            )}
          >
            <span className={cn(
              "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-0 transition-transform",
              form.watch("is_emergency_safe") ? "translate-x-5" : "translate-x-0.5"
            )} />
          </button>
        </div>
        <div className="flex items-center justify-end max-w-lg mx-auto gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
          >
            Discard
          </button>
          <button
            onClick={form.handleSubmit(onSubmit)}
            type="button"
            disabled={isSubmitting}
            className="h-10 px-8 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {initialData ? "Apply Changes" : "Vault Contact"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-foreground">
                {initialData ? "Updating Contact..." : "Creating Contact..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
