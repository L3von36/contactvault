/**
 * Unit Tests for Duress Mode PIN Hashing
 */

import { describe, it, expect } from '@jest/globals'

// Simple hash function for testing (matches the one used in the app)
function hashPin(pin: string): string {
    let hash = 0
    for (let i = 0; i < pin.length; i++) {
        const char = pin.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
}

describe('Duress Mode PIN Hashing', () => {
    it('should hash a 6-digit PIN consistently', () => {
        const pin = '123456'
        const hash1 = hashPin(pin)
        const hash2 = hashPin(pin)

        expect(hash1).toBe(hash2)
        expect(hash1).toBeTruthy()
    })

    it('should produce different hashes for different PINs', () => {
        const pin1 = '123456'
        const pin2 = '654321'

        const hash1 = hashPin(pin1)
        const hash2 = hashPin(pin2)

        expect(hash1).not.toBe(hash2)
    })

    it('should handle edge cases', () => {
        expect(hashPin('000000')).toBeTruthy()
        expect(hashPin('999999')).toBeTruthy()
        expect(hashPin('111111')).toBeTruthy()
    })

    it('should produce numeric string output', () => {
        const hash = hashPin('123456')
        expect(typeof hash).toBe('string')
        expect(Number.isNaN(Number(hash))).toBe(false)
    })
})

describe('PIN Validation', () => {
    function isValidPin(pin: string): boolean {
        return /^\d{6}$/.test(pin)
    }

    it('should validate 6-digit PINs', () => {
        expect(isValidPin('123456')).toBe(true)
        expect(isValidPin('000000')).toBe(true)
        expect(isValidPin('999999')).toBe(true)
    })

    it('should reject invalid PINs', () => {
        expect(isValidPin('12345')).toBe(false)   // Too short
        expect(isValidPin('1234567')).toBe(false) // Too long
        expect(isValidPin('12345a')).toBe(false)  // Contains letter
        expect(isValidPin('')).toBe(false)        // Empty
        expect(isValidPin('abc123')).toBe(false)  // Mixed
    })
})
