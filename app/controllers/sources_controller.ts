import type { HttpContext } from '@adonisjs/core/http'
import Source from '#models/source'
import SourceDetectionService from '#services/source_detection_service'
import RssScannerService from '#services/rss_scanner_service'
import WebScraperService from '#services/web_scraper_service'

export default class SourcesController {
  private rssScanner = new RssScannerService()
  private webScraper = new WebScraperService()
  private detectionService = new SourceDetectionService()

  async scan({ params, response }: HttpContext) {
    const source = await Source.findOrFail(params.id)
    let result
    if (source.type === 'rss') {
      result = await this.rssScanner.scanSource(source.id)
    } else {
      result = await this.webScraper.scanSource(source.id)
    }

    return response.json(result)
  }

  async scanAll({ response }: HttpContext) {
    const rssResults = await this.rssScanner.scanAllSources()
    const webResults = await this.webScraper.scanAllSources()

    return response.json({
      rss: rssResults,
      web: webResults,
      total: {
        scanned: rssResults.totalScanned + webResults.totalScanned,
        created: rssResults.totalCreated + webResults.totalCreated,
        updated: rssResults.totalUpdated,
      },
    })
  }

  async store({ request, response }: HttpContext) {
    const { name, url } = request.only(['name', 'url'])
    const detection = await this.detectionService.detectSource(url)

    const source = await Source.create({
      name,
      url,
      type: detection.type,
      rssFeedUrl: detection.feedUrl,
      isActive: true,
      scanFrequency: 30,
    })

    return response.created({
      source,
      detection: {
        method: detection.detectionMethod,
        feedFound: detection.feedUrl !== null,
      },
    })
  }

  async detect({ request, response }: HttpContext) {
    const { url } = request.only(['url'])
    if (!url) return response.badRequest({ message: 'URL required' })

    const detection = await this.detectionService.detectSource(url)
    return response.json(detection)
  }

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

  async destroy({ params, response }: HttpContext) {
    const source = await Source.findOrFail(params.id)
    await source.delete()
    return response.noContent()
  }
}
