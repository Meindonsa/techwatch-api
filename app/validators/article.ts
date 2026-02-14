import vine from '@vinejs/vine'

/**
 * Validation pour la création d'un article
 */
export const createArticleValidator = vine.compile(
  vine.object({
    sourceId: vine.number().positive(),

    title: vine.string().trim().minLength(3).maxLength(500),

    description: vine.string().trim().maxLength(1000).nullable().optional(),

    content: vine.string().trim().maxLength(50000).nullable().optional(),

    url: vine.string().trim().url(),

    imageUrl: vine.string().trim().url().nullable().optional(),

    author: vine.string().trim().maxLength(200).nullable().optional(),

    publishedAt: vine.string().trim().nullable().optional(),

    category: vine.string().trim().maxLength(100).nullable().optional(),

    tags: vine.array(vine.string().trim()).nullable().optional(),
  })
)

/**
 * Validation pour la liste des articles
 */
export const listArticlesValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),

    limit: vine.number().min(1).max(100).optional(),

    source_id: vine.number().positive().optional(),

    category: vine.string().trim().optional(),

    search: vine.string().trim().minLength(2).optional(),
  })
)

/**
 * Validation pour la mise à jour d'un article
 */
export const updateArticleValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(500).optional(),

    description: vine.string().trim().maxLength(1000).nullable().optional(),

    content: vine.string().trim().maxLength(50000).nullable().optional(),

    imageUrl: vine.string().trim().url().nullable().optional(),

    isFeatured: vine.boolean().optional(),

    category: vine.string().trim().maxLength(100).nullable().optional(),

    tags: vine.array(vine.string().trim()).nullable().optional(),
  })
)
