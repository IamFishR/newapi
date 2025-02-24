class PerformanceMetrics {
    static metrics = {
        responseTime: new Map(), // endpoint -> average response time
        dbQueryTime: new Map(),  // query type -> average execution time
        syncTime: new Map(),     // sync operation -> average completion time
        errorRates: new Map(),   // endpoint -> error count
        cache: {
            hits: 0,
            misses: 0,
            size: 0
        }
    };

    static trackResponseTime(endpoint, time) {
        const current = this.metrics.responseTime.get(endpoint) || { avg: 0, count: 0 };
        current.avg = (current.avg * current.count + time) / (current.count + 1);
        current.count++;
        this.metrics.responseTime.set(endpoint, current);
    }

    static trackDBQueryTime(queryType, time) {
        const current = this.metrics.dbQueryTime.get(queryType) || { avg: 0, count: 0 };
        current.avg = (current.avg * current.count + time) / (current.count + 1);
        current.count++;
        this.metrics.dbQueryTime.set(queryType, current);
    }

    static trackSyncTime(operation, time) {
        const current = this.metrics.syncTime.get(operation) || { avg: 0, count: 0 };
        current.avg = (current.avg * current.count + time) / (current.count + 1);
        current.count++;
        this.metrics.syncTime.set(operation, current);
    }

    static trackError(endpoint) {
        const count = this.metrics.errorRates.get(endpoint) || 0;
        this.metrics.errorRates.set(endpoint, count + 1);
    }

    static trackCacheHit() {
        this.metrics.cache.hits++;
    }

    static trackCacheMiss() {
        this.metrics.cache.misses++;
    }

    static updateCacheSize(size) {
        this.metrics.cache.size = size;
    }

    static getMetrics() {
        const hitRate = this.metrics.cache.hits + this.metrics.cache.misses === 0 ? 0 :
            (this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses)) * 100;

        return {
            responseTime: Object.fromEntries(this.metrics.responseTime),
            dbQueryTime: Object.fromEntries(this.metrics.dbQueryTime),
            syncTime: Object.fromEntries(this.metrics.syncTime),
            errorRates: Object.fromEntries(this.metrics.errorRates),
            cache: {
                ...this.metrics.cache,
                hitRate: hitRate.toFixed(2) + '%'
            }
        };
    }

    static resetMetrics() {
        this.metrics.responseTime.clear();
        this.metrics.dbQueryTime.clear();
        this.metrics.syncTime.clear();
        this.metrics.errorRates.clear();
        this.metrics.cache = {
            hits: 0,
            misses: 0,
            size: 0
        };
    }

    // Performance warning thresholds
    static checkPerformanceThresholds() {
        const warnings = [];
        
        // Check response times
        this.metrics.responseTime.forEach((data, endpoint) => {
            if (data.avg > 1000) { // 1 second threshold
                warnings.push(`High response time for ${endpoint}: ${data.avg.toFixed(2)}ms`);
            }
        });

        // Check DB query times
        this.metrics.dbQueryTime.forEach((data, queryType) => {
            if (data.avg > 500) { // 500ms threshold
                warnings.push(`Slow DB queries for ${queryType}: ${data.avg.toFixed(2)}ms`);
            }
        });

        // Check cache performance
        const hitRate = this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses);
        if (hitRate < 0.7) { // 70% threshold
            warnings.push(`Low cache hit rate: ${(hitRate * 100).toFixed(2)}%`);
        }

        return warnings;
    }
}

module.exports = PerformanceMetrics;