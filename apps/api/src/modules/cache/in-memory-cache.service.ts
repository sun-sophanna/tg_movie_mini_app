import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.interface';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

@Injectable()
export class InMemoryCacheService implements CacheService, OnModuleDestroy {
  private readonly logger = new Logger(InMemoryCacheService.name);
  private readonly store = new Map<string, CacheEntry>();
  private readonly enabled: boolean;
  private cleanupTimer?: ReturnType<typeof setInterval>;

  constructor(config: ConfigService) {
    this.enabled = config.get<boolean>('CACHE_ENABLED', true);
    this.cleanupTimer = setInterval(() => this.evictExpired(), 60_000);
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }
    const entry = this.store.get(key);
    if (!entry) {
      this.logger.debug(`MOVIE CACHE MISS key=${key}`);
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    this.logger.debug(`MOVIE CACHE HIT key=${key}`);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.enabled) {
      return;
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
