import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Article from '#models/article'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Source extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare url: string

  @column()
  declare logoUrl: string | null

  @column()
  declare type: 'rss' | 'scraping'

  @column()
  declare rssFeedUrl: string | null

  @column()
  declare scrapingConfig: string | null

  @column()
  declare isActive: boolean

  @column()
  declare scanFrequency: number

  @column.dateTime()
  declare lastScannedAt: DateTime | null

  @column()
  declare articlesCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @hasMany(() => Article)
  declare articles: HasMany<typeof Article>
}
