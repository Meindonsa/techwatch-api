import { describe, it, expect, beforeAll } from 'vitest'
import { Hono } from 'hono'
import {authMiddleware} from "../middlewares/auth.middleware.js";

beforeAll(() => {
    process.env.API_SECRET_TOKEN = 'test-token'
})

const app = new Hono()
app.use('*', authMiddleware)
app.post('/', (c) => c.json({ ok: true }))

describe('authMiddleware', () => {
    it('retourne 401 si pas de header Authorization', async () => {
        const res = await app.request('/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify('dev.to'),
        })
        expect(res.status).toBe(403)
    })

    it('retourne 401 si token invalide', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer mauvais-token',
            },
            body: JSON.stringify('dev.to'),
        })
        expect(res.status).toBe(401)
    })

    it('laisse passer si token valide', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer test-token',
            },
            body: JSON.stringify('dev.to'),
        })
        expect(res.status).toBe(200)
    })
})