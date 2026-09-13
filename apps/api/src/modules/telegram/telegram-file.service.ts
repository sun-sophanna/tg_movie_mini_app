import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TELEGRAM_API_BASE, TELEGRAM_REQUEST_TIMEOUT_MS } from './telegram.constants';
import { TelegramFileResponse } from './telegram.types';

@Injectable()
export class TelegramFileService {
  private readonly logger = new Logger(TelegramFileService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getFileMetadata(fileId: string): Promise<TelegramFileResponse['result']> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('Telegram bot token not configured');
    }

    this.logger.log('TELEGRAM FILE RESOLVE');
    const url = `${TELEGRAM_API_BASE}/bot${token}/getFile`;
    const response = await firstValueFrom(
      this.http.get<TelegramFileResponse>(url, {
        params: { file_id: fileId },
        timeout: TELEGRAM_REQUEST_TIMEOUT_MS,
      }),
    );

    if (!response.data.ok || !response.data.result?.file_path) {
      return undefined;
    }
    return response.data.result;
  }

  buildFileDownloadUrl(filePath: string): { url: string; expiresAt: string } {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('Telegram bot token not configured');
    }
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    const url = `${TELEGRAM_API_BASE}/file/bot${token}/${filePath}`;
    return { url, expiresAt };
  }
}
