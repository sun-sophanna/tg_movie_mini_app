import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { CategoryEntity } from '../categories/entities/category.entity';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { MovieEntity } from '../movies/entities/movie.entity';
import { AdminController } from './admin.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminEpisodesService } from './admin-episodes.service';
import { AdminMoviesService } from './admin-movies.service';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieEntity, EpisodeEntity, CategoryEntity]),
    CategoriesModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminApiKeyGuard,
    AdminDashboardService,
    AdminMoviesService,
    AdminEpisodesService,
  ],
})
export class AdminModule {}
