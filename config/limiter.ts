import { defineConfig, stores } from '@adonisjs/limiter'

export default defineConfig({
  default: 'db',

  stores: {
    db: stores.database({
      connectionName: 'postgres',
      tableName: 'rate_limits',
      clearExpiredByTimeout: true,
    }),
  },
})
