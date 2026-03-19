import { describe, it, expect, beforeEach } from 'vitest'
import {deleteFromCache, getFromCache, setInCache} from "../services/cache.service.js";

describe('cache.service', () => {
    beforeEach(() => {
        deleteFromCache('test-key')
    })

    it('retourne undefined pour une clé inexistante', () => {
        expect(getFromCache('test-key')).toBeUndefined()
    })

    it('stocke et récupère une valeur', () => {
        setInCache('test-key', { type: 'rss' })
        expect(getFromCache('test-key')).toEqual({ type: 'rss' })
    })

    it('supprime une valeur', () => {
        setInCache('test-key', { type: 'rss' })
        deleteFromCache('test-key')
        expect(getFromCache('test-key')).toBeUndefined()
    })
})