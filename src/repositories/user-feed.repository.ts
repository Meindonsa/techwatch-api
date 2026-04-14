import { db } from '../db/index.js'
import type { Feed } from './feed.repository.js'

export interface UserFeed {
    id: number
    user_id: number
    feed_id: number
    created_at: string
}

export function subscribeUserToFeed(userId: number, feedId: number): UserFeed {
    const stmt = db.prepare(`
    INSERT INTO user_feeds (user_id, feed_id)
    VALUES (?, ?)
    ON CONFLICT(user_id, feed_id) DO NOTHING
    RETURNING *
  `)
    const result = stmt.get(userId, feedId) as UserFeed | undefined
    if (result) return result

    return db.prepare(`
    SELECT * FROM user_feeds WHERE user_id = ? AND feed_id = ?
  `).get(userId, feedId) as UserFeed
}

export function unsubscribeUserFromFeed(userId: number, feedId: number): void {
    db.prepare(`DELETE FROM user_feeds WHERE user_id = ? AND feed_id = ?`).run(userId, feedId)
}

export function getFeedsByUser(userId: number): Feed[] {
    return db.prepare(`
    SELECT f.* FROM feeds f
    INNER JOIN user_feeds uf ON uf.feed_id = f.id
    WHERE uf.user_id = ?
    ORDER BY uf.created_at DESC
  `).all(userId) as Feed[]
}

export function getUserIdsByFeed(feedId: number): number[] {
    const rows = db.prepare(`
    SELECT user_id FROM user_feeds WHERE feed_id = ?
  `).all(feedId) as { user_id: number }[]
    return rows.map(r => r.user_id)
}