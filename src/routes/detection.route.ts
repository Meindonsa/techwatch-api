import { Hono } from 'hono'
import {detectSource} from "../services/detection.service.js";

const detectRoute = new Hono()

detectRoute.post('/', async (c) => {
    const body = await c.req.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
        return c.json({ error: 'Champ "url" requis' }, 400)
    }

    const result = await detectSource(url)

    if (result.type === 'none') {
        return c.json({ error: 'Aucun flux détecté', originalUrl: result.originalUrl }, 404)
    }

    return c.json(result)
})

export default detectRoute