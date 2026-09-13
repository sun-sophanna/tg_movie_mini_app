import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { PlaybackSourceDto } from '@movie/types';
import { ErrorCodes } from '../../common/constants/error-codes';
import { normalizeTelegramBaseUrl } from '../telegram/telegram.constants';
import { TelegramFileService } from '../telegram/telegram-file.service';
import { EpisodeEntity, EpisodeStatus } from '../episodes/entities/episode.entity';
import { MovieEntity, MovieStatus } from '../movies/entities/movie.entity';
import { UserEntity } from '../users/entities/user.entity';
import {
  isPlaybackStreamExpired,
  verifyPlaybackStreamSignature,
  signPlaybackStream,
} from './playback-stream.signature';
import { PlaybackSource, VIDEO_PROVIDER, VideoProvider } from './playback.types';

@Injectable()
export class PlaybackService {
  private readonly logger = new Logger(PlaybackService.name);

  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    @InjectRepository(MovieEntity)
    private readonly movies: Repository<MovieEntity>,
    @Inject(VIDEO_PROVIDER)
    private readonly videoProvider: VideoProvider,
    private readonly config: ConfigService,
    private readonly telegramFiles: TelegramFileService,
    private readonly http: HttpService,
  ) {}

  async getPlaybackSource(
    episodeId: string,
    _user: UserEntity,
    req?: Request,
  ): Promise<PlaybackSourceDto> {
    const episode = await this.loadActiveEpisode(episodeId);

    const source: PlaybackSource = await this.videoProvider.resolvePlaybackSource(episode);
    this.logger.log('PLAYBACK SOURCE GENERATED');

    if (!this.shouldProxyPlayback(source)) {
      return { ...source, delivery: 'direct' as const };
    }

    const streamTtlMs = this.config.get<number>('PLAYBACK_STREAM_TTL_MS', 6 * 3600 * 1000);
    const expUnix = Math.floor((Date.now() + streamTtlMs) / 1000);
    const exp = String(expUnix);
    const sig = this.signStream(episodeId, exp);
    const publicBase = this.getPublicApiBase(req);
    const url = `${publicBase}/episodes/${episodeId}/stream?exp=${exp}&sig=${encodeURIComponent(sig)}`;
    const expiresAt = new Date(expUnix * 1000).toISOString();

    return {
      ...source,
      url,
      expiresAt,
      delivery: 'api-stream' as const,
    };
  }

  assertStreamAccess(episodeId: string, exp: string, signature: string): void {
    if (!exp?.trim() || !signature?.trim()) {
      throw new UnauthorizedException({
        message: 'Missing playback token',
        code: ErrorCodes.FORBIDDEN,
      });
    }
    if (!Number.isFinite(Number(exp))) {
      throw new UnauthorizedException({
        message: 'Invalid playback token',
        code: ErrorCodes.FORBIDDEN,
      });
    }
    if (isPlaybackStreamExpired(exp)) {
      throw new UnauthorizedException({
        message: 'Playback link expired',
        code: ErrorCodes.FORBIDDEN,
      });
    }
    const secret = this.getStreamSigningSecret();
    if (!verifyPlaybackStreamSignature(secret, episodeId, exp, signature)) {
      throw new UnauthorizedException({
        message: 'Invalid playback signature',
        code: ErrorCodes.FORBIDDEN,
      });
    }
  }

  async streamEpisodeToResponse(
    episodeId: string,
    req: Request,
    res: Response,
  ): Promise<void> {
    const episode = await this.loadActiveEpisode(episodeId);
    const source = await this.videoProvider.resolvePlaybackSource(episode);

    const headers: Record<string, string> = {};
    const range = req.headers.range;
    if (typeof range === 'string') {
      headers.Range = range;
    }

    this.logger.log('PLAYBACK STREAM PROXY');
    const upstream = await firstValueFrom(
      this.http.get(source.url, {
        headers,
        responseType: 'stream',
        timeout: this.telegramFiles.usesLocalBotApi() ? 120_000 : 30_000,
        validateStatus: (status) => status >= 200 && status < 400,
      }),
    );

    const passHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
    ] as const;
    for (const name of passHeaders) {
      const value = upstream.headers[name];
      if (value !== undefined) {
        res.setHeader(name, value as string | number);
      }
    }
    if (!upstream.headers['content-type'] && source.mimeType) {
      res.setHeader('content-type', source.mimeType);
    }

    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(upstream.status);
    upstream.data.pipe(res);
  }

  private shouldProxyPlayback(source: PlaybackSource): boolean {
    const configured = this.config.get<string>('TELEGRAM_PLAYBACK_PROXY');
    if (configured === 'false' || configured === '0') {
      return false;
    }
    if (configured === 'true' || configured === '1') {
      return true;
    }
    // Default: all Telegram playback goes through signed /stream (browser-safe)
    if (source.provider === 'telegram') {
      return true;
    }
    return source.url.includes('/file/bot');
  }

  private getStreamSigningSecret(): string {
    const secret = this.config.get<string>('PLAYBACK_STREAM_SECRET');
    if (secret?.trim()) {
      return secret.trim();
    }
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('Telegram bot token not configured');
    }
    return token;
  }

  private signStream(episodeId: string, expUnix: string): string {
    return signPlaybackStream(this.getStreamSigningSecret(), episodeId, expUnix);
  }

  private getPublicApiBase(req?: Request): string {
    const configured = this.config.get<string>('API_PUBLIC_BASE_URL')?.trim();
    if (configured) {
      return normalizeTelegramBaseUrl(configured);
    }
    if (req) {
      const prefix = this.config.get<string>('API_PREFIX', 'api');
      return normalizeTelegramBaseUrl(`${req.protocol}://${req.get('host')}/${prefix}/v1`);
    }
    const port = this.config.get<number>('PORT', 3000);
    return `http://localhost:${port}/api/v1`;
  }

  private async loadActiveEpisode(episodeId: string): Promise<EpisodeEntity> {
    const episode = await this.episodes.findOne({ where: { id: episodeId } });
    if (!episode) {
      throw new NotFoundException({
        message: 'Episode not found',
        code: ErrorCodes.EPISODE_NOT_FOUND,
      });
    }

    if (episode.status !== EpisodeStatus.ACTIVE) {
      throw new ForbiddenException({
        message: 'Episode is not available',
        code: ErrorCodes.FORBIDDEN,
      });
    }

    const movie = await this.movies.findOne({ where: { id: episode.movieId } });
    if (!movie || movie.status !== MovieStatus.ACTIVE) {
      throw new ForbiddenException({
        message: 'Movie is not available',
        code: ErrorCodes.FORBIDDEN,
      });
    }

    return episode;
  }
}
