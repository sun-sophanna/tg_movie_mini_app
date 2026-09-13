import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonDto } from '@movie/types';
import { ErrorCodes } from '../../common/constants/error-codes';
import { SeasonEntity, SeasonStatus } from './entities/season.entity';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(SeasonEntity)
    private readonly repo: Repository<SeasonEntity>,
  ) {}

  async findByMovieId(movieId: string): Promise<SeasonDto[]> {
    const rows = await this.repo.find({
      where: { movieId, status: SeasonStatus.ACTIVE },
      order: { seasonNumber: 'ASC' },
    });
    return rows.map((s) => ({
      id: s.id,
      movieId: s.movieId,
      seasonNumber: s.seasonNumber,
      title: s.title,
      titleKh: s.titleKh,
      posterUrl: s.posterUrl,
    }));
  }

  async findById(id: string): Promise<SeasonEntity> {
    const season = await this.repo.findOne({ where: { id, status: SeasonStatus.ACTIVE } });
    if (!season) {
      throw new NotFoundException({
        message: 'Season not found',
        code: ErrorCodes.SEASON_NOT_FOUND,
      });
    }
    return season;
  }
}
