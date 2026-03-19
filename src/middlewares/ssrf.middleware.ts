import { createMiddleware } from 'hono/factory'

const BLOCKED_HOSTNAMES = ['localhost', '0.0.0.0']

const PRIVATE_IP_RANGES = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
]

function isBlockedUrl(input: string): boolean {
    try {
        const url = input.startsWith('http') ? input : `https://${input}`
        const { hostname } = new URL(url)

        if (BLOCKED_HOSTNAMES.includes(hostname.toLowerCase())) return true
        if (PRIVATE_IP_RANGES.some((range) => range.test(hostname))) return true

        return false
    } catch {
        return false
    }
}

export const ssrfMiddleware = createMiddleware(async (c, next) => {
    try {
        const body = await c.req.json()

        const urls: string[] = Array.isArray(body) ? body : [body]

        for (const url of urls) {
            if (typeof url === 'string' && isBlockedUrl(url)) {
                return c.json(
                    { error: 'URL non autorisée', code: 'BLOCKED_URL' },
                    403
                )
            }
        }
    } catch {
        // Body non parseable — laisse passer, Zod s'en chargera
    }

    await next()
})