import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from '../movies/movies.module';
import { GenreEntity } from './entities/genre.entity';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

@Module({
  imports: [TypeOrmModule.forFeature([GenreEntity]), MoviesModule],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
