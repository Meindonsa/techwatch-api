import { describe, it, expect } from 'vitest'
import {urlArraySchema, urlSchema} from "../validators/feed.validator.js";

describe('urlSchema', () => {
    it('accepte une URL valide sans protocole', () => {
        expect(urlSchema.safeParse('dev.to').success).toBe(true)
    })

    it('accepte une URL valide avec protocole', () => {
        expect(urlSchema.safeParse('https://dev.to/feed').success).toBe(true)
    })

    it('rejette une URL trop courte', () => {
        const result = urlSchema.safeParse('ab')
        expect(result.success).toBe(false)
    })

    it('rejette une URL sans extension', () => {
        const result = urlSchema.safeParse('https://abc')
        expect(result.success).toBe(false)
    })

    it('rejette une URL avec caractères invalides', () => {
        const result = urlSchema.safeParse('pas une url$$%%')
        expect(result.success).toBe(false)
    })
})

describe('urlArraySchema', () => {
    it('accepte un tableau valide', () => {
        expect(urlArraySchema.safeParse(['dev.to', 'nasa.gov']).success).toBe(true)
    })

    it('rejette un tableau vide', () => {
        const result = urlArraySchema.safeParse([])
        expect(result.success).toBe(false)
    })

    it('rejette un tableau de plus de 10 URLs', () => {
        const urls = Array.from({ length: 11 }, (_, i) => `site${i}.com`)
        const result = urlArraySchema.safeParse(urls)
        expect(result.success).toBe(false)
    })

    it('rejette un tableau contenant une URL invalide', () => {
        const result = urlArraySchema.safeParse(['dev.to', 'pas-valide$$'])
        expect(result.success).toBe(false)
    })
})