import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodesModule } from '../episodes/episodes.module';
import { SeasonsModule } from '../seasons/seasons.module';
import { MovieEntity } from './entities/movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieEntity]),
    SeasonsModule,
    EpisodesModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
