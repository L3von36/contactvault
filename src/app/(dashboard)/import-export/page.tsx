"use client"

import { Upload, Download, FileText, FileSpreadsheet, FileIcon } from "lucide-react"
import { saveAs } from "file-saver"
import Papa from "papaparse"
import { motion } from "framer-motion"
import { toast } from "sonner"
import * as React from "react"
import { getContacts, bulkCreateContacts } from "@/lib/supabase/contact-actions"
import { MutationProgress } from "@/components/ui/mutation-progress"

export default function ImportExportPage() {
  const [importStatus, setImportStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [importProgress, setImportProgress] = React.useState(0)
  const [importMessage, setImportMessage] = React.useState("")
  const handleExport = async (format: "csv" | "vcf") => {
    try {
      const result = await getContacts()
      const contacts = result.contacts
      if (!contacts || contacts.length === 0) {
        toast.error("No contacts to export")
        return
      }

      if (format === "csv") {
        const flattenContacts = contacts.map((c: any) => ({
          FirstName: c.first_name,
          LastName: c.last_name,
          Company: c.company || "",
          Email: c.emails?.[0]?.address || "",
          Phone: c.phones?.[0]?.number || "",
          Address: c.address || ""
        }))
        const csv = Papa.unparse(flattenContacts)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        saveAs(blob, "contacts.csv")
        toast.success("Contacts exported to CSV")
      } else if (format === "vcf") {
        const vcardString = contacts.map((c: any) => 
          `BEGIN:VCARD\nVERSION:3.0\nFN:${c.first_name} ${c.last_name}\nN:${c.last_name};${c.first_name};;;\nORG:${c.company || ""}\nTEL;TYPE=CELL:${c.phones?.[0]?.number || ""}\nEMAIL:${c.emails?.[0]?.address || ""}\nADR;TYPE=HOME:;;${c.address || ""}\nEND:VCARD`
        ).join("\n")
        const blob = new Blob([vcardString], { type: "text/vcard;charset=utf-8;" })
        saveAs(blob, "contacts.vcf")
        toast.success("Contacts exported to vCard")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to export contacts")
    }
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const parseVCF = (content: string) => {
    const contacts: any[] = []
    const lines = content.split(/\r?\n/)
    let currentContact: any = null

    lines.forEach(line => {
      line = line.trim()
      if (!line) return

      if (line.toUpperCase() === "BEGIN:VCARD") {
        currentContact = {
          first_name: "",
          last_name: "",
          company: "",
          address: "",
          phones: [],
          emails: []
        }
      } else if (line.toUpperCase() === "END:VCARD") {
        if (currentContact && currentContact.first_name) {
          contacts.push(currentContact)
          currentContact = null
        }
      } else if (currentContact) {
        const colonIndex = line.indexOf(":")
        if (colonIndex === -1) return

        const key = line.substring(0, colonIndex).toUpperCase()
        const value = line.substring(colonIndex + 1).trim()
        if (!value) return

        if (key.startsWith("N;") || key === "N") {
          const nameParts = value.split(";")
          currentContact.last_name = nameParts[0]?.trim() || ""
          currentContact.first_name = nameParts[1]?.trim() || ""
          if (!currentContact.first_name && currentContact.last_name) {
            currentContact.first_name = currentContact.last_name
            currentContact.last_name = ""
          }
        } else if (key.startsWith("FN")) {
          if (!currentContact.first_name) {
            currentContact.first_name = value
          }
        } else if (key.startsWith("ORG")) {
          currentContact.company = value.split(";")[0]?.trim() || value
        } else if (key.startsWith("TEL")) {
          let label = "Mobile"
          if (key.includes("WORK")) label = "Work"
          else if (key.includes("HOME")) label = "Home"
          currentContact.phones.push({ label, number: value })
        } else if (key.startsWith("EMAIL")) {
          let label = "Personal"
          if (key.includes("WORK")) label = "Work"
          currentContact.emails.push({ label, address: value })
        } else if (key.startsWith("ADR")) {
          const adrParts = value.split(";")
          const cleanAddr = adrParts.filter(p => p.trim()).join(", ")
          if (cleanAddr) currentContact.address = cleanAddr
        }
      }
    })
    return contacts
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportStatus("loading")
    setImportProgress(0)
    setImportMessage(`Reading ${file.name}...`)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      let contactsToImport: any[] = []

      try {
        if (file.name.endsWith(".csv")) {
          setImportMessage("Parsing CSV data...")
          setImportProgress(25)
          
          Papa.parse(content, {
            header: true,
            complete: async (results) => {
              setImportProgress(50)
              setImportMessage("Processing contacts...")
              
              contactsToImport = results.data.map((row: any) => ({
                first_name: row.FirstName || row.first_name || "Unknown",
                last_name: row.LastName || row.last_name || "",
                company: row.Company || row.company || "",
                address: row.Address || row.address || "",
                phones: [{ label: "Mobile", number: row.Phone || row.phone || "" }],
                emails: [{ label: "Personal", address: row.Email || row.email || "" }]
              })).filter((c: any) => c.first_name !== "Unknown")
              
              if (contactsToImport.length > 0) {
                setImportProgress(75)
                setImportMessage(`Uploading ${contactsToImport.length} contacts...`)
                
                const res = await bulkCreateContacts(contactsToImport)
                if (res.success) {
                  setImportProgress(100)
                  setImportStatus("success")
                  setImportMessage(`Successfully imported ${res.count} contacts!`)
                  toast.success(`Imported ${res.count} contacts!`)
                  setTimeout(() => setImportStatus("idle"), 3000)
                } else {
                  setImportStatus("error")
                  setImportMessage("Import failed")
                  toast.error(res.error)
                  setTimeout(() => setImportStatus("idle"), 3000)
                }
              } else {
                setImportStatus("error")
                setImportMessage("No valid contacts found")
                toast.error("No valid contacts found in CSV")
                setTimeout(() => setImportStatus("idle"), 3000)
              }
            }
          })
        } else if (file.name.endsWith(".vcf")) {
          setImportMessage("Parsing vCard data...")
          setImportProgress(25)
          
          contactsToImport = parseVCF(content)
          setImportProgress(50)
          
          if (contactsToImport.length > 0) {
            setImportMessage(`Uploading ${contactsToImport.length} contacts...`)
            setImportProgress(75)
            
            const res = await bulkCreateContacts(contactsToImport)
            if (res.success) {
              setImportProgress(100)
              setImportStatus("success")
              setImportMessage(`Successfully imported ${res.count} contacts!`)
              toast.success(`Imported ${res.count} contacts from vCard!`)
              setTimeout(() => setImportStatus("idle"), 3000)
            } else {
              setImportStatus("error")
              setImportMessage("Import failed")
              toast.error(res.error)
              setTimeout(() => setImportStatus("idle"), 3000)
            }
          } else {
            setImportStatus("error")
            setImportMessage("No valid contacts found")
            toast.error("No valid contacts found in vCard file")
            setTimeout(() => setImportStatus("idle"), 3000)
          }
        }
      } catch (error) {
        setImportStatus("error")
        setImportMessage("Import failed")
        toast.error("Failed to import contacts")
        setTimeout(() => setImportStatus("idle"), 3000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <MutationProgress 
        isVisible={importStatus !== "idle"}
        status={importStatus}
        message={importMessage}
        progress={importProgress}
      />
      
      <div className="space-y-10 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Import & Export</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">Manage your data portability settings and sync with other apps.</p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Import Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Import Contacts</h2>
          </div>

          <div className="group relative rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center hover:border-primary/40 hover:bg-secondary/20 transition-all duration-300">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-secondary shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-5">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Upload className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            </div>
            <h3 className="text-base font-bold text-foreground">Drop files here</h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px] mx-auto leading-relaxed">
              Support for VCF (vCard) and CSV files from Google Contacts or Outlook.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.vcf"
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
            >
              Select Files
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Supported Formats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-card shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <FileIcon className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">vCard</p>
                  <p className="text-[10px] text-muted-foreground font-medium">.vcf file</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-card shadow-sm">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">CSV</p>
                  <p className="text-[10px] text-muted-foreground font-medium">.csv file</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Export Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
              <Download className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Export Contacts</h2>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-2">
            <button 
              onClick={() => handleExport("vcf")}
              className="group flex w-full items-center justify-between p-3.5 rounded-xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-secondary/30 transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <FileIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Export as vCard</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Best for iOS & Android sync</p>
                </div>
              </div>
              <motion.div
                whileHover={{ y: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Download className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-all" />
              </motion.div>
            </button>

            <button 
              onClick={() => handleExport("csv")}
              className="group flex w-full items-center justify-between p-3.5 rounded-xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-secondary/30 transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Export as CSV</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Best for Excel & DB processing</p>
                </div>
              </div>
              <motion.div
                whileHover={{ y: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Download className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-all" />
              </motion.div>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900 shadow-lg p-6 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700"></div>
             <div className="relative z-10">
                <h4 className="font-bold text-white mb-2">Need Bulk Export?</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  For enterprises with more than 10,000 contacts, please use our API for secure data extraction.
                </p>
                <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                  Contact Enterprise Support →
                </button>
             </div>
          </div>
        </section>
      </div>
      </div>
    </>
  )
}
