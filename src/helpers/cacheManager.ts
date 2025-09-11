interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly defaultMaxSize = 100;

  constructor(private options: CacheOptions = {}) {
    this.options = {
      ttl: this.defaultTTL,
      maxSize: this.defaultMaxSize,
      storage: 'memory',
      ...options,
    };
  }

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    
    switch (this.options.storage) {
      case 'localStorage':
        return localStorage;
      case 'sessionStorage':
        return sessionStorage;
      default:
        return null;
    }
  }

  private generateKey(key: string): string {
    return `cache_${key}`;
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiry;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }

  private enforceMaxSize(): void {
    if (this.memoryCache.size <= this.options.maxSize!) return;

    // Remove oldest items
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, entries.length - this.options.maxSize!);
    toRemove.forEach(([key]) => this.memoryCache.delete(key));
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.options.ttl!;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      key,
    };

    if (this.options.storage === 'memory') {
      this.memoryCache.set(key, item);
      this.cleanupExpired();
      this.enforceMaxSize();
    } else {
      const storage = this.getStorage();
      if (storage) {
        try {
          storage.setItem(this.generateKey(key), JSON.stringify(item));
        } catch (error) {
          console.warn('Failed to store in cache:', error);
        }
      }
    }
  }

  get<T>(key: string): T | null {
    let item: CacheItem<T> | null = null;

    if (this.options.storage === 'memory') {
      item = this.memoryCache.get(key) || null;
    } else {
      const storage = this.getStorage();
      if (storage) {
        try {
          const stored = storage.getItem(this.generateKey(key));
          if (stored) {
            item = JSON.parse(stored);
          }
        } catch (error) {
          console.warn('Failed to retrieve from cache:', error);
        }
      }
    }

    if (!item) return null;

    if (this.isExpired(item)) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    if (this.options.storage === 'memory') {
      this.memoryCache.delete(key);
    } else {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(this.generateKey(key));
      }
    }
  }

  clear(): void {
    if (this.options.storage === 'memory') {
      this.memoryCache.clear();
    } else {
      const storage = this.getStorage();
      if (storage) {
        const keys = Object.keys(storage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            storage.removeItem(key);
          }
        });
      }
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  size(): number {
    if (this.options.storage === 'memory') {
      return this.memoryCache.size;
    } else {
      const storage = this.getStorage();
      if (storage) {
        return Object.keys(storage).filter(key => key.startsWith('cache_')).length;
      }
      return 0;
    }
  }

  keys(): string[] {
    if (this.options.storage === 'memory') {
      return Array.from(this.memoryCache.keys());
    } else {
      const storage = this.getStorage();
      if (storage) {
        return Object.keys(storage)
          .filter(key => key.startsWith('cache_'))
          .map(key => key.replace('cache_', ''));
      }
      return [];
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    keys: string[];
    memoryUsage?: number;
  } {
    const stats = {
      size: this.size(),
      keys: this.keys(),
    };

    if (this.options.storage === 'memory') {
      // Estimate memory usage
      let memoryUsage = 0;
      for (const [key, item] of this.memoryCache.entries()) {
        memoryUsage += key.length * 2; // Rough estimate for string
        memoryUsage += JSON.stringify(item).length * 2;
      }
      return { ...stats, memoryUsage };
    }

    return stats;
  }
}

// Create different cache instances for different use cases
export const apiCache = new CacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50,
  storage: 'memory',
});

export const userCache = new CacheManager({
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 20,
  storage: 'localStorage',
});

export const sessionCache = new CacheManager({
  ttl: 60 * 60 * 1000, // 1 hour
  maxSize: 100,
  storage: 'sessionStorage',
});

export default CacheManager;
