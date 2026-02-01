"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"

export async function getEmergencySettings() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from("emergency_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error("Error fetching emergency settings:", error)
        return null
    }

    return data
}

export async function updateEmergencySettings(settings: { enabled?: boolean; pin_hash?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("emergency_settings")
        .upsert({
            user_id: user.id,
            ...settings
        })

    if (error) {
        console.error("Error updating emergency settings:", error)
        return { error: error.message }
    }

    revalidatePath("/settings/emergency")
    return { success: true }
}

export async function resetAllData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // RLS will handle delete permissions, but we'll do it explicitly
    const { error: contactsError } = await supabase
        .from("contacts")
        .delete()
        .eq("user_id", user.id)

    if (contactsError) {
        console.error("Error resetting contacts:", contactsError)
        return { error: contactsError.message }
    }

    revalidatePath("/contacts")
    revalidatePath("/groups")
    return { success: true }
}
