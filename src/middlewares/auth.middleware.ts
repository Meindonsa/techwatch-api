import { createMiddleware } from 'hono/factory'

export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Access denied' }, 403)
    }

    const token = authHeader.split(' ')[1]

    if (token !== process.env.API_SECRET_TOKEN) {
        return c.json({ error: 'Token invalide' }, 401)
    }

    await next()
})