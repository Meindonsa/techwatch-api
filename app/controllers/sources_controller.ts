import type { HttpContext } from '@adonisjs/core/http'
import Source from '#models/source'

export default class SourcesController {
  // GET /api/sources - Liste toutes les sources
  async index({ response }: HttpContext) {
    const sources = await Source.query().orderBy('created_at', 'desc')

    return response.json(sources)
  }

  async show({ params, response }: HttpContext) {
    const source = await Source.query()
      .where('id', params.id)
      .preload('articles', (query) => {
        query.orderBy('published_at', 'desc').limit(20)
      })
      .firstOrFail()

    return response.json(source)
  }

  // POST /api/sources - Créer une nouvelle source
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'name',
      'url',
      'logoUrl',
      'type',
      'rssFeedUrl',
      'scrapingConfig',
      'scanFrequency',
    ])

    const source = await Source.create(data)

    return response.created(source)
  }

  // PUT /api/sources/:id - Mettre à jour une source
  async update({ params, request, response }: HttpContext) {
    const source = await Source.findOrFail(params.id)

    const data = request.only([
      'name',
      'url',
      'logoUrl',
      'type',
      'rssFeedUrl',
      'scrapingConfig',
      'scanFrequency',
      'isActive',
    ])

    source.merge(data)
    await source.save()

    return response.json(source)
  }

  // DELETE /api/sources/:id - Supprimer une source
  async destroy({ params, response }: HttpContext) {
    const source = await Source.findOrFail(params.id)
    await source.delete()

    return response.noContent()
  }

  // GET /api/sources/:id/articles - Articles d'une source
  async articles({ params, request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const articles = await Source.query()
      .where('id', params.id)
      .firstOrFail()
      .then((source) =>
        source.related('articles').query().orderBy('published_at', 'desc').paginate(page, limit)
      )

    return response.json(articles)
  }
}
