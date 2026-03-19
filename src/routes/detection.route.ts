import { Hono } from 'hono'
import {detectSource} from "../services/detection.service.js";

const detectRoute = new Hono()

detectRoute.post('/', async (c) => {
    const url = await c.req.json()

    if (!url || typeof url !== 'string')
        return c.json({ error: 'Le body doit être une URL (string)' }, 400)

    const result = await detectSource(url)

    if (result.type === 'none') {
        return c.json({ error: 'Aucun flux détecté', originalUrl: result.originalUrl }, 404)
    }

    return c.json(result)
})

export default detectRoute