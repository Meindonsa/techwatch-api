import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rate_limits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key').primary()
      table.integer('points').notNullable()
      table.timestamp('expire_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
