import { db } from '../db/index.js'

export interface Article {
    id: number
    title: string
    link: string
    pub_date: string | null
    summary: string | null
    author: string | null
    image: string | null
    feed_id: number
    fetched_at: string
}

export interface NewArticle {
    title: string
    link: string
    pub_date?: string | null
    summary?: string | null
    author?: string | null
    image?: string | null
    feed_id: number
}

/**
 * Insère les articles en ignorant les doublons (UNIQUE sur link).
 * Retourne le nombre de nouvelles lignes insérées.
 */
export function insertArticles(articles: NewArticle[]): number {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO articles (title, link, pub_date, summary, author, image, feed_id)
        VALUES (@title, @link, @pub_date, @summary, @author, @image, @feed_id)
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

export function getArticlesByFeed(feedId: number, limit = 50): Article[] {
    return db.prepare(`
        SELECT * FROM articles
        WHERE feed_id = ?
        ORDER BY pub_date DESC
        LIMIT ?
    `).all(feedId, limit) as Article[]
}

export function getArticlesByUser(userId: number, limit = 100): Article[] {
    return db.prepare(`
        SELECT a.* FROM articles a
                            INNER JOIN user_feeds uf ON uf.feed_id = a.feed_id
        WHERE uf.user_id = ?
        ORDER BY a.pub_date DESC
        LIMIT ?
    `).all(userId, limit) as Article[]
}

export function getArticlesByUserAndFeed(userId: number, feedId:number, limit = 100): Article[] {
    return db.prepare(`
        SELECT a.* FROM articles a
                            INNER JOIN user_feeds uf ON uf.feed_id = a.feed_id
        WHERE uf.user_id = ? AND uf.feed_id = ?
        ORDER BY a.pub_date DESC
        LIMIT ?
    `).all(userId, feedId, limit) as Article[]
}