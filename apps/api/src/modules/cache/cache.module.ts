import { Global, Module } from '@nestjs/common';
import { CACHE_SERVICE } from './cache.interface';
import { InMemoryCacheService } from './in-memory-cache.service';

@Global()
@Module({
  providers: [
    InMemoryCacheService,
    { provide: CACHE_SERVICE, useExisting: InMemoryCacheService },
  ],
  exports: [CACHE_SERVICE, InMemoryCacheService],
})
export class CacheModule {}
