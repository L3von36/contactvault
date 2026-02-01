"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"
import { nanoid } from "nanoid"

export async function generateSharedLink(options: {
    resource_id: string
    resource_type: "contact" | "relationship"
    permission?: "view" | "edit"
    expiresInDays?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const token = nanoid(12)
    const expiresAt = options.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null

    const { data, error } = await supabase
        .from("shared_links")
        .insert([{
            owner_id: user.id,
            resource_id: options.resource_id,
            resource_type: options.resource_type,
            permission: options.permission || "view",
            expires_at: expiresAt,
            id: token // Using token as ID for simplicity in paths
        }])
        .select()
        .single()

    if (error) {
        console.error("Error generating shared link:", error)
        return { error: error.message }
    }

    return { success: true, token: data.id }
}

export async function getSharedResource(token: string) {
    const supabase = await createClient()

    // Note: This is a public-facing action
    const { data: link, error: linkError } = await supabase
        .from("shared_links")
        .select("*")
        .eq("id", token)
        .single()

    if (linkError || !link) {
        return { error: "Link not found or expired" }
    }

    // Check expiry
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return { error: "Link has expired" }
    }

    if (link.resource_type === "contact") {
        const { data: contact, error: contactError } = await supabase
            .from("contacts")
            .select("*")
            .eq("id", link.resource_id)
            .single()

        if (contactError) return { error: "Resource not found" }
        return { type: "contact", data: contact }
    } else {
        const { data: relationship, error: relationshipError } = await supabase
            .from("relationships")
            .select(`
        *,
        contacts:contact_relationships(contacts(*))
      `)
            .eq("id", link.resource_id)
            .single()

        if (relationshipError) return { error: "Resource not found" }
        return { type: "relationship", data: relationship }
    }
}

export async function revokeSharedLink(token: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { error } = await supabase
        .from("shared_links")
        .delete()
        .eq("id", token)
        .eq("owner_id", user.id)

    if (error) {
        console.error("Error revoking shared link:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts/shared")
    return { success: true }
}

export async function saveSharedContact(token: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Get the shared resource
    const res = await getSharedResource(token)
    if (res.error || res.type !== "contact") return { error: res.error || "Invalid resource" }

    const contact = res.data

    // Create a copy for the current user
    const { data: newContact, error } = await supabase
        .from("contacts")
        .insert([{
            user_id: user.id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            job_title: contact.job_title,
            company: contact.company,
            phones: contact.phones,
            emails: contact.emails,
            address: contact.address,
            notes: `Saved from shared link (Token: ${token}). Original Labels: ${contact.relationships?.join(", ") || 'None'}`,
            status: "new"
        }])
        .select()
        .single()

    if (error) {
        console.error("Error saving shared contact:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    return { success: true, contactId: newContact.id }
}
