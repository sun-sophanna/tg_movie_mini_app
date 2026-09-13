import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { MovieQueryDto } from '../movies/dto/movie-query.dto';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@ApiBearerAuth('tma')
@Public()
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Get(':slug/movies')
  movies(@Param('slug') slug: string, @Query() query: MovieQueryDto) {
    return this.categories.moviesBySlug(slug, query);
  }
}
