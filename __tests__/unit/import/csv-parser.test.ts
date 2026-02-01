/**
 * Unit Tests for CSV Import Parsing
 */

import { describe, it, expect } from '@jest/globals'

interface Contact {
    first_name?: string
    last_name?: string
    phones?: { type: string; number: string }[]
    emails?: { type: string; address: string }[]
    company?: string
    job_title?: string
}

// CSV to Contact parser (simplified version)
function parseCSVRow(row: Record<string, string>): Contact {
    const contact: Contact = {
        first_name: row['First Name'] || row['first_name'] || '',
        last_name: row['Last Name'] || row['last_name'] || '',
        company: row['Company'] || row['company'] || '',
        job_title: row['Job Title'] || row['job_title'] || '',
        phones: [],
        emails: [],
    }

    // Parse phone
    const phone = row['Phone'] || row['phone'] || row['Mobile'] || row['mobile']
    if (phone) {
        contact.phones = [{ type: 'mobile', number: phone }]
    }

    // Parse email
    const email = row['Email'] || row['email']
    if (email) {
        contact.emails = [{ type: 'work', address: email }]
    }

    return contact
}

describe('CSV Import Parsing', () => {
    it('should parse basic contact data', () => {
        const row = {
            'First Name': 'John',
            'Last Name': 'Doe',
            'Email': 'john@example.com',
            'Phone': '1234567890',
        }

        const contact = parseCSVRow(row)

        expect(contact.first_name).toBe('John')
        expect(contact.last_name).toBe('Doe')
        expect(contact.emails).toHaveLength(1)
        expect(contact.emails?.[0].address).toBe('john@example.com')
        expect(contact.phones).toHaveLength(1)
        expect(contact.phones?.[0].number).toBe('1234567890')
    })

    it('should handle lowercase column names', () => {
        const row = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice@example.com',
        }

        const contact = parseCSVRow(row)

        expect(contact.first_name).toBe('Alice')
        expect(contact.last_name).toBe('Smith')
        expect(contact.emails?.[0].address).toBe('alice@example.com')
    })

    it('should handle company and job title', () => {
        const row = {
            'First Name': 'Bob',
            'Last Name': 'Johnson',
            'Company': 'Acme Corp',
            'Job Title': 'CEO',
        }

        const contact = parseCSVRow(row)

        expect(contact.company).toBe('Acme Corp')
        expect(contact.job_title).toBe('CEO')
    })

    it('should handle missing fields gracefully', () => {
        const row = {
            'First Name': 'Jane',
        }

        const contact = parseCSVRow(row)

        expect(contact.first_name).toBe('Jane')
        expect(contact.last_name).toBe('')
        expect(contact.phones).toHaveLength(0)
        expect(contact.emails).toHaveLength(0)
    })

    it('should handle alternative phone column names', () => {
        const row1 = {
            'First Name': 'Test',
            'mobile': '5555551234',
        }

        const row2 = {
            'First Name': 'Test',
            'Mobile': '5555551234',
        }

        const contact1 = parseCSVRow(row1)
        const contact2 = parseCSVRow(row2)

        expect(contact1.phones?.[0].number).toBe('5555551234')
        expect(contact2.phones?.[0].number).toBe('5555551234')
    })
})
