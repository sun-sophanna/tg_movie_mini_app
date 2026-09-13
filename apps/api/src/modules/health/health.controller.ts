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
    const apiBase =
      this.config.get<string>('TELEGRAM_API_BASE_URL')?.trim() || 'https://api.telegram.org';
    const usesLocalBotApi = apiBase.replace(/\/+$/, '') !== 'https://api.telegram.org';
    return {
      status: database === 'up' ? 'ok' : 'degraded',
      checks: {
        api: 'up',
        database,
        telegram: telegramConfigured ? 'configured' : 'not_configured',
        telegramFileDelivery: usesLocalBotApi ? 'local_bot_api' : 'cloud_bot_api_20mb_max',
        cache: this.config.get('CACHE_ENABLED') ? 'enabled' : 'disabled',
      },
    };
  }
}
