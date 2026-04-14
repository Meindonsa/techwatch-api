import { db } from '../db/index.js'

export interface ArticleRow {
    id: number
    feed_id: number
    title: string
    link: string
    description: string | null
    author: string | null
    image: string | null
    published_at: string | null
    fetched_at: string
}

export interface NewArticle {
    feed_id: number
    title: string
    link: string
    description?: string | null
    author?: string | null
    image?: string | null
    published_at?: string | null
}

/**
 * Insère les articles en ignorant les doublons (UNIQUE sur link).
 * Retourne le nombre de nouvelles lignes insérées.
 */
export function insertArticles(articles: NewArticle[]): number {
    const stmt = db.prepare(`
    INSERT OR IGNORE INTO articles (feed_id, title, link, description, author, image, published_at)
    VALUES (@feed_id, @title, @link, @description, @author, @image, @published_at)
  `)

    const insertMany = db.transaction((items: NewArticle[]) => {
        let inserted = 0
        for (const item of items) {
            const info = stmt.run(item)
            inserted += info.changes
        }
        return inserted
    })

    return insertMany(articles)
}

export function getArticlesByFeed(feedId: number, limit = 50): ArticleRow[] {
    return db.prepare(`
    SELECT * FROM articles
    WHERE feed_id = ?
    ORDER BY published_at DESC
    LIMIT ?
  `).all(feedId, limit) as ArticleRow[]
}

export function getArticlesByUser(userId: number, limit = 100): ArticleRow[] {
    return db.prepare(`
    SELECT a.* FROM articles a
    INNER JOIN user_feeds uf ON uf.feed_id = a.feed_id
    WHERE uf.user_id = ?
    ORDER BY a.published_at DESC
    LIMIT ?
  `).all(userId, limit) as ArticleRow[]
}