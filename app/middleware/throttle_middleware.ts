// app/middleware/throttle_middleware.ts
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

interface ThrottleOptions {
  requests: number
  duration: string
}

export default class ThrottleMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn, options: ThrottleOptions) {
    const ip = request.ip()
    const key = `throttle:${ip}`

    const durationSeconds = this.parseDuration(options.duration)
    const now = DateTime.now()
    const expiresAt = now.plus({ seconds: durationSeconds })

    try {
      // Nettoyer les entrées expirées
      await db.from('rate_limits').where('expire_at', '<', now.toJSDate()).delete()

      // Récupérer l'entrée
      const record = await db
        .from('rate_limits')
        .where('key', key)
        .where('expire_at', '>', now.toJSDate())
        .first()

      if (record) {
        // Vérifier limite
        if (record.points >= options.requests) {
          const expiresAtDate = DateTime.fromJSDate(record.expire_at)
          const retryAfter = Math.ceil(expiresAtDate.diff(now, 'seconds').seconds)

          logger.warn('⚠️ Rate limit exceeded', {
            ip,
            path: request.url(),
            points: record.points,
            limit: options.requests,
          })

          response.header('X-RateLimit-Limit', options.requests.toString())
          response.header('X-RateLimit-Remaining', '0')
          response.header('Retry-After', retryAfter.toString())

          return response.tooManyRequests({
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          })
        }

        // Incrémenter
        await db.from('rate_limits').where('key', key).increment('points', 1)

        const remaining = options.requests - (record.points + 1)

        response.header('X-RateLimit-Limit', options.requests.toString())
        response.header('X-RateLimit-Remaining', remaining.toString())

        console.log(`✅ Request allowed: ${record.points + 1}/${options.requests}`)
      } else {
        // Créer
        await db.table('rate_limits').insert({
          key,
          points: 1,
          expire_at: expiresAt.toJSDate(),
        })

        response.header('X-RateLimit-Limit', options.requests.toString())
        response.header('X-RateLimit-Remaining', (options.requests - 1).toString())

        console.log(`✅ First request: 1/${options.requests}`)
      }

      await next()
    } catch (error) {
      logger.error('Throttle error', { error: error.message })
      await next()
    }
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)\s*(sec|min|hour|day)s?$/i)
    if (!match) return 60

    const value = parseInt(match[1], 10)
    const unit = match[2].toLowerCase()

    const multipliers: Record<string, number> = {
      sec: 1,
      min: 60,
      hour: 3600,
      day: 86400,
    }

    return value * (multipliers[unit] || 60)
  }
}
