import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('source_id').unsigned().references('id').inTable('sources').onDelete('CASCADE')

      table.string('title').notNullable()
      table.text('description').nullable()
      table.text('content').nullable()
      table.string('url').notNullable().unique()
      table.string('image_url').nullable()
      table.string('author').nullable()

      // Métadonnées
      table.timestamp('published_at').nullable()
      table.string('category').nullable()
      table.specificType('tags', 'text[]').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.raw('CREATE INDEX articles_published_at_index ON articles(published_at DESC)')
    this.schema.raw('CREATE INDEX articles_source_id_index ON articles(source_id)')
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
