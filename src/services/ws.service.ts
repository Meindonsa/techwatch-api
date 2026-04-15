import type { WSContext } from "hono/ws"
import { getUserIdsByFeed } from '../repositories/user-feed.repository.js'
import { getUserById } from '../repositories/user.repository.js'

const connections = new Map<string, WSContext>()

export function registerConnection(username: string, ws: WSContext): void {
    connections.set(username, ws)
    console.log(`[ws] @${username} connecté — ${connections.size} connexion(s) active(s)`)
}

export function removeConnection(username: string): void {
    connections.delete(username)
    console.log(`[ws] @${username} déconnecté — ${connections.size} connexion(s) active(s)`)
}

/**
 * Notifie tous les users abonnés aux feeds mis à jour.
 * Appelé par le cron après chaque scraping.
 */
export function notifyUpdatedFeeds(updatedFeedIds: number[]): void {
    if (updatedFeedIds.length === 0) return

    for (const feedId of updatedFeedIds) {
        const userIds = getUserIdsByFeed(feedId)

        for (const userId of userIds) {
            const user = getUserById(userId)
            if (!user) continue

            const ws = connections.get(user.username)
            if (ws) {
                ws.send(JSON.stringify({ type: 'new_articles', feedId }))
                console.log(`[ws] Notification envoyée → @${user.username} (feed #${feedId})`)
            }
        }
    }
}