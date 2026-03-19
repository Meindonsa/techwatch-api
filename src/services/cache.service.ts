import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 })

export function getFromCache<T>(key: string): T | undefined {
    return cache.get<T>(key)
}

export function setInCache<T>(key: string, value: T): void {
    cache.set(key, value)
}

export function deleteFromCache(key: string): void {
    cache.del(key)
}

export function getCacheStats() {
    return cache.getStats()
}