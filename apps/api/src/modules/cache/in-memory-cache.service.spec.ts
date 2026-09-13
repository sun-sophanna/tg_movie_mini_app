import { ConfigService } from '@nestjs/config';
import { InMemoryCacheService } from './in-memory-cache.service';

describe('InMemoryCacheService', () => {
  it('expires entries after ttl', async () => {
    const config = {
      get: () => true,
    } as unknown as ConfigService;
    const cache = new InMemoryCacheService(config);
    await cache.set('key', { ok: true }, 1);
    expect(await cache.get('key')).toEqual({ ok: true });
    await new Promise((r) => setTimeout(r, 1100));
    expect(await cache.get('key')).toBeNull();
    cache.onModuleDestroy();
  });
});
