// app/services/web_scraper_service.ts
import axios from 'axios'
import * as cheerio from 'cheerio'
import Source from '#models/source'
import Article from '#models/article'
import { DateTime } from 'luxon'

interface ScrapingConfig {
  articleSelector: string // Sélecteur CSS pour trouver les articles
  titleSelector: string // Sélecteur pour le titre
  linkSelector: string // Sélecteur pour le lien
  descriptionSelector?: string // Sélecteur pour la description
  imageSelector?: string // Sélecteur pour l'image
  dateSelector?: string // Sélecteur pour la date
  authorSelector?: string // Sélecteur pour l'auteur
}

export default class WebScraperService {
  /**
   * Scanne une source web et crée les articles
   */
  async scanSource(sourceId: number): Promise<{
    success: boolean
    articlesCreated: number
    errors: string[]
  }> {
    const result = {
      success: false,
      articlesCreated: 0,
      errors: [] as string[],
    }

    try {
      const source = await Source.findOrFail(sourceId)

      if (source.type !== 'scraping') {
        result.errors.push('Source is not scraping type')
        return result
      }

      if (!source.scrapingConfig) {
        result.errors.push('No scraping configuration found')
        return result
      }

      const config: ScrapingConfig = JSON.parse(source.scrapingConfig)

      console.log(`🕷️  Scraping web source: ${source.name} (${source.url})`)

      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TechWatchBot/1.0)',
        },
        timeout: 15000,
      })

      const $ = cheerio.load(response.data)
      const articles = $(config.articleSelector)

      console.log(`📄 Found ${articles.length} articles on page`)

      for (let i = 0; i < articles.length; i++) {
        try {
          const article = $(articles[i])

          // Extraire les données
          const title = article.find(config.titleSelector).text().trim()
          const relativeLink = article.find(config.linkSelector).attr('href')

          if (!title || !relativeLink) {
            console.warn('⚠️  Article without title or link, skipping')
            continue
          }

          // Construire l'URL absolue
          const absoluteUrl = new URL(relativeLink, source.url).href

          // Vérifier si l'article existe déjà
          const existingArticle = await Article.findBy('url', absoluteUrl)
          if (existingArticle) {
            console.log(`⏭️  Article already exists: ${title}`)
            continue
          }

          // Extraire les données optionnelles
          const description = config.descriptionSelector
            ? article.find(config.descriptionSelector).text().trim()
            : null

          const imageUrl = config.imageSelector
            ? article.find(config.imageSelector).attr('src') ||
              article.find(config.imageSelector).attr('data-src')
            : null

          const author = config.authorSelector
            ? article.find(config.authorSelector).text().trim()
            : null

          let publishedAt = null
          if (config.dateSelector) {
            const dateText = article.find(config.dateSelector).text().trim()
            publishedAt = this.parseDate(dateText)
          }

          // Créer l'article
          await Article.create({
            sourceId: source.id,
            title,
            description: description ? description.substring(0, 500) : null,
            url: absoluteUrl,
            imageUrl: imageUrl ? new URL(imageUrl, source.url).href : null,
            author,
            publishedAt,
          })

          result.articlesCreated++
          console.log(`✅ Created: ${title}`)
        } catch (itemError) {
          console.error('Error processing article:', itemError)
          result.errors.push(`Error processing article: ${itemError.message}`)
        }
      }

      // Mettre à jour la source
      source.lastScannedAt = DateTime.now()
      source.articlesCount = await source
        .related('articles')
        .query()
        .count('* as total')
        .then((r) => r[0].$extras.total)
      await source.save()

      result.success = true
      console.log(`✨ Scraping complete: ${result.articlesCreated} articles created`)
    } catch (error) {
      console.error('Error scraping web source:', error)
      result.errors.push(error.message)
    }

    return result
  }

  /**
   * Scanne toutes les sources web actives
   */
  async scanAllSources(): Promise<{
    totalScanned: number
    totalCreated: number
    errors: string[]
  }> {
    const summary = {
      totalScanned: 0,
      totalCreated: 0,
      errors: [] as string[],
    }

    const sources = await Source.query().where('type', 'scraping').where('is_active', true)

    console.log(`🕷️  Scraping ${sources.length} web sources...`)

    for (const source of sources) {
      const result = await this.scanSource(source.id)
      summary.totalScanned++
      summary.totalCreated += result.articlesCreated
      summary.errors.push(...result.errors)

      // Pause entre chaque source
      await this.sleep(3000)
    }

    console.log(`🎉 Scraping complete: ${summary.totalCreated} articles created`)

    return summary
  }

  /**
   * Parse une date depuis différents formats
   */
  private parseDate(dateString: string): DateTime | null {
    if (!dateString) return null

    try {
      // Essayer format ISO
      let date = DateTime.fromISO(dateString)
      if (date.isValid) return date

      // Essayer format HTTP
      date = DateTime.fromHTTP(dateString)
      if (date.isValid) return date

      // Essayer format SQL
      date = DateTime.fromSQL(dateString)
      if (date.isValid) return date

      // Essayer format JS Date
      date = DateTime.fromJSDate(new Date(dateString))
      if (date.isValid) return date

      return null
    } catch {
      return null
    }
  }

  /**
   * Pause utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Génère une configuration de scraping de base pour un site
   */
  generateDefaultConfig(url: string): ScrapingConfig {
    // Configurations par défaut pour des sites connus
    const domain = new URL(url).hostname

    if (domain.includes('medium.com')) {
      return {
        articleSelector: 'article',
        titleSelector: 'h2',
        linkSelector: 'a',
        descriptionSelector: 'h3',
        imageSelector: 'img',
        authorSelector: '.author',
      }
    }

    // Configuration générique
    return {
      articleSelector: 'article, .post, .article, .entry',
      titleSelector: 'h1, h2, h3, .title, .post-title',
      linkSelector: 'a',
      descriptionSelector: '.excerpt, .summary, p',
      imageSelector: 'img',
    }
  }
}
