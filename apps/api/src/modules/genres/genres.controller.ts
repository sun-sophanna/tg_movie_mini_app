import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { MovieQueryDto } from '../movies/dto/movie-query.dto';
import { GenresService } from './genres.service';

@ApiTags('genres')
@ApiBearerAuth('tma')
@Public()
@Controller({ path: 'genres', version: '1' })
export class GenresController {
  constructor(private readonly genres: GenresService) {}

  @Get()
  list() {
    return this.genres.list();
  }

  @Get(':slug/movies')
  movies(@Param('slug') slug: string, @Query() query: MovieQueryDto) {
    return this.genres.moviesBySlug(slug, query);
  }
}
