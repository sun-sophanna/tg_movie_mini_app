import { EpisodeEntity } from '../episodes/entities/episode.entity';

export interface PlaybackSource {
  episodeId: string;
  url: string;
  mimeType?: string;
  expiresAt?: string;
  provider: 'telegram' | 's3' | 'r2' | 'bunny';
  /** Absolute path from Local Bot API getFile (--local mode); read from disk, not HTTP /file/bot. */
  telegramStoragePath?: string;
}

export interface VideoProvider {
  resolvePlaybackSource(episode: EpisodeEntity): Promise<PlaybackSource>;
}

export const VIDEO_PROVIDER = Symbol('VIDEO_PROVIDER');
