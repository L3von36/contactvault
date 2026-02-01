"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "./server"

export async function login(formData: any) {
    const supabase = await createClient()

    const data = {
        email: formData.email,
        password: formData.password,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/contacts")
}

export async function signup(formData: any) {
    const supabase = await createClient()

    const data = {
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                first_name: formData.first_name,
                last_name: formData.last_name,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
}

export async function signInWithOAuth(provider: "google") {
    const supabase = await createClient()
    const headerList = await headers()
    const host = headerList.get("x-forwarded-host") || headerList.get("host")
    const protocol = host?.includes("localhost") ? "http" : "https"
    const siteUrl = `${protocol}://${host}`

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${siteUrl}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}
