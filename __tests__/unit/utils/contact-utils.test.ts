/**
 * Unit Tests for Contact Utility Functions
 */

import { describe, it, expect } from '@jest/globals'

// Phone number formatting
function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Format as (XXX) XXX-XXXX for 10-digit numbers
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }

    // Return original if not 10 digits
    return phone
}

// Email validation
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Get initials from name
function getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return `${first}${last}` || '?'
}

describe('Phone Number Formatting', () => {
    it('should format 10-digit phone numbers', () => {
        expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
        expect(formatPhoneNumber('5555551234')).toBe('(555) 555-1234')
    })

    it('should handle phone numbers with formatting', () => {
        expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890')
        expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890')
        expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890')
    })

    it('should return original for non-10-digit numbers', () => {
        expect(formatPhoneNumber('12345')).toBe('12345')
        expect(formatPhoneNumber('123456789012')).toBe('123456789012')
    })
})

describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
        expect(isValidEmail('first+last@company.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid')).toBe(false)
        expect(isValidEmail('@example.com')).toBe(false)
        expect(isValidEmail('user@')).toBe(false)
        expect(isValidEmail('user @example.com')).toBe(false)
        expect(isValidEmail('')).toBe(false)
    })
})

describe('Get Initials', () => {
    it('should get initials from full name', () => {
        expect(getInitials('John', 'Doe')).toBe('JD')
        expect(getInitials('Alice', 'Smith')).toBe('AS')
    })

    it('should handle single names', () => {
        expect(getInitials('John', '')).toBe('J')
        expect(getInitials('', 'Doe')).toBe('D')
        expect(getInitials('John')).toBe('J')
    })

    it('should handle missing names', () => {
        expect(getInitials('', '')).toBe('?')
        expect(getInitials()).toBe('?')
    })

    it('should handle lowercase names', () => {
        expect(getInitials('john', 'doe')).toBe('JD')
    })
})
