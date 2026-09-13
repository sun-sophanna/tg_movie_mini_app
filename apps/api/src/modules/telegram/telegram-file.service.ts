import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  isCloudTelegramApiBase,
  normalizeTelegramBaseUrl,
  TELEGRAM_API_BASE_DEFAULT,
  TELEGRAM_CLOUD_MAX_FILE_BYTES,
  TELEGRAM_REQUEST_TIMEOUT_MS_DEFAULT,
} from './telegram.constants';
import { TelegramFileResponse } from './telegram.types';

@Injectable()
export class TelegramFileService {
  private readonly logger = new Logger(TelegramFileService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /** Base URL for Bot API calls from the Nest server (getFile). */
  getApiBaseUrl(): string {
    const configured = this.config.get<string>('TELEGRAM_API_BASE_URL');
    return normalizeTelegramBaseUrl(configured?.trim() || TELEGRAM_API_BASE_DEFAULT);
  }

  /** Base URL embedded in playback links returned to clients (must be reachable by browsers). */
  getFileDownloadBaseUrl(): string {
    const configured = this.config.get<string>('TELEGRAM_FILE_BASE_URL');
    const base = configured?.trim() || this.getApiBaseUrl();
    return normalizeTelegramBaseUrl(base);
  }

  usesLocalBotApi(): boolean {
    return !isCloudTelegramApiBase(this.getApiBaseUrl());
  }

  private getRequestTimeoutMs(): number {
    const configured = this.config.get<number>('TELEGRAM_FILE_REQUEST_TIMEOUT_MS');
    if (configured && configured > 0) {
      return configured;
    }
    return this.usesLocalBotApi() ? 120_000 : TELEGRAM_REQUEST_TIMEOUT_MS_DEFAULT;
  }

  async getFileMetadata(fileId: string): Promise<TelegramFileResponse['result']> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('Telegram bot token not configured');
    }

    const apiBase = this.getApiBaseUrl();
    this.logger.log(`TELEGRAM FILE RESOLVE via ${apiBase}`);
    const url = `${apiBase}/bot${token}/getFile`;
    const response = await firstValueFrom(
      this.http.get<TelegramFileResponse>(url, {
        params: { file_id: fileId },
        timeout: this.getRequestTimeoutMs(),
      }),
    );

    if (!response.data.ok || !response.data.result?.file_path) {
      const description = response.data.description ?? 'unknown error';
      this.logger.warn(`Telegram getFile failed: ${description}`);
      if (
        isCloudTelegramApiBase(apiBase) &&
        /too big|file is too large/i.test(description)
      ) {
        this.logger.warn(
          `File exceeds ${TELEGRAM_CLOUD_MAX_FILE_BYTES} bytes on cloud Bot API. ` +
            'Set TELEGRAM_API_BASE_URL to a Local Bot API server (see docs/telegram-local-bot-api.md).',
        );
      }
      return undefined;
    }

    const fileSize = response.data.result.file_size;
    if (
      fileSize != null &&
      fileSize > TELEGRAM_CLOUD_MAX_FILE_BYTES &&
      isCloudTelegramApiBase(apiBase)
    ) {
      this.logger.warn(
        `Resolved file size ${fileSize} exceeds cloud limit; playback may fail without Local Bot API.`,
      );
    }

    return response.data.result;
  }

  buildFileDownloadUrl(filePath: string): { url: string; expiresAt: string } {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('Telegram bot token not configured');
    }
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    const fileBase = this.getFileDownloadBaseUrl();
    const url = `${fileBase}/file/bot${token}/${filePath}`;
    return { url, expiresAt };
  }
}
