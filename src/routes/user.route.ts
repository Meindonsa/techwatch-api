import { Hono } from 'hono'
import { z } from 'zod'
import { createUser, getUserById, getUserByUsername, usernameExists } from '../repositories/user.repository.js'
import { getArticlesByUser } from '../repositories/article.repository.js'
import {createUserSchema} from "../validators/feed.validator.js";

const userRoute = new Hono()

// POST /users ✅
userRoute.post('/', async (c) => {
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

// GET /users/check-username?username=xxx ✅
userRoute.get('/check-username', (c) => {
    const username = c.req.query('username')

    if (!username || username.trim() === '')
        return c.json({ error: 'Le paramètre username est requis' }, 400)


    const taken = usernameExists(username.trim())
    return c.json({ username: username.trim(), available: !taken })
})

// GET /users/:id/articles — lister les articles d'un user
userRoute.get('/:id/articles', (c) => {
    const userId = Number(c.req.param('id'))
    const limit = Number(c.req.query('limit') ?? 100)

    const user = getUserById(userId)
    if (!user) return c.json({ error: 'Utilisateur introuvable' }, 404)

    const articles = getArticlesByUser(userId, limit)
    return c.json(articles)
})

export default userRoute