import { z } from 'zod'

function isValidUrl(val: string): boolean {
    try {
        const url = val.startsWith('http') ? val : `https://${val}`
        const parsed = new URL(url)
        return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(parsed.hostname)
    } catch {
        return false
    }
}

export const urlSchema = z
    .string({ error: 'URL requise' })
    .min(3, 'URL trop courte')
    .refine(isValidUrl, { message: 'URL invalide — ex: dev.to ou https://dev.to/feed' })

export const urlArraySchema = z
    .array(urlSchema, { error: 'Un tableau d\'URLs est requis' })
    .min(1, 'Le tableau ne peut pas être vide')
    .max(20, 'Maximum 20 URLs par requête')