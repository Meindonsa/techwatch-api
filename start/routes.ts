// start/routes.ts
import router from '@adonisjs/core/services/router'

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
        router.delete('/:id', [SourcesController, 'destroy'])
        router.get('/:id/articles', [SourcesController, 'articles'])
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
  })
  .prefix('/api')
