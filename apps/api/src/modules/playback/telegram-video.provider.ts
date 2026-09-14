import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorCodes } from '../../common/constants/error-codes';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { TelegramFileService } from '../telegram/telegram-file.service';
import { PlaybackSource, VideoProvider } from './playback.types';

@Injectable()
export class TelegramVideoProvider implements VideoProvider {
  constructor(private readonly telegramFiles: TelegramFileService) {}

  async resolvePlaybackSource(episode: EpisodeEntity): Promise<PlaybackSource> {
    const meta = await this.telegramFiles.getFileMetadata(episode.telegramFileId);
    if (!meta?.file_path) {
      throw new NotFoundException({
        message: 'Telegram file not found',
        code: ErrorCodes.TELEGRAM_FILE_NOT_FOUND,
      });
    }

    try {
      const { url, expiresAt } = this.telegramFiles.buildFileDownloadUrl(meta.file_path);
      return {
        episodeId: episode.id,
        url,
        mimeType: episode.mimeType ?? 'video/mp4',
        expiresAt,
        provider: 'telegram',
        telegramStoragePath: meta.file_path.startsWith('/') ? meta.file_path : undefined,
      };
    } catch {
      throw new InternalServerErrorException({
        message: 'Failed to resolve playback source',
        code: ErrorCodes.PLAYBACK_SOURCE_FAILED,
      });
    }
  }
}
