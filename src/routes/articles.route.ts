import { Hono } from 'hono'
import {getArticles} from "../services/article.service.js";
import {urlArraySchema} from "../validators/feed.validator.js";
import {FeedError} from "../utils/errors.js";

const articlesRoute = new Hono()

articlesRoute.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = urlArraySchema.safeParse(body)

    if (!parsed.success)
        return c.json({ error: parsed.error.issues[0].message }, 400)

    const results = await Promise.allSettled(parsed.data.map(getArticles))

    const success = []
    const failed = []

    for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled') {
            success.push(result.value)
        } else {
            const err = result.reason
            failed.push({
                feedUrl: parsed.data[i],
                error: err instanceof FeedError ? err.message : 'Erreur inattendue',
                code:  err instanceof FeedError ? err.code   : 'UNKNOWN',
            })
        }
    }

    return c.json({
        total: success.length,
        failed: failed.length > 0 ? failed : undefined,
        feeds: success,
    })
})

export default articlesRoute