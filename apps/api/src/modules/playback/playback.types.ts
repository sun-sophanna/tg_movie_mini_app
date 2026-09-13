import { EpisodeEntity } from '../episodes/entities/episode.entity';

export interface PlaybackSource {
  episodeId: string;
  url: string;
  mimeType?: string;
  expiresAt?: string;
  provider: 'telegram' | 's3' | 'r2' | 'bunny';
}

export interface VideoProvider {
  resolvePlaybackSource(episode: EpisodeEntity): Promise<PlaybackSource>;
}

export const VIDEO_PROVIDER = Symbol('VIDEO_PROVIDER');
