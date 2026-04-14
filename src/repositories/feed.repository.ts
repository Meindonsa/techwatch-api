import { db } from '../db/index.js'

export interface Feed {
    id: number
    url: string
    title: string | null
    description: string | null
    created_at: string
}

export function upsertFeed(url: string, title?: string, description?: string): Feed {
    db.prepare(`
    INSERT INTO feeds (url, title, description)
    VALUES (?, ?, ?)
    ON CONFLICT(url) DO UPDATE SET
      title = COALESCE(excluded.title, feeds.title),
      description = COALESCE(excluded.description, feeds.description)
  `).run(url, title ?? null, description ?? null)

    return db.prepare(`SELECT * FROM feeds WHERE url = ?`).get(url) as Feed
}

export function getFeedById(id: number): Feed | undefined {
    return db.prepare(`SELECT * FROM feeds WHERE id = ?`).get(id) as Feed | undefined
}

export function getAllFeeds(): Feed[] {
    return db.prepare(`SELECT * FROM feeds`).all() as Feed[]
}