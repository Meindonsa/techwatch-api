import Parser from 'rss-parser'
import Source from '#models/source'
import Article from '#models/article'
import { DateTime } from 'luxon'

export default class RssScannerService {
  private rssParser: Parser

  constructor() {
    this.rssParser = new Parser({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechWatchBot/1.0)',
      },
      customFields: {
        item: [
          ['media:content', 'media'],
          ['content:encoded', 'contentEncoded'],
          ['description', 'description'],
        ],
      },
    })
  }

  async scanSource(sourceId: number): Promise<{
    success: boolean
    articlesCreated: number
    articlesUpdated: number
    errors: string[]
  }> {
    const result = {
      success: false,
      articlesCreated: 0,
      articlesUpdated: 0,
      errors: [] as string[],
    }

    try {
      const source = await Source.findOrFail(sourceId)

      if (source.type !== 'rss') {
        result.errors.push('Source is not RSS type')
        return result
      }

      if (!source.rssFeedUrl) {
        result.errors.push('No RSS feed URL configured')
        return result
      }

      console.log(`📡 Scanning RSS feed: ${source.name} (${source.rssFeedUrl})`)

      const feed = await this.rssParser.parseURL(source.rssFeedUrl)

      console.log(`📰 Found ${feed.items.length} items in feed`)

      for (const item of feed.items) {
        try {
          if (!item.link) {
            console.warn('⚠️  Item without link, skipping')
            continue
          }

          const existingArticle = await Article.findBy('url', item.link)

          if (existingArticle) {
            let updated = false

            if (item.title && item.title !== existingArticle.title) {
              existingArticle.title = item.title
              updated = true
            }

            if (updated) {
              await existingArticle.save()
              result.articlesUpdated++
              console.log(`🔄 Updated: ${item.title}`)
            }
          } else {
            const articleData = this.extractArticleData(item, source.id)
            await Article.create(articleData)
            result.articlesCreated++
            console.log(`✅ Created: ${item.title}`)
          }
        } catch (itemError) {
          console.error('Error processing item:', itemError)
          result.errors.push(`Error with item "${item.title}": ${itemError.message}`)
        }
      }

      source.lastScannedAt = DateTime.now()
      source.articlesCount = await source
        .related('articles')
        .query()
        .count('* as total')
        .then((r) => r[0].$extras.total)
      await source.save()

      result.success = true
      console.log(
        `✨ Scan complete: ${result.articlesCreated} created, ${result.articlesUpdated} updated`
      )
    } catch (error) {
      console.error('Error scanning RSS source:', error)
      result.errors.push(error.message)
    }

    return result
  }

  async scanAllSources(): Promise<{
    totalScanned: number
    totalCreated: number
    totalUpdated: number
    errors: string[]
  }> {
    const summary = {
      totalScanned: 0,
      totalCreated: 0,
      totalUpdated: 0,
      errors: [] as string[],
    }

    const sources = await Source.query().where('type', 'rss').where('is_active', true)

    console.log(`🔍 Scanning ${sources.length} RSS sources...`)

    for (const source of sources) {
      const result = await this.scanSource(source.id)
      summary.totalScanned++
      summary.totalCreated += result.articlesCreated
      summary.totalUpdated += result.articlesUpdated
      summary.errors.push(...result.errors)

      await this.sleep(2000)
    }

    console.log(
      `🎉 Scan complete: ${summary.totalCreated} articles created, ${summary.totalUpdated} updated`
    )

    return summary
  }

  private extractArticleData(item: any, sourceId: number) {
    let imageUrl = null
    if (item.enclosure?.url) {
      imageUrl = item.enclosure.url
    } else if (item.media?.$ && item.media.$.url) {
      imageUrl = item.media.$.url
    } else if (item['media:thumbnail']?.$?.url) {
      imageUrl = item['media:thumbnail'].$.url
    }

    let content = null
    if (item.contentEncoded) {
      content = this.stripHtml(item.contentEncoded)
    } else if (item.content) {
      content = this.stripHtml(item.content)
    }

    let description = null
    if (item.description) {
      description = this.stripHtml(item.description)
    } else if (item.summary) {
      description = this.stripHtml(item.summary)
    }

    let publishedAt = null
    if (item.pubDate) {
      publishedAt = DateTime.fromJSDate(new Date(item.pubDate))
    } else if (item.isoDate) {
      publishedAt = DateTime.fromISO(item.isoDate)
    }

    let category = null
    let tags: string[] | null = null
    if (item.categories && item.categories.length > 0) {
      category = item.categories[0]
      tags = item.categories
    }

    return {
      sourceId,
      title: this.sanitizeText(item.title) || 'Sans titre',
      description: description ? description.substring(0, 500) : null,
      content: content ? content.substring(0, 5000) : null,
      url: item.link,
      imageUrl,
      author: this.sanitizeText(item.creator || item.author || null),
      publishedAt,
      category,
      tags,
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
  }

  private sanitizeText(text: string | null): string | null {
    if (!text) return null
    return this.stripHtml(text)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
