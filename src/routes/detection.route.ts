import { Hono } from 'hono'
import {detectSource} from "../services/detection.service.js";
import { urlSchema } from "../validators/feed.validator.js";

const detectRoute = new Hono()

detectRoute.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = urlSchema.safeParse(body)

    if (!parsed.success)
        return c.json({ error: parsed.error.issues[0].message }, 400)

    const result = await detectSource(parsed.data)

    if (result.type === 'none') {
        return c.json({ error: 'Aucun flux détecté', originalUrl: result.originalUrl }, 404)
    }

    return c.json(result)
})

export default detectRoute