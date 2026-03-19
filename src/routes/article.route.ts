import {Hono} from 'hono'
import {getArticles} from "../services/article.service.js";
import {urlSchema} from "../validators/feed.validator.js";
import {FeedError} from "../utils/errors.js";

const articleRoute = new Hono()

articleRoute.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = urlSchema.safeParse(body)

    if (!parsed.success) {
        return c.json({error: parsed.error.issues[0].message}, 400)
    }

    try {
        const result = await getArticles(parsed.data)
        return c.json(result)
    } catch (e) {
        if (e instanceof FeedError) {
            const status = e.code === 'NOT_FOUND' ? 404 : 422
            return c.json({error: e.message, code: e.code}, status)
        }
        return c.json({error: 'Erreur inattendue'}, 500)
    }
})

export default articleRoute