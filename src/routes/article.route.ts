import {Hono} from 'hono'
import {getArticles} from "../services/article.service.js";
import {urlSchema} from "../validators/feed.validator.js";

const articleRoute = new Hono()

articleRoute.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = urlSchema.safeParse(body)

    if (!parsed.success) {
        return c.json({ error: parsed.error.issues[0].message }, 400)
    }

    try {
        const result = await getArticles(parsed.data)
        return c.json(result)
    } catch (e) {
        return c.json({error: 'Impossible de lire ce flux', feedUrl: parsed.data}, 422)
    }
})

export default articleRoute