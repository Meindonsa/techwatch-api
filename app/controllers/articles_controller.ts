import type { HttpContext } from '@adonisjs/core/http'
import Article from '#models/article'
import { createArticleValidator, listArticlesValidator } from '#validators/article'

export default class ArticlesController {
  async index({ request, response }: HttpContext) {
    const validated = await request.validateUsing(listArticlesValidator)

    const page = validated.page || 1
    const limit = validated.limit || 20

    const query = Article.query().preload('source').orderBy('published_at', 'desc')

    if (validated.source_id) {
      query.where('source_id', validated.source_id)
    }

    if (validated.category) {
      query.where('category', validated.category)
    }

    const articles = await query.paginate(page, limit)

    return response.json(articles)
  }

  async show({ params, response }: HttpContext) {
    const article = await Article.query().where('id', params.id).preload('source').firstOrFail()

    article.viewsCount += 1
    await article.save()

    return response.json(article)
  }

  async featured({ response }: HttpContext) {
    const articles = await Article.query()
      .where('is_featured', true)
      .preload('source')
      .orderBy('published_at', 'desc')
      .limit(10)

    return response.json(articles)
  }

  async recent({ response }: HttpContext) {
    const articles = await Article.query()
      .preload('source')
      .orderBy('published_at', 'desc')
      .limit(20)

    return response.json(articles)
  }

  /**
   * POST /api/articles
   * Create an article
   */
  async store({ request, response }: HttpContext) {
    const data: any = await request.validateUsing(createArticleValidator)

    const existingArticle: Article | null = await Article.findBy('url', data.url)
    if (existingArticle) {
      return response.conflict({
        message: 'Article already exists',
        article: existingArticle,
      })
    }

    const article: Article = await Article.create(data)

    return response.created(article)
  }

  async destroy({ params, response }: HttpContext) {
    const article: Article = await Article.findOrFail(params.id)
    await article.delete()

    return response.noContent()
  }
}
