import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Source from '#models/source'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Article extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sourceId: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare content: string | null

  @column()
  declare url: string

  @column()
  declare imageUrl: string | null

  @column()
  declare author: string | null

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column()
  declare category: string | null

  @column()
  declare tags: string[] | null

  @column()
  declare viewsCount: number

  @column()
  declare isFeatured: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Source)
  declare source: BelongsTo<typeof Source>
}
