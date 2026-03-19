import { Hono } from 'hono'
import {detectSource, type SourceDetectionResult} from "../services/detection.service.js";
import { urlSchema } from "../validators/feed.validator.js";
import {getFromCache, setInCache} from "../services/cache.service.js";

const detectRoute = new Hono()

detectRoute.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = urlSchema.safeParse(body)

    if (!parsed.success)
        return c.json({ error: parsed.error.issues[0].message }, 400)

    const url = parsed.data
    const cacheKey = `check:${url}`
    const cached = getFromCache<SourceDetectionResult>(cacheKey)

    if (cached) return c.json({ ...cached, fromCache: true })


    const result = await detectSource(parsed.data)

    if (result.type === 'none') {
        return c.json({ error: 'Aucun flux détecté', originalUrl: result.originalUrl }, 404)
    }

    setInCache(cacheKey, result)
    return c.json({...result, fromCache: false })
})

export default detectRoute