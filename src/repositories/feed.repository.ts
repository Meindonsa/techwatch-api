import { db } from '../db/index.js'

export interface Feed {
    id: number
    type: 'rss' | 'atom'
    feed_url: string
    original_url: string
    name: string
    created_at: string
}

export interface NewFeed {
    type: 'rss' | 'atom'
    feed_url: string
    original_url: string
    name: string
}

export function upsertFeed(data: NewFeed): Feed {
    db.prepare(`
        INSERT INTO feeds (type, feed_url, original_url, name)
        VALUES (@type, @feed_url, @original_url, @name)
        ON CONFLICT(feed_url) DO UPDATE SET
                                            name         = COALESCE(excluded.name, feeds.name),
                                            original_url = excluded.original_url,
                                            type         = excluded.type
    `).run(data)

    return db.prepare(`SELECT * FROM feeds WHERE feed_url = ?`).get(data.feed_url) as Feed
}

export function getFeedById(id: number): Feed | undefined {
    return db.prepare(`SELECT * FROM feeds WHERE id = ?`).get(id) as Feed | undefined
}

export function updateFeedName(id: number, name: string): Feed {
    db.prepare(`UPDATE feeds SET name = ? WHERE id = ?`).run(name, id)
    return db.prepare(`SELECT * FROM feeds WHERE id = ?`).get(id) as Feed
}

export function deleteFeed(id: number): void {
    db.prepare(`DELETE FROM feeds WHERE id = ?`).run(id)
}

export function getAllFeeds(): Feed[] {
    return db.prepare(`SELECT * FROM feeds`).all() as Feed[]
}