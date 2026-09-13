import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaybackSourceDto } from '@movie/types';
import { ErrorCodes } from '../../common/constants/error-codes';
import { EpisodeEntity, EpisodeStatus } from '../episodes/entities/episode.entity';
import { MovieEntity, MovieStatus } from '../movies/entities/movie.entity';
import { UserEntity, UserStatus } from '../users/entities/user.entity';
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
  ) {}

  async getPlaybackSource(episodeId: string, user: UserEntity): Promise<PlaybackSourceDto> {
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException({
        message: 'User is not allowed to watch',
        code: ErrorCodes.FORBIDDEN,
      });
    }

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

    const source: PlaybackSource = await this.videoProvider.resolvePlaybackSource(episode);
    this.logger.log('PLAYBACK SOURCE GENERATED');
    return source;
  }
}
