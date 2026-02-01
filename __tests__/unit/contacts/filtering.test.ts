/**
 * Unit Tests for Contact Filtering Logic
 */

import { describe, it, expect } from '@jest/globals'

interface Contact {
    id: string
    first_name: string
    last_name: string
    company?: string
    job_title?: string
    is_favorite: boolean
    is_emergency_safe: boolean
    status: 'new' | 'qualified' | 'contacted'
}

// Filter contacts by search query
function filterContactsBySearch(contacts: Contact[], query: string): Contact[] {
    if (!query) return contacts

    const lowerQuery = query.toLowerCase()

    return contacts.filter(contact => {
        const searchableFields = [
            contact.first_name,
            contact.last_name,
            contact.company || '',
            contact.job_title || '',
        ].map(field => field.toLowerCase())

        return searchableFields.some(field => field.includes(lowerQuery))
    })
}

// Filter contacts by status
function filterContactsByStatus(contacts: Contact[], status: string): Contact[] {
    if (status === 'all') return contacts
    if (status === 'favorites') return contacts.filter(c => c.is_favorite)
    return contacts.filter(c => c.status === status)
}

// Filter contacts for Duress Mode
function filterContactsForDuress(contacts: Contact[]): Contact[] {
    return contacts.filter(c => c.is_emergency_safe)
}

describe('Contact Search Filtering', () => {
    const mockContacts: Contact[] = [
        {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            company: 'Acme Corp',
            job_title: 'CEO',
            is_favorite: false,
            is_emergency_safe: true,
            status: 'new',
        },
        {
            id: '2',
            first_name: 'Alice',
            last_name: 'Smith',
            company: 'Tech Inc',
            job_title: 'Developer',
            is_favorite: true,
            is_emergency_safe: false,
            status: 'qualified',
        },
        {
            id: '3',
            first_name: 'Bob',
            last_name: 'Johnson',
            company: 'Acme Corp',
            job_title: 'Manager',
            is_favorite: false,
            is_emergency_safe: true,
            status: 'contacted',
        },
    ]

    it('should filter by first name', () => {
        const results = filterContactsBySearch(mockContacts, 'john')
        expect(results).toHaveLength(2) // John Doe and Bob Johnson
    })

    it('should filter by last name', () => {
        const results = filterContactsBySearch(mockContacts, 'smith')
        expect(results).toHaveLength(1)
        expect(results[0].first_name).toBe('Alice')
    })

    it('should filter by company', () => {
        const results = filterContactsBySearch(mockContacts, 'acme')
        expect(results).toHaveLength(2)
    })

    it('should filter by job title', () => {
        const results = filterContactsBySearch(mockContacts, 'developer')
        expect(results).toHaveLength(1)
        expect(results[0].first_name).toBe('Alice')
    })

    it('should be case insensitive', () => {
        const results1 = filterContactsBySearch(mockContacts, 'JOHN')
        const results2 = filterContactsBySearch(mockContacts, 'john')
        expect(results1).toEqual(results2)
    })

    it('should return all contacts for empty query', () => {
        const results = filterContactsBySearch(mockContacts, '')
        expect(results).toHaveLength(3)
    })
})

describe('Contact Status Filtering', () => {
    const mockContacts: Contact[] = [
        {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            is_favorite: true,
            is_emergency_safe: true,
            status: 'new',
        },
        {
            id: '2',
            first_name: 'Alice',
            last_name: 'Smith',
            is_favorite: false,
            is_emergency_safe: false,
            status: 'qualified',
        },
        {
            id: '3',
            first_name: 'Bob',
            last_name: 'Johnson',
            is_favorite: true,
            is_emergency_safe: true,
            status: 'contacted',
        },
    ] as Contact[]

    it('should filter by status', () => {
        expect(filterContactsByStatus(mockContacts, 'new')).toHaveLength(1)
        expect(filterContactsByStatus(mockContacts, 'qualified')).toHaveLength(1)
        expect(filterContactsByStatus(mockContacts, 'contacted')).toHaveLength(1)
    })

    it('should filter favorites', () => {
        const results = filterContactsByStatus(mockContacts, 'favorites')
        expect(results).toHaveLength(2)
        expect(results.every(c => c.is_favorite)).toBe(true)
    })

    it('should return all for "all" status', () => {
        const results = filterContactsByStatus(mockContacts, 'all')
        expect(results).toHaveLength(3)
    })
})

describe('Duress Mode Filtering', () => {
    const mockContacts: Contact[] = [
        {
            id: '1',
            first_name: 'Safe',
            last_name: 'Contact',
            is_favorite: false,
            is_emergency_safe: true,
            status: 'new',
        },
        {
            id: '2',
            first_name: 'Unsafe',
            last_name: 'Contact',
            is_favorite: false,
            is_emergency_safe: false,
            status: 'new',
        },
    ] as Contact[]

    it('should only return emergency-safe contacts', () => {
        const results = filterContactsForDuress(mockContacts)
        expect(results).toHaveLength(1)
        expect(results[0].first_name).toBe('Safe')
    })

    it('should return empty array if no safe contacts', () => {
        const unsafeContacts = mockContacts.filter(c => !c.is_emergency_safe)
        const results = filterContactsForDuress(unsafeContacts)
        expect(results).toHaveLength(0)
    })
})
