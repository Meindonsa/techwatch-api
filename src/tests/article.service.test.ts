import { describe, it, expect, vi, beforeEach } from 'vitest'
import {FeedError} from "../utils/errors.js";

// Mock avant l'import du service
const mockParseURL = vi.fn()

vi.mock('rss-parser', () => ({
    default: class {
        parseURL = mockParseURL
    },
}))

// Import après le mock
const { getArticles } = await import('../services/article.service.js')

beforeEach(() => {
    mockParseURL.mockReset()
})

describe('getArticles', () => {
    it('lance une FeedError TIMEOUT si le flux timeout', async () => {
        const error: any = new Error('timeout')
        error.code = 'ETIMEDOUT'
        mockParseURL.mockRejectedValueOnce(error)

        await expect(getArticles('https://dev.to/feed')).rejects.toThrow(FeedError)
    })

    it('lance une FeedError UNREACHABLE si le site est inaccessible', async () => {
        const error: any = new Error('not found')
        error.code = 'ENOTFOUND'
        mockParseURL.mockRejectedValueOnce(error)

        await expect(getArticles('https://dev.to/feed')).rejects.toThrow(FeedError)
    })
})