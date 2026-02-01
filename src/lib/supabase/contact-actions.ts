"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"

export async function getContacts(options?: { query?: string; tab?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return {
        contacts: [],
        counts: {
            all: 0,
            favorites: 0,
            new: 0,
            qualified: 0,
            contacted: 0
        }
    }

    // Check Duress Mode
    const { data: settings } = await supabase
        .from("emergency_settings")
        .select("enabled")
        .eq("user_id", user.id)
        .single()

    const isDuressActive = settings?.enabled || false

    // First, get counts for each status
    let countQuery = supabase
        .from("contacts")
        .select("status, is_favorite, is_emergency_safe")
        .eq("user_id", user.id)

    if (isDuressActive) {
        countQuery = countQuery.eq("is_emergency_safe", true)
    }

    const { data: countData } = await countQuery

    const counts = {
        all: countData?.length || 0,
        favorites: countData?.filter(c => c.is_favorite).length || 0,
        new: countData?.filter(c => c.status === "new").length || 0,
        qualified: countData?.filter(c => c.status === "qualified").length || 0,
        contacted: countData?.filter(c => c.status === "contacted").length || 0,
    }

    let query = supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)

    if (isDuressActive) {
        query = query.eq("is_emergency_safe", true)
    }

    if (options?.tab === "favorites") {
        query = query.eq("is_favorite", true)
    } else if (options?.tab && options.tab !== "all") {
        query = query.eq("status", options.tab)
    }

    if (options?.query) {
        const searchTerm = `%${options.query}%`
        query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},company.ilike.${searchTerm},job_title.ilike.${searchTerm}`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching contacts:", error)
        return { contacts: [], counts }
    }

    return { contacts: data, counts }
}

export async function createContact(formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { group_ids, ...data } = formData
    const { data: contact, error } = await supabase
        .from("contacts")
        .insert([{
            ...data,
            user_id: user.id
        }])
        .select()
        .single()

    if (error) {
        console.error("Error creating contact:", error)
        return { error: error.message }
    }

    if (group_ids && group_ids.length > 0) {
        const groupInserts = group_ids.map((gid: string) => ({
            contact_id: contact.id,
            group_id: gid
        }))
        await supabase.from("contact_groups").insert(groupInserts)
    }

    revalidatePath("/contacts")
    revalidatePath("/groups")
    return { success: true }
}

export async function updateContact(id: string, formData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const { group_ids, ...data } = formData
    const { error } = await supabase
        .from("contacts")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error updating contact:", error)
        return { error: error.message }
    }

    // Sync groups
    if (group_ids !== undefined) {
        // Simple sync: delete all and re-add
        await supabase.from("contact_groups").delete().eq("contact_id", id)
        if (group_ids.length > 0) {
            const groupInserts = group_ids.map((gid: string) => ({
                contact_id: id,
                group_id: gid
            }))
            await supabase.from("contact_groups").insert(groupInserts)
        }
    }

    revalidatePath("/contacts")
    revalidatePath(`/contacts/${id}`)
    revalidatePath("/groups")
    return { success: true }
}

export async function deleteContact(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting contact:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    return { success: true }
}

export async function toggleFavorite(id: string, is_favorite: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from("contacts")
        .update({ is_favorite })
        .eq("id", id)

    if (error) {
        console.error("Error toggling favorite:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    return { success: true }
}
export async function bulkCreateContacts(contacts: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const contactsWithUser = contacts.map(c => ({
        ...c,
        user_id: user.id
    }))

    const { error } = await supabase
        .from("contacts")
        .insert(contactsWithUser)

    if (error) {
        console.error("Error bulk creating contacts:", error)
        return { error: error.message }
    }

    revalidatePath("/contacts")
    return { success: true, count: contactsWithUser.length }
}
export async function getContact(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Check Duress Mode
    const { data: settings } = await supabase
        .from("emergency_settings")
        .select("enabled")
        .eq("user_id", user.id)
        .single()

    const isDuressActive = settings?.enabled || false

    const { data: contactData, error } = await supabase
        .from("contacts")
        .select(`
            *,
            groups:contact_groups(group_id, groups(name))
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

    if (error) {
        console.error("Error fetching contact:", error)
        return null
    }

    // Hide if Duress active and not safe
    if (isDuressActive && !contactData.is_emergency_safe) {
        return null
    }

    return {
        ...contactData,
        group_ids: contactData.groups?.map((g: any) => g.group_id) || [],
        groups: contactData.groups?.map((g: any) => g.groups?.name).filter(Boolean) || []
    }
}
