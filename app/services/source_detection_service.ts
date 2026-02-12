import axios from 'axios'
import * as cheerio from 'cheerio'
import Parser from 'rss-parser'

export interface SourceDetectionResult {
  type: 'rss' | 'scraping'
  feedUrl: string | null
  detectionMethod: string
  originalUrl: string
}

export default class SourceDetectionService {
  private rssParser: Parser
  private readonly RSS_INDICATORS = ['/feed', '/rss', '/atom', '.xml', '/feeds']
  private readonly COMMON_RSS_PATHS = [
    '/feed',
    '/rss',
    '/atom',
    '/feed.xml',
    '/rss.xml',
    '/atom.xml',
    '/index.xml',
    '/feeds/posts/default', // Blogger
  ]

  constructor() {
    this.rssParser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechWatchBot/1.0)',
      },
    })
  }

  /**
   * Détecte le type de source et trouve l'URL du flux RSS si disponible
   */
  async detectSource(url: string): Promise<SourceDetectionResult> {
    const sanitizedUrl = this.sanitizeUrl(url)
    const result: SourceDetectionResult = {
      type: 'scraping',
      feedUrl: null,
      detectionMethod: 'Non déterminé',
      originalUrl: sanitizedUrl,
    }

    try {
      // 1. Vérifier si l'URL est directement un flux RSS
      if (this.isLikelyRssUrl(sanitizedUrl)) {
        const isValid = await this.isValidRssFeed(sanitizedUrl)
        if (isValid) {
          result.type = 'rss'
          result.feedUrl = sanitizedUrl
          result.detectionMethod = 'URL directe'
          return result
        }
      }

      // 2. Chercher un flux RSS dans les métadonnées de la page
      const feedUrl = await this.findRssFeedUrl(sanitizedUrl)
      if (feedUrl) {
        result.type = 'rss'
        result.feedUrl = feedUrl
        result.detectionMethod = 'Balise <link> dans le HTML'
        return result
      }

      // 3. Essayer des URLs communes
      const commonFeedUrl = await this.tryCommonRssPaths(sanitizedUrl)
      if (commonFeedUrl) {
        result.type = 'rss'
        result.feedUrl = commonFeedUrl
        result.detectionMethod = 'URL commune (/feed, /rss, etc.)'
        return result
      }

      // 4. Pas de flux trouvé, utiliser le scraping
      result.type = 'scraping'
      result.feedUrl = null
      result.detectionMethod = 'Aucun flux RSS trouvé'
    } catch (error) {
      console.error('Erreur lors de la détection:', error)
      result.type = 'scraping'
      result.feedUrl = null
      result.detectionMethod = 'Erreur - défaut au scraping'
    }

    return result
  }

  /**
   * Nettoie l'URL
   */
  private sanitizeUrl(url: string): string {
    if (!url) return ''
    return url.replace(/"/g, '').trim()
  }

  /**
   * Vérifie si l'URL ressemble à un flux RSS
   */
  private isLikelyRssUrl(url: string): boolean {
    const lowerUrl = url.toLowerCase()
    return this.RSS_INDICATORS.some((indicator) => lowerUrl.includes(indicator))
  }

  /**
   * Vérifie si une URL est un flux RSS valide
   */
  private async isValidRssFeed(url: string): Promise<boolean> {
    try {
      await this.rssParser.parseURL(url)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Cherche un flux RSS dans les balises <link> de la page
   */
  private async findRssFeedUrl(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TechWatchBot/1.0)',
        },
        timeout: 10000,
      })

      const $ = cheerio.load(response.data)

      const feedLinks = $('link[type*="rss"], link[type*="atom"], link[type*="xml"]')

      for (const feedLink of feedLinks) {
        const href = $(feedLink).attr('href')
        if (href) {
          const absoluteUrl = new URL(href, url).href
          const isValid = await this.isValidRssFeed(absoluteUrl)
          if (isValid) {
            return absoluteUrl
          }
        }
      }

      const alternateLinks = $('link[rel="alternate"]')

      for (const alternateLink of alternateLinks) {
        const type = $(alternateLink).attr('type') || ''
        if (type.includes('rss') || type.includes('atom') || type.includes('xml')) {
          const href = $(alternateLink).attr('href')
          if (href) {
            const absoluteUrl = new URL(href, url).href
            const isValid = await this.isValidRssFeed(absoluteUrl)
            if (isValid) {
              return absoluteUrl
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de flux RSS:', error)
      return null
    }

    return null
  }

  /**
   * Teste les chemins RSS communs
   */
  private async tryCommonRssPaths(url: string): Promise<string | null> {
    try {
      const urlObj = new URL(url)
      const base = `${urlObj.protocol}//${urlObj.host}`

      for (const path of this.COMMON_RSS_PATHS) {
        const testUrl = base + path
        const isValid = await this.isValidRssFeed(testUrl)
        if (isValid) {
          return testUrl
        }
      }
    } catch (error) {
      console.error('URL invalide:', url)
      return null
    }

    return null
  }
}
