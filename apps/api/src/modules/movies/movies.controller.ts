import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MoviesService } from './movies.service';
import { SeasonsService } from '../seasons/seasons.service';
import { EpisodesService } from '../episodes/episodes.service';

@ApiTags('movies')
@ApiBearerAuth('tma')
@Controller({ path: 'movies', version: '1' })
export class MoviesController {
  constructor(
    private readonly movies: MoviesService,
    private readonly seasons: SeasonsService,
    private readonly episodes: EpisodesService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List movies' })
  list(@Query() query: MovieQueryDto) {
    return this.movies.findMany(query);
  }

  @Public()
  @Get('featured')
  featured(@Query('limit') limit?: string) {
    return this.movies.findFeatured(Math.min(Number(limit) || 10, 20));
  }

  @Public()
  @Get('trending')
  trending(@Query('limit') limit?: string) {
    return this.movies.findTrending(Math.min(Number(limit) || 10, 20));
  }

  @Public()
  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.movies.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  byId(@Param('id', ParseUUIDPipe) id: string) {
    return this.movies.findById(id);
  }

  @Public()
  @Get(':id/seasons')
  seasonsForMovie(@Param('id', ParseUUIDPipe) id: string) {
    return this.seasons.findByMovieId(id);
  }

  @Public()
  @Get(':id/episodes')
  episodesForMovie(@Param('id', ParseUUIDPipe) id: string) {
    return this.episodes.findByMovieId(id);
  }
}
