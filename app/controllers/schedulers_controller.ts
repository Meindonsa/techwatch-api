import type { HttpContext } from '@adonisjs/core/http'
import scheduler from '#start/scheduler'

export default class SchedulerController {
  /**
   * GET /api/scheduler/status
   */
  async status({ response }: HttpContext) {
    return response.json(scheduler.getStatus())
  }

  /**
   * POST /api/scheduler/start
   */
  async start({ response }: HttpContext) {
    scheduler.start()
    return response.json({ message: 'Scheduler started', status: scheduler.getStatus() })
  }

  /**
   * POST /api/scheduler/stop
   */
  async stop({ response }: HttpContext) {
    scheduler.stop()
    return response.json({ message: 'Scheduler stopped', status: scheduler.getStatus() })
  }

  /**
   * POST /api/scheduler/run-now
   */
  async runNow({ response }: HttpContext) {
    await scheduler.runScheduledScans()
    return response.json({ message: 'Scan completed' })
  }
}
