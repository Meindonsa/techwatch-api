import cron from 'node-cron'
import RssScannerService from '#services/rss_scanner_service'
import WebScraperService from '#services/web_scraper_service'
import Source from '#models/source'
import { DateTime } from 'luxon'

export default class ScanSchedulerService {
  private rssScanner: RssScannerService
  private webScraper: WebScraperService
  private tasks: Map<string, cron.ScheduledTask> = new Map()
  private isRunning = false

  constructor() {
    this.rssScanner = new RssScannerService()
    this.webScraper = new WebScraperService()
  }

  /**
   * Démarre le scheduler principal
   * Scanne toutes les sources toutes les 30 minutes par défaut
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler is already running')
      return
    }

    console.log('🚀 Starting scan scheduler...')

    // Tâche principale : scan global toutes les 30 minutes
    const globalTask = cron.schedule('*/30 * * * *', async () => {
      console.log('⏰ Running scheduled scan...')
      await this.runScheduledScans()
    })

    this.tasks.set('global', globalTask)
    this.isRunning = true

    console.log('✅ Scheduler started - will run every 30 minutes')
    console.log('📅 Next run:', this.getNextRunTime())

    // Optionnel : Premier scan immédiat au démarrage
    // this.runScheduledScans()
  }

  /**
   * Arrête le scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Scheduler is not running')
      return
    }

    console.log('🛑 Stopping scheduler...')

    this.tasks.forEach((task, name) => {
      task.stop()
      console.log(`✅ Stopped task: ${name}`)
    })

    this.tasks.clear()
    this.isRunning = false

    console.log('✅ Scheduler stopped')
  }

  /**
   * Exécute les scans planifiés en fonction de la fréquence de chaque source
   */
  async runScheduledScans() {
    try {
      const sources = await Source.query().where('is_active', true)

      console.log(`🔍 Checking ${sources.length} active sources...`)

      let scannedCount = 0

      for (const source of sources) {
        const shouldScan = this.shouldScanSource(source)

        if (shouldScan) {
          console.log(`📡 Scanning: ${source.name}`)

          if (source.type === 'rss') {
            await this.rssScanner.scanSource(source.id)
          } else {
            await this.webScraper.scanSource(source.id)
          }

          scannedCount++

          // Pause entre chaque source pour éviter de surcharger
          await this.sleep(2000)
        } else {
          console.log(`⏭️  Skipping ${source.name} (not due yet)`)
        }
      }

      console.log(`✨ Scheduled scan complete: ${scannedCount} sources scanned`)
    } catch (error) {
      console.error('❌ Error in scheduled scan:', error)
    }
  }

  /**
   * Détermine si une source doit être scannée maintenant
   */
  private shouldScanSource(source: Source): boolean {
    // Si jamais scannée, scanner maintenant
    if (!source.lastScannedAt) {
      return true
    }

    const now = DateTime.now()
    const lastScan = source.lastScannedAt
    const frequencyMinutes = source.scanFrequency || 30

    const minutesSinceLastScan = now.diff(lastScan, 'minutes').minutes

    return minutesSinceLastScan >= frequencyMinutes
  }

  /**
   * Retourne l'heure du prochain scan global
   */
  private getNextRunTime(): string {
    const now = DateTime.now()
    const nextRun = now.plus({ minutes: 30 - (now.minute % 30) }).startOf('minute')
    return nextRun.toFormat('yyyy-MM-dd HH:mm:ss')
  }

  /**
   * Vérifie si le scheduler tourne
   */
  isSchedulerRunning(): boolean {
    return this.isRunning
  }

  /**
   * Obtient le statut du scheduler
   */
  getStatus() {
    return {
      running: this.isRunning,
      activeTasks: this.tasks.size,
      nextRun: this.isRunning ? this.getNextRunTime() : null,
    }
  }

  /**
   * Pause utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
