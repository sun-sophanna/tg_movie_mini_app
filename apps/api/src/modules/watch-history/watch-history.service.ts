import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistoryItemDto } from '@movie/types';
import { ErrorCodes } from '../../common/constants/error-codes';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { toMovieListItem } from '../movies/movie.mapper';
import { EpisodesService } from '../episodes/episodes.service';
import { WatchHistoryEntity } from './entities/watch-history.entity';
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto';

@Injectable()
export class WatchHistoryService {
  constructor(
    @InjectRepository(WatchHistoryEntity)
    private readonly repo: Repository<WatchHistoryEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    private readonly episodesService: EpisodesService,
  ) {}

  async list(userId: string, limit = 20): Promise<WatchHistoryItemDto[]> {
    const rows = await this.repo.find({
      where: { userId },
      relations: ['movie', 'episode'],
      order: { lastWatchedAt: 'DESC' },
      take: limit,
    });
    return rows.map((row) => this.toDto(row));
  }

  async upsert(
    userId: string,
    episodeId: string,
    dto: UpsertWatchHistoryDto,
  ): Promise<WatchHistoryItemDto> {
    const episode = await this.episodes.findOne({ where: { id: episodeId } });
    if (!episode) {
      throw new NotFoundException({
        message: 'Episode not found',
        code: ErrorCodes.EPISODE_NOT_FOUND,
      });
    }

    const progress =
      dto.progressPercent ??
      (dto.durationSeconds
        ? Math.min(100, (dto.positionSeconds / dto.durationSeconds) * 100)
        : 0);

    let row = await this.repo.findOne({ where: { userId, episodeId } });
    const now = new Date();
    if (!row) {
      row = this.repo.create({
        userId,
        movieId: episode.movieId,
        episodeId,
        positionSeconds: dto.positionSeconds,
        durationSeconds: dto.durationSeconds ?? episode.durationSeconds,
        progressPercent: progress.toFixed(2),
        completed: dto.completed ?? progress >= 95,
        lastWatchedAt: now,
      });
    } else {
      row.positionSeconds = dto.positionSeconds;
      row.durationSeconds = dto.durationSeconds ?? row.durationSeconds;
      row.progressPercent = progress.toFixed(2);
      row.completed = dto.completed ?? (row.completed || progress >= 95);
      row.lastWatchedAt = now;
    }
    const saved = await this.repo.save(row);
    saved.episode = episode;
    return this.toDto(saved);
  }

  async remove(userId: string, episodeId: string): Promise<{ removed: boolean }> {
    const result = await this.repo.delete({ userId, episodeId });
    return { removed: (result.affected ?? 0) > 0 };
  }

  private toDto(row: WatchHistoryEntity): WatchHistoryItemDto {
    return {
      id: row.id,
      movieId: row.movieId,
      episodeId: row.episodeId,
      positionSeconds: row.positionSeconds,
      durationSeconds: row.durationSeconds,
      progressPercent: row.progressPercent,
      completed: row.completed,
      lastWatchedAt: row.lastWatchedAt.toISOString(),
      movie: row.movie ? toMovieListItem(row.movie) : undefined,
      episode: row.episode ? this.episodesService.toDto(row.episode) : undefined,
    };
  }
}
