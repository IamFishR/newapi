const NodeCache = require('node-cache');
const PerformanceMetrics = require('./PerformanceMetrics');

class CacheService {
    constructor() {
        // Set default TTL to 5 minutes, check expired keys every minute
        this.cache = new NodeCache({ 
            stdTTL: 300,
            checkperiod: 60,
            useClones: false
        });

        // Track cache size changes
        this.cache.on('set', () => {
            PerformanceMetrics.updateCacheSize(this.cache.getStats().keys);
        });
        this.cache.on('del', () => {
            PerformanceMetrics.updateCacheSize(this.cache.getStats().keys);
        });
    }

    get(key) {
        const value = this.cache.get(key);
        if (value === undefined) {
            PerformanceMetrics.trackCacheMiss();
            return null;
        }
        PerformanceMetrics.trackCacheHit();
        return value;
    }

    set(key, value, ttl = 300) {
        return this.cache.set(key, value, ttl);
    }

    del(key) {
        return this.cache.del(key);
    }

    flush() {
        return this.cache.flushAll();
    }

    // Memoize expensive operations
    async memoize(key, fn, ttl = 300) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        const result = await fn();
        this.set(key, result, ttl);
        return result;
    }

    // Cache user-specific data
    async getUserData(userId, dataType) {
        const key = `user:${userId}:${dataType}`;
        return this.get(key);
    }

    setUserData(userId, dataType, data, ttl = 300) {
        const key = `user:${userId}:${dataType}`;
        return this.set(key, data, ttl);
    }

    invalidateUserData(userId, dataType = null) {
        if (dataType) {
            const key = `user:${userId}:${dataType}`;
            this.del(key);
        } else {
            // Invalidate all user data
            const keys = this.cache.keys().filter(k => k.startsWith(`user:${userId}:`));
            this.cache.del(keys);
        }
    }

    // Market data caching
    async getMarketData(symbol, dataType) {
        const key = `market:${symbol}:${dataType}`;
        return this.get(key);
    }

    setMarketData(symbol, dataType, data, ttl = 60) { // Default 1 minute TTL for market data
        const key = `market:${symbol}:${dataType}`;
        return this.set(key, data, ttl);
    }

    invalidateMarketData(symbol = null) {
        if (symbol) {
            const keys = this.cache.keys().filter(k => k.startsWith(`market:${symbol}:`));
            this.cache.del(keys);
        } else {
            // Invalidate all market data
            const keys = this.cache.keys().filter(k => k.startsWith('market:'));
            this.cache.del(keys);
        }
    }

    // Cache cleanup and maintenance
    cleanup() {
        const stats = this.cache.getStats();
        if (stats.keys > 10000) { // If we have too many keys
            // Remove least recently used items
            const keys = this.cache.keys();
            const lruKeys = keys.sort((a, b) => {
                const aHits = this.cache.getTtl(a);
                const bHits = this.cache.getTtl(b);
                return aHits - bHits;
            }).slice(0, Math.floor(stats.keys * 0.2)); // Remove 20% of keys
            this.cache.del(lruKeys);
        }
        PerformanceMetrics.updateCacheSize(this.cache.getStats().keys);
    }

    getStats() {
        return {
            ...this.cache.getStats(),
            hitRate: PerformanceMetrics.getMetrics().cache.hitRate
        };
    }
}

module.exports = new CacheService();