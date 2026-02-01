"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"

export async function getRelationships() {
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

    // Fetch relationships and count their contacts, respecting Duress Mode
    const { data: relationships, error } = await supabase
        .from("relationships")
        .select(`
            *,
            contact_relationships(
                contacts(is_emergency_safe)
            )
        `)
        .eq("user_id", user.id)
        .order("name")

    if (error) {
        console.error("Error fetching relationships:", error)
        return []
    }

    return relationships.map(r => {
        let filteredContacts = r.contact_relationships
        if (isDuressActive) {
            filteredContacts = r.contact_relationships.filter((cr: any) => cr.contacts?.is_emergency_safe)
        }
        return {
            ...r,
            count: filteredContacts?.length || 0
        }
    })
}

export async function createRelationship(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase
        .from("relationships")
        .insert([{ name, user_id: user.id }])
        .select()
        .single()

    if (error) {
        console.error("Error creating relationship:", error)
        return { error: error.message }
    }

    revalidatePath("/relationships")
    return { success: true, relationship: data }
}

export async function deleteRelationship(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("relationships")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting relationship:", error)
        return { error: error.message }
    }

    revalidatePath("/relationships")
    return { success: true }
}

export async function addContactToRelationship(contactId: string, relationshipId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("contact_relationships")
        .insert([{ contact_id: contactId, relationship_id: relationshipId }])

    if (error) {
        console.error("Error adding contact to relationship:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    revalidatePath("/relationships")
    return { success: true }
}

export async function removeContactFromRelationship(contactId: string, relationshipId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("contact_relationships")
        .delete()
        .eq("contact_id", contactId)
        .eq("relationship_id", relationshipId)

    if (error) {
        console.error("Error removing contact from relationship:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    revalidatePath("/relationships")
    return { success: true }
}
