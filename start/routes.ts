// start/routes.ts
import router from '@adonisjs/core/services/router'
import SchedulerController from '#controllers/schedulers_controller'

const SourcesController = () => import('#controllers/sources_controller')
const ArticlesController = () => import('#controllers/articles_controller')

router
  .group(() => {
    // Routes Sources
    router
      .group(() => {
        router.get('/', [SourcesController, 'index'])
        router.post('/', [SourcesController, 'store'])
        router.get('/:id', [SourcesController, 'show'])
        router.put('/:id', [SourcesController, 'update'])
        router.post('/detect', [SourcesController, 'detect'])
        router.delete('/:id', [SourcesController, 'destroy'])
        router.post('/:id/scan', [SourcesController, 'scan'])
        router.post('/scan-all', [SourcesController, 'scanAll'])
      })
      .prefix('/sources')

    // Routes Articles
    router
      .group(() => {
        router.get('/', [ArticlesController, 'index'])
        router.get('/featured', [ArticlesController, 'featured'])
        router.get('/recent', [ArticlesController, 'recent'])
        router.get('/:id', [ArticlesController, 'show'])
        router.post('/', [ArticlesController, 'store'])
        router.delete('/:id', [ArticlesController, 'destroy'])
      })
      .prefix('/articles')

    router
      .group(() => {
        router.get('/status', [SchedulerController, 'status'])
        router.post('/start', [SchedulerController, 'start'])
        router.post('/stop', [SchedulerController, 'stop'])
        router.post('/run-now', [SchedulerController, 'runNow'])
      })
      .prefix('/scheduler')
  })
  .prefix('/api')
