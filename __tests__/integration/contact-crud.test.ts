/**
 * Integration Test: Contact CRUD Operations
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

interface Contact {
    id?: string
    user_id?: string
    first_name: string
    last_name: string
    phones?: { type: string; number: string }[]
    emails?: { type: string; address: string }[]
    company?: string
    job_title?: string
    is_favorite: boolean
    is_emergency_safe: boolean
    status: 'new' | 'qualified' | 'contacted'
}

// Mock contact store
class ContactStore {
    private contacts: Contact[] = []
    private nextId = 1

    create(contact: Omit<Contact, 'id'>): Contact {
        const newContact = {
            ...contact,
            id: String(this.nextId++),
            user_id: 'test-user',
        }
        this.contacts.push(newContact)
        return newContact
    }

    getAll(): Contact[] {
        return [...this.contacts]
    }

    getById(id: string): Contact | undefined {
        return this.contacts.find(c => c.id === id)
    }

    update(id: string, updates: Partial<Contact>): Contact | null {
        const index = this.contacts.findIndex(c => c.id === id)
        if (index === -1) return null

        this.contacts[index] = { ...this.contacts[index], ...updates }
        return this.contacts[index]
    }

    delete(id: string): boolean {
        const index = this.contacts.findIndex(c => c.id === id)
        if (index === -1) return false

        this.contacts.splice(index, 1)
        return true
    }

    clear(): void {
        this.contacts = []
        this.nextId = 1
    }
}

describe('Contact CRUD Integration', () => {
    let store: ContactStore

    beforeEach(() => {
        store = new ContactStore()
    })

    describe('Create Contact', () => {
        it('should create a new contact', () => {
            const contact = store.create({
                first_name: 'John',
                last_name: 'Doe',
                phones: [{ type: 'mobile', number: '1234567890' }],
                emails: [{ type: 'work', address: 'john@example.com' }],
                is_favorite: false,
                is_emergency_safe: true,
                status: 'new',
            })

            expect(contact.id).toBeDefined()
            expect(contact.first_name).toBe('John')
            expect(contact.last_name).toBe('Doe')
        })

        it('should auto-increment IDs', () => {
            const contact1 = store.create({
                first_name: 'Alice',
                last_name: 'Smith',
                is_favorite: false,
                is_emergency_safe: false,
                status: 'new',
            })

            const contact2 = store.create({
                first_name: 'Bob',
                last_name: 'Johnson',
                is_favorite: false,
                is_emergency_safe: false,
                status: 'new',
            })

            expect(contact1.id).toBe('1')
            expect(contact2.id).toBe('2')
        })
    })

    describe('Read Contacts', () => {
        beforeEach(() => {
            store.create({
                first_name: 'John',
                last_name: 'Doe',
                is_favorite: false,
                is_emergency_safe: true,
                status: 'new',
            })

            store.create({
                first_name: 'Alice',
                last_name: 'Smith',
                is_favorite: true,
                is_emergency_safe: false,
                status: 'qualified',
            })
        })

        it('should get all contacts', () => {
            const contacts = store.getAll()
            expect(contacts).toHaveLength(2)
        })

        it('should get contact by ID', () => {
            const contact = store.getById('1')
            expect(contact).toBeDefined()
            expect(contact?.first_name).toBe('John')
        })

        it('should return undefined for non-existent ID', () => {
            const contact = store.getById('999')
            expect(contact).toBeUndefined()
        })
    })

    describe('Update Contact', () => {
        beforeEach(() => {
            store.create({
                first_name: 'John',
                last_name: 'Doe',
                is_favorite: false,
                is_emergency_safe: true,
                status: 'new',
            })
        })

        it('should update contact fields', () => {
            const updated = store.update('1', {
                first_name: 'Jane',
                is_favorite: true,
            })

            expect(updated?.first_name).toBe('Jane')
            expect(updated?.is_favorite).toBe(true)
            expect(updated?.last_name).toBe('Doe') // Unchanged
        })

        it('should return null for non-existent contact', () => {
            const updated = store.update('999', { first_name: 'Test' })
            expect(updated).toBeNull()
        })
    })

    describe('Delete Contact', () => {
        beforeEach(() => {
            store.create({
                first_name: 'John',
                last_name: 'Doe',
                is_favorite: false,
                is_emergency_safe: true,
                status: 'new',
            })
        })

        it('should delete a contact', () => {
            const deleted = store.delete('1')
            expect(deleted).toBe(true)
            expect(store.getAll()).toHaveLength(0)
        })

        it('should return false for non-existent contact', () => {
            const deleted = store.delete('999')
            expect(deleted).toBe(false)
        })
    })

    describe('Complex Workflows', () => {
        it('should handle create -> update -> delete workflow', () => {
            // Create
            const contact = store.create({
                first_name: 'Test',
                last_name: 'User',
                is_favorite: false,
                is_emergency_safe: false,
                status: 'new',
            })

            expect(store.getAll()).toHaveLength(1)

            // Update
            const updated = store.update(contact.id!, {
                is_favorite: true,
                status: 'qualified',
            })

            expect(updated?.is_favorite).toBe(true)
            expect(updated?.status).toBe('qualified')

            // Delete
            const deleted = store.delete(contact.id!)
            expect(deleted).toBe(true)
            expect(store.getAll()).toHaveLength(0)
        })
    })
})
