import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import {rateLimitMiddleware} from "../middlewares/rate-limit.middleware.js";

const app = new Hono()
app.use('*', rateLimitMiddleware)
app.get('/', (c) => c.json({ ok: true }))

describe('rateLimitMiddleware', () => {
    it('laisse passer les requêtes sous la limite', async () => {
        const res = await app.request('/', {
            headers: { 'x-real-ip': '1.2.3.4' },
        })
        expect(res.status).toBe(200)
    })

    it('bloque après 60 requêtes depuis la même IP', async () => {
        const ip = '5.6.7.8'
        const headers = { 'x-real-ip': ip }

        for (let i = 0; i < 60; i++) {
            await app.request('/', { headers })
        }

        const res = await app.request('/', { headers })
        expect(res.status).toBe(429)
    })
})