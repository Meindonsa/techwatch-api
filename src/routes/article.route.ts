import {Hono} from 'hono'
import {getArticles} from "../services/article.service.js";

const articleRoute = new Hono()

articleRoute.post('/', async (c) => {
    const body = await c.req.json()
    const {feedUrl} = body

    if (!feedUrl || typeof feedUrl !== 'string')
        return c.json({error: 'Champ "feedUrl" requis'}, 400)


    try {
        const result = await getArticles(feedUrl)
        return c.json(result)
    } catch (e) {
        return c.json({error: 'Impossible de lire ce flux', feedUrl}, 422)
    }
})

export default articleRoute