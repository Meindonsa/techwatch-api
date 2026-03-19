import { createMiddleware } from 'hono/factory'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 60, checkperiod: 10 })

const LIMIT = 60

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
    const ip =
        c.req.header('x-forwarded-for')?.split(',')[0].trim() ??
        c.req.header('x-real-ip') ??
        'unknown'

    const key = `rate:${ip}`
    const current = cache.get<number>(key) ?? 0

    if (current >= LIMIT) {
        return c.json(
            { error: 'Trop de requêtes, réessayez dans une minute', code: 'RATE_LIMIT_EXCEEDED' },
            429
        )
    }

    cache.set(key, current + 1, cache.getTtl(key) ? Math.ceil((cache.getTtl(key)! - Date.now()) / 1000) : 60)

    await next()
})