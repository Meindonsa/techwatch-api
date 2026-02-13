import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import RssScannerService from '#services/rss_scanner_service'
import WebScraperService from '#services/web_scraper_service'

export default class ScanSources extends BaseCommand {
  static commandName = 'scan:sources'
  static description = 'Scan all active sources for new articles'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Scan only RSS sources' })
  declare rss: boolean

  @flags.boolean({ description: 'Scan only web scraping sources' })
  declare web: boolean

  @flags.number({ description: 'Scan a specific source by ID' })
  declare sourceId: number

  async run() {
    const rssScanner = new RssScannerService()
    const webScraper = new WebScraperService()

    this.logger.info('🚀 Starting source scan...')

    try {
      if (this.sourceId) {
        // Scanner une source spécifique
        this.logger.info(`📡 Scanning source ID: ${this.sourceId}`)

        const Source = (await import('#models/source')).default
        const source = await Source.findOrFail(this.sourceId)

        if (source.type === 'rss') {
          const result = await rssScanner.scanSource(this.sourceId)
          this.logger.success(`✅ RSS scan complete: ${result.articlesCreated} created`)
        } else {
          const result = await webScraper.scanSource(this.sourceId)
          this.logger.success(`✅ Web scraping complete: ${result.articlesCreated} created`)
        }
      } else if (this.rss) {
        // Scanner uniquement les sources RSS
        this.logger.info('📡 Scanning RSS sources...')
        const results = await rssScanner.scanAllSources()
        this.logger.success(
          `✅ RSS scan complete: ${results.totalCreated} created, ${results.totalUpdated} updated`
        )
      } else if (this.web) {
        // Scanner uniquement les sources web
        this.logger.info('🕷️  Scanning web sources...')
        const results = await webScraper.scanAllSources()
        this.logger.success(`✅ Web scan complete: ${results.totalCreated} created`)
      } else {
        // Scanner toutes les sources
        this.logger.info('📡 Scanning all sources...')

        const rssResults = await rssScanner.scanAllSources()
        const webResults = await webScraper.scanAllSources()

        this.logger.success('✅ Scan complete!')
        this.logger.info(
          `RSS: ${rssResults.totalCreated} created, ${rssResults.totalUpdated} updated`
        )
        this.logger.info(`Web: ${webResults.totalCreated} created`)
        this.logger.info(
          `Total: ${rssResults.totalCreated + webResults.totalCreated} articles created`
        )
      }
    } catch (error) {
      this.logger.error('❌ Scan failed:', error.message)
      this.exitCode = 1
    }
  }
}
