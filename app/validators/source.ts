import vine from '@vinejs/vine'

/**
 * Validation pour la création d'une source
 */
export const createSourceValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),

    url: vine.string().trim().url(),
  })
)

/**
 * Validation pour la mise à jour d'une source
 */
export const updateSourceValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),

    url: vine.string().trim().url().optional(),

    logoUrl: vine.string().trim().url().nullable().optional(),

    type: vine.enum(['rss', 'scraping']).optional(),

    rssFeedUrl: vine.string().trim().url().nullable().optional(),

    scrapingConfig: vine.string().trim().nullable().optional(),

    scanFrequency: vine.number().min(5).max(1440).optional(),

    isActive: vine.boolean().optional(),
  })
)

/**
 * Validation pour la détection de source
 */
export const detectSourceValidator = vine.compile(
  vine.object({
    url: vine.string().trim().url(),
  })
)
