import ScanSchedulerService from '#services/scan_scheduler_service'

const scheduler = new ScanSchedulerService()

scheduler.start()

process.on('SIGINT', () => {
  console.log('\n⚠️  Received SIGINT, stopping scheduler...')
  scheduler.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️  Received SIGTERM, stopping scheduler...')
  scheduler.stop()
  process.exit(0)
})

export default scheduler
