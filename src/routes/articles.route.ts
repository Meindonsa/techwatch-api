import { Hono } from 'hono'
import {getArticles} from "../services/article.service.js";

const articlesRoute = new Hono()

articlesRoute.post('/', async (c) => {
    const body = await c.req.json()
    const { feedUrls } = body

    if (!Array.isArray(feedUrls) || feedUrls.length === 0) {
        return c.json({ error: 'Champ "feedUrls" requis (tableau non vide)' }, 400)
    }

    // Promise.allSettled — les erreurs n'arrêtent pas les autres
    const results = await Promise.allSettled(feedUrls.map(getArticles))

    const success = []
    const failed = []

    for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled') {
            success.push(result.value)
        } else {
            failed.push({ feedUrl: feedUrls[i], error: 'Flux inaccessible ou invalide' })
        }
    }

    return c.json({
        total: success.length,
        failed: failed.length > 0 ? failed : undefined,
        feeds: success,
    })
})

export default articlesRoute