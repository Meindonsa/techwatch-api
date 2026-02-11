import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sources'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable() // Nom du site (ex: Le Monde)
      table.string('url').notNullable().unique() // URL du site
      table.string('logo_url').nullable() // Logo du site
      table.enum('type', ['rss', 'scraping']).notNullable() // Type de source
      table.string('rss_feed_url').nullable() // URL du flux RSS
      table.text('scraping_config').nullable() // Config JSON pour le scraping
      table.boolean('is_active').defaultTo(true) // Source active ou non
      table.integer('scan_frequency').defaultTo(30) // Fréquence en minutes
      table.timestamp('last_scanned_at').nullable() // Dernière analyse
      table.integer('articles_count').defaultTo(0) // Nombre d'articles

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
