import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EpisodeDto } from '@movie/types';
import { ErrorCodes } from '../../common/constants/error-codes';
import { EpisodeEntity, EpisodeStatus } from './entities/episode.entity';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly repo: Repository<EpisodeEntity>,
  ) {}

  toDto(episode: EpisodeEntity): EpisodeDto {
    return {
      id: episode.id,
      movieId: episode.movieId,
      seasonId: episode.seasonId,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      titleKh: episode.titleKh,
      thumbnailUrl: episode.thumbnailUrl,
      durationSeconds: episode.durationSeconds,
      status: episode.status,
    };
  }

  async findByMovieId(movieId: string): Promise<EpisodeDto[]> {
    const rows = await this.repo.find({
      where: { movieId, status: EpisodeStatus.ACTIVE },
      order: { episodeNumber: 'ASC' },
    });
    return rows.map((e) => this.toDto(e));
  }

  async findBySeasonId(seasonId: string): Promise<EpisodeDto[]> {
    const rows = await this.repo.find({
      where: { seasonId, status: EpisodeStatus.ACTIVE },
      order: { episodeNumber: 'ASC' },
    });
    return rows.map((e) => this.toDto(e));
  }

  async findById(id: string): Promise<EpisodeDto> {
    const episode = await this.repo.findOne({
      where: { id, status: EpisodeStatus.ACTIVE },
    });
    if (!episode) {
      throw new NotFoundException({
        message: 'Episode not found',
        code: ErrorCodes.EPISODE_NOT_FOUND,
      });
    }
    return this.toDto(episode);
  }

  async findEntityById(id: string): Promise<EpisodeEntity> {
    const episode = await this.repo.findOne({ where: { id } });
    if (!episode) {
      throw new NotFoundException({
        message: 'Episode not found',
        code: ErrorCodes.EPISODE_NOT_FOUND,
      });
    }
    return episode;
  }
}
