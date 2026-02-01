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

    // If enabling, ensure a PIN exists
    if (settings.enabled === true) {
        const { data: current } = await supabase
            .from("emergency_settings")
            .select("pin_hash")
            .eq("user_id", user.id)
            .single()

        if (!current?.pin_hash && !settings.pin_hash) {
            return { error: "Security PIN must be set before enabling Panic Mode" }
        }
    }

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

    // Complete cleanup of user data
    const tables = ["shared_links", "contact_relationships", "relationships", "contacts"]

    for (const table of tables) {
        const column = table === "shared_links" ? "owner_id" : "user_id"
        // Note: contact_relationships are handled by cascade or junction policy
        if (table === "contact_relationships") continue;

        const { error } = await supabase
            .from(table)
            .delete()
            .eq(column, user.id)

        if (error) {
            console.error(`Error resetting ${table}:`, error)
            return { error: error.message }
        }
    }

    revalidatePath("/contacts")
    revalidatePath("/relationships")
    revalidatePath("/", "layout")
    return { success: true }
}
