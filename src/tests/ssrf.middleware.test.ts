import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import {ssrfMiddleware} from "../middlewares/ssrf.middleware.js";

const app = new Hono()
app.use('*', ssrfMiddleware)
app.post('/', (c) => c.json({ ok: true }))

describe('ssrfMiddleware', () => {
    it('bloque localhost', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify('http://localhost:8080'),
        })
        expect(res.status).toBe(403)
    })

    it('bloque une IP privée', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify('http://192.168.1.1'),
        })
        expect(res.status).toBe(403)
    })

    it('laisse passer une URL publique', async () => {
        const res = await app.request('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify('https://dev.to'),
        })
        expect(res.status).toBe(200)
    })
})