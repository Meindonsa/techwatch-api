import type { HttpContext } from '@adonisjs/core/http'
import Article from '#models/article'

export default class ArticlesController {
  // GET /api/articles - Liste tous les articles avec pagination
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const sourceId = request.input('source_id')
    const category = request.input('category')

    const query = Article.query().preload('source').orderBy('published_at', 'desc')

    if (sourceId) {
      query.where('source_id', sourceId)
    }

    if (category) {
      query.where('category', category)
    }

    const articles = await query.paginate(page, limit)

    return response.json(articles)
  }

  // GET /api/articles/:id - Détails d'un article
  async show({ params, response }: HttpContext) {
    const article = await Article.query().where('id', params.id).preload('source').firstOrFail()

    // Incrémenter le compteur de vues
    article.viewsCount += 1
    await article.save()

    return response.json(article)
  }

  // GET /api/articles/featured - Articles mis en avant
  async featured({ response }: HttpContext) {
    const articles = await Article.query()
      .where('is_featured', true)
      .preload('source')
      .orderBy('published_at', 'desc')
      .limit(10)

    return response.json(articles)
  }

  // GET /api/articles/recent - Articles récents
  async recent({ response }: HttpContext) {
    const articles = await Article.query()
      .preload('source')
      .orderBy('published_at', 'desc')
      .limit(20)

    return response.json(articles)
  }

  // POST /api/articles - Créer un article (utilisé par le scraper)
  async store({ request, response }: HttpContext) {
    const data = request.only([
      'sourceId',
      'title',
      'description',
      'content',
      'url',
      'imageUrl',
      'author',
      'publishedAt',
      'category',
      'tags',
    ])

    // Vérifier si l'article existe déjà (éviter les doublons)
    const existingArticle = await Article.findBy('url', data.url)
    if (existingArticle) {
      return response.conflict({ message: 'Article already exists' })
    }

    const article = await Article.create(data)

    return response.created(article)
  }

  // DELETE /api/articles/:id - Supprimer un article
  async destroy({ params, response }: HttpContext) {
    const article = await Article.findOrFail(params.id)
    await article.delete()

    return response.noContent()
  }
}
