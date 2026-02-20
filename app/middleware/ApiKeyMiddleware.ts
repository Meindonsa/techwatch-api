import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class ApiKeyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    console.log('🔐 ApiKeyMiddleware appelé!')

    const apiKey = request.header('X-API-KEY') || request.input('api_key')
    const validApiKey = env.get('API_KEY')

    console.log('API Key reçue:', apiKey)
    console.log('API Key attendue:', validApiKey)

    if (!apiKey || apiKey !== validApiKey) {
      console.log('❌ API Key invalide ou manquante')
      return response.unauthorized({ message: 'Invalid or missing API key' })
    }

    console.log('✅ API Key valide')
    await next()
  }
}
