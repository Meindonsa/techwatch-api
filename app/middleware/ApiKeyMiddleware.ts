import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class ApiKeyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const apiKey = request.header('X-API-KEY') || request.input('api_key')
    const validApiKey = env.get('API_KEY')

    if (!apiKey || apiKey !== validApiKey) {
      return response.unauthorized({ message: 'Invalid or missing API key' })
    }

    await next()
  }
}
