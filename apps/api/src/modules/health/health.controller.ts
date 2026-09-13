import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Public } from '../auth/public.decorator';
import { InMemoryCacheService } from '../cache/in-memory-cache.service';

@ApiTags('health')
@Public()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly cache: InMemoryCacheService,
  ) {}

  @Get()
  async check() {
    let database: 'up' | 'down' = 'down';
    try {
      await this.dataSource.query('SELECT 1');
      database = 'up';
    } catch {
      database = 'down';
    }

    const telegramConfigured = Boolean(this.config.get('TELEGRAM_BOT_TOKEN'));
    return {
      status: database === 'up' ? 'ok' : 'degraded',
      checks: {
        api: 'up',
        database,
        telegram: telegramConfigured ? 'configured' : 'not_configured',
        cache: this.config.get('CACHE_ENABLED') ? 'enabled' : 'disabled',
      },
    };
  }
}
