import Parser from 'rss-parser'

type CustomItem = {
    title: string
    link: string
    pubDate: string
    content: string
    creator: string
    enclosure?: { url: string }
    'media:content'?: { $: { url: string } }
}

const rssParser = new Parser<object, CustomItem>({
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechWatchBot/1.0)' },
    customFields: {
        item: ['media:content', 'enclosure'],
    },
})

export interface Article {
    title: string
    link: string
    date: string | null
    summary: string | null
    author: string | null
    image: string | null
}

export interface FeedResult {
    feedUrl: string
    title: string
    articles: Article[]
}

function extractImage(item: CustomItem): string | null {
    if (item['media:content']?.$?.url) return item['media:content'].$.url
    // enclosure (podcasts, images attachées)
    if (item.enclosure?.url) return item.enclosure.url
    return null
}

export async function getArticles(feedUrl: string): Promise<FeedResult> {
    const feed = await rssParser.parseURL(feedUrl)

    return {
        feedUrl,
        title: feed.title ?? 'Sans titre',
        articles: feed.items.map((item) => ({
            title: item.title ?? 'Sans titre',
            link: item.link ?? '',
            date: item.pubDate ?? null,
            summary: item.contentSnippet ?? null,
            author: item.creator ?? null,
            image: extractImage(item),
        })),
    }
}