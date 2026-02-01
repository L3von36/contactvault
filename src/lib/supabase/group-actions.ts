"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"

export async function getGroups() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Check Duress Mode
    const { data: settings } = await supabase
        .from("emergency_settings")
        .select("enabled")
        .eq("user_id", user.id)
        .single()

    const isDuressActive = settings?.enabled || false

    // Fetch groups and count their contacts, respecting Duress Mode
    const { data: groups, error } = await supabase
        .from("groups")
        .select(`
            *,
            contact_groups(
                contacts(is_emergency_safe)
            )
        `)
        .eq("user_id", user.id)
        .order("name")

    if (error) {
        console.error("Error fetching groups:", error)
        return []
    }

    return groups.map(g => {
        let filteredContacts = g.contact_groups
        if (isDuressActive) {
            filteredContacts = g.contact_groups.filter((cg: any) => cg.contacts?.is_emergency_safe)
        }
        return {
            ...g,
            count: filteredContacts?.length || 0
        }
    })
}

export async function createGroup(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
        .from("groups")
        .insert([{ name, user_id: user.id }])
        .select()
        .single()

    if (error) {
        console.error("Error creating group:", error)
        return { error: error.message }
    }

    revalidatePath("/groups")
    return { success: true, group: data }
}

export async function deleteGroup(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("groups")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting group:", error)
        return { error: error.message }
    }

    revalidatePath("/groups")
    return { success: true }
}

export async function addContactToGroup(contactId: string, groupId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("contact_groups")
        .insert([{ contact_id: contactId, group_id: groupId }])

    if (error) {
        console.error("Error adding contact to group:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    revalidatePath("/groups")
    return { success: true }
}

export async function removeContactFromGroup(contactId: string, groupId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("contact_groups")
        .delete()
        .eq("contact_id", contactId)
        .eq("group_id", groupId)

    if (error) {
        console.error("Error removing contact from group:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    revalidatePath("/groups")
    return { success: true }
}
