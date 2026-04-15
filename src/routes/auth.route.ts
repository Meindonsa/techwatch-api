import { Hono } from 'hono'
import { z } from 'zod'
import { getUserByUsername, verifyPassword } from '../repositories/user.repository.js'
import { signToken } from '../services/auth.service.js'

const authRoute = new Hono()

const loginSchema = z.object({
    username: z.string().min(1, 'Le pseudo est requis'),
    password: z.string().min(1, 'Le mot de passe est requis'),
})

// POST /auth/login
authRoute.post('/login', async (c) => {
    const body = await c.req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
        return c.json({ error: parsed.error.issues[0].message }, 400)
    }

    const user = getUserByUsername(parsed.data.username)
    if (!user) {
        return c.json({ error: 'Identifiants invalides' }, 401)
    }

    const valid = await verifyPassword(user.password, parsed.data.password)
    if (!valid) {
        return c.json({ error: 'Identifiants invalides' }, 401)
    }

    const token = await signToken({ userId: user.id, username: user.username })
    const { password: _, ...safeUser } = user

    return c.json({ token, user: safeUser })
})

export default authRoute