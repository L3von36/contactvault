"use client"

import Link from "next/link"
import { Users, Mail, Lock, ArrowRight, User, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signup, signInWithOAuth } from "@/lib/supabase/auth-actions"
import { toast } from "sonner"
import { useState, useEffect, Suspense } from "react"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"

const registerSchema = z.object({
  first_name: z.string().min(2, "First name is too short"),
  last_name: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

function RegisterContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  const error = searchParams.get("error_description") || searchParams.get("error")
  const success = searchParams.get("message")

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
    if (success) {
      toast.success(success)
    }
  }, [error, success])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const result = await signup(data)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Account created! Please check your email for verification.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: "google") => {
    setIsOAuthLoading(provider)
    try {
      await signInWithOAuth(provider)
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`)
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-100/20 blur-3xl opacity-50" />

      <div className="z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white dark:bg-card p-10 shadow-2xl shadow-slate-200 dark:shadow-none border border-white dark:border-border">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground mb-6 shadow-lg shadow-primary/30">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
            >
              <Users className="h-10 w-10" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-foreground">Create Account</h1>
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-muted-foreground leading-relaxed">
            Join ContactVault and secure your professional network today.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/10 p-4 border border-red-100 dark:border-red-500/20"
          >
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-red-800 dark:text-red-200 leading-relaxed">
              {error}
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-2xl bg-green-50 dark:bg-green-500/10 p-4 border border-green-100 dark:border-green-500/20"
          >
            <div className="text-sm font-medium text-green-800 dark:text-green-200 leading-relaxed">
              {success}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 dark:text-foreground ml-1" htmlFor="first_name">
                First Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  {...register("first_name")}
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-slate-100 dark:border-border bg-slate-50 dark:bg-secondary px-11 py-2 text-sm text-slate-700 dark:text-foreground outline-none transition-all focus:bg-white dark:focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-slate-400",
                    errors.first_name && "border-red-500 focus:ring-red-500/20"
                  )}
                  id="first_name"
                  placeholder="John"
                  type="text"
                />
              </div>
              {errors.first_name && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-slate-700 dark:text-foreground ml-1" htmlFor="last_name">
                Last Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  {...register("last_name")}
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-slate-100 dark:border-border bg-slate-50 dark:bg-secondary px-11 py-2 text-sm text-slate-700 dark:text-foreground outline-none transition-all focus:bg-white dark:focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-slate-400",
                    errors.last_name && "border-red-500 focus:ring-red-500/20"
                  )}
                  id="last_name"
                  placeholder="Doe"
                  type="text"
                />
              </div>
              {errors.last_name && (
                <p className="text-[10px] font-bold text-red-500 ml-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-700 dark:text-foreground ml-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                {...register("email")}
                className={cn(
                  "flex h-12 w-full rounded-xl border border-slate-100 dark:border-border bg-slate-50 dark:bg-secondary px-11 py-2 text-sm text-slate-700 dark:text-foreground outline-none transition-all focus:bg-white dark:focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50 placeholder:text-slate-400",
                  errors.email && "border-red-500 focus:ring-red-500/20"
                )}
                id="email"
                placeholder="m@example.com"
                type="email"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] font-bold text-red-500 ml-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-700 dark:text-foreground ml-1" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                {...register("password")}
                className={cn(
                   "flex h-12 w-full rounded-xl border border-slate-100 dark:border-border bg-slate-50 dark:bg-secondary px-11 py-2 text-sm text-slate-700 dark:text-foreground outline-none transition-all focus:bg-white dark:focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                   errors.password && "border-red-500 focus:ring-red-500/20"
                )}
                id="password"
                type="password"
              />
            </div>
            {errors.password && (
              <p className="text-[10px] font-bold text-red-500 ml-1">{errors.password.message}</p>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100 dark:border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="bg-white dark:bg-card px-4 text-slate-400">Or connect with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => handleOAuth("google")}
            disabled={isOAuthLoading !== null}
            className="group flex h-12 w-full items-center justify-center rounded-xl border border-slate-100 dark:border-border bg-white dark:bg-card px-4 py-2 text-sm font-bold text-slate-700 dark:text-foreground transition-all hover:bg-slate-50 dark:hover:bg-secondary hover:border-slate-200"
          >
             {isOAuthLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                </motion.div>
                Continue with Google
              </>
            )}
          </button>
        </div>

        <div className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-muted-foreground uppercase tracking-tight">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
