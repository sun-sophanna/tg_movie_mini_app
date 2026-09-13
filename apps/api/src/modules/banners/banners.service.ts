import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerDto } from '@movie/types';
import { CACHE_SERVICE, CacheService } from '../cache/cache.interface';
import { BannerEntity } from './entities/banner.entity';
import { TaxonomyStatus } from '../categories/entities/category.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(BannerEntity)
    private readonly repo: Repository<BannerEntity>,
    @Inject(CACHE_SERVICE)
    private readonly cache: CacheService,
  ) {}

  async listActive(): Promise<BannerDto[]> {
    const cacheKey = 'banners:active';
    const cached = await this.cache.get<BannerDto[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const now = new Date();
    const rows = await this.repo
      .createQueryBuilder('banner')
      .where('banner.status = :status', { status: TaxonomyStatus.ACTIVE })
      .andWhere('(banner.start_at IS NULL OR banner.start_at <= :now)', { now })
      .andWhere('(banner.end_at IS NULL OR banner.end_at >= :now)', { now })
      .orderBy('banner.sort_order', 'ASC')
      .getMany();

    const items = rows.map((b) => ({
      id: b.id,
      movieId: b.movieId,
      title: b.title,
      titleKh: b.titleKh,
      imageUrl: b.imageUrl,
      targetUrl: b.targetUrl,
    }));
    await this.cache.set(cacheKey, items, 600);
    return items;
  }
}
