import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export default class SimpleApiAuthMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const apiKey = request.header('x-api-key')

    if (!apiKey) {
      return response.unauthorized({
        error: 'API key required',
        message: 'Please provide an API key in the X-API-Key header',
      })
    }

    if (apiKey !== env.get('API_KEY')) {
      logger.warn('Failed API authentication attempt', {
        ip: request.ip(),
        userAgent: request.header('user-agent'),
        timestamp: new Date().toISOString(),
      })

      return response.unauthorized({
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
      })
    }

    await next()
  }
}
