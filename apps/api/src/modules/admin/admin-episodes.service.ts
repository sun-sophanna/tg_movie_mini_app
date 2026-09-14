import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminEpisodeDto } from '@movie/types';
import { ErrorCodes } from '../../common/constants/error-codes';
import { CACHE_SERVICE, CacheService } from '../cache/cache.interface';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { MovieEntity } from '../movies/entities/movie.entity';
import { toAdminEpisodeDto } from './admin.mapper';
import { CreateAdminEpisodeDto } from './dto/create-admin-episode.dto';
import { UpdateAdminEpisodeDto } from './dto/update-admin-episode.dto';

@Injectable()
export class AdminEpisodesService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodes: Repository<EpisodeEntity>,
    @InjectRepository(MovieEntity)
    private readonly movies: Repository<MovieEntity>,
    @Inject(CACHE_SERVICE)
    private readonly cache: CacheService,
  ) {}

  async listByMovie(movieId: string): Promise<AdminEpisodeDto[]> {
    await this.assertMovie(movieId);
    const rows = await this.episodes.find({
      where: { movieId },
      order: { episodeNumber: 'ASC' },
    });
    return rows.map((e) => toAdminEpisodeDto(e));
  }

  async getById(id: string): Promise<AdminEpisodeDto> {
    const episode = await this.episodes.findOne({ where: { id }, relations: ['movie'] });
    if (!episode) {
      throw new NotFoundException({
        message: 'Episode not found',
        code: ErrorCodes.EPISODE_NOT_FOUND,
      });
    }
    return toAdminEpisodeDto(episode, episode.movie?.title);
  }

  async create(dto: CreateAdminEpisodeDto): Promise<AdminEpisodeDto> {
    const movie = await this.assertMovie(dto.movieId);
    const episode = this.episodes.create({
      movieId: dto.movieId,
      episodeNumber: dto.episodeNumber,
      title: dto.title ?? null,
      titleKh: dto.titleKh ?? null,
      telegramFileId: dto.telegramFileId.trim(),
      telegramFileUniqueId: dto.telegramFileUniqueId ?? null,
      mimeType: dto.mimeType ?? 'video/mp4',
      durationSeconds: dto.durationSeconds ?? null,
      status: dto.status,
    });
    const saved = await this.episodes.save(episode);
    await this.cache.clear();
    return toAdminEpisodeDto(saved, movie.title);
  }

  async update(id: string, dto: UpdateAdminEpisodeDto): Promise<AdminEpisodeDto> {
    const episode = await this.episodes.findOne({ where: { id }, relations: ['movie'] });
    if (!episode) {
      throw new NotFoundException({
        message: 'Episode not found',
        code: ErrorCodes.EPISODE_NOT_FOUND,
      });
    }
    if (dto.episodeNumber != null) episode.episodeNumber = dto.episodeNumber;
    if (dto.title !== undefined) episode.title = dto.title;
    if (dto.titleKh !== undefined) episode.titleKh = dto.titleKh;
    if (dto.telegramFileId != null) episode.telegramFileId = dto.telegramFileId.trim();
    if (dto.telegramFileUniqueId !== undefined) {
      episode.telegramFileUniqueId = dto.telegramFileUniqueId;
    }
    if (dto.mimeType !== undefined) episode.mimeType = dto.mimeType;
    if (dto.durationSeconds !== undefined) episode.durationSeconds = dto.durationSeconds;
    if (dto.status != null) episode.status = dto.status;

    const saved = await this.episodes.save(episode);
    await this.cache.clear();
    return toAdminEpisodeDto(saved, episode.movie?.title);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.episodes.delete(id);
    await this.cache.clear();
    return { deleted: (result.affected ?? 0) > 0 };
  }

  private async assertMovie(movieId: string): Promise<MovieEntity> {
    const movie = await this.movies.findOne({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException({ message: 'Movie not found', code: ErrorCodes.MOVIE_NOT_FOUND });
    }
    return movie;
  }
}
