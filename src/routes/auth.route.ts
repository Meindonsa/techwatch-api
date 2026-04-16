import { Hono } from 'hono'
import { z } from 'zod'
import {createUser, getUserByUsername, verifyPassword} from '../repositories/user.repository.js'
import { signToken } from '../services/auth.service.js'
import {createUserSchema} from "../validators/feed.validator.js";
import userRoute from "./user.route.js";

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

authRoute.post('/register', async (c) => {
    const body = await c.req.json()
    const parsed = createUserSchema.safeParse(body)

    if (!parsed.success)
        return c.json({ error: parsed.error.issues[0].message }, 400)

    try {
        const user = await createUser(parsed.data.username, parsed.data.password)
        const { password: _, ...safeUser } = user
        return c.json(safeUser, 201)
    } catch (e: any) {
        if (e.message?.includes('UNIQUE'))
            return c.json({ error: 'Ce pseudo est déjà pris' }, 409)
        return c.json({ error: 'Erreur inattendue' }, 500)
    }
})

export default authRoute