import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { CategoryGenreDto } from '@movie/types';
import { Public } from '../auth/public.decorator';
import { CategoriesService } from '../categories/categories.service';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminEpisodesService } from './admin-episodes.service';
import { AdminMoviesService } from './admin-movies.service';
import { AdminMovieQueryDto } from './dto/admin-movie-query.dto';
import { CreateAdminEpisodeDto } from './dto/create-admin-episode.dto';
import { CreateAdminMovieDto } from './dto/create-admin-movie.dto';
import { UpdateAdminEpisodeDto } from './dto/update-admin-episode.dto';
import { UpdateAdminMovieDto } from './dto/update-admin-movie.dto';

@ApiTags('admin')
@ApiHeader({ name: 'X-Admin-Key', description: 'Admin API key (ADMIN_API_KEY)' })
@Public()
@UseGuards(AdminApiKeyGuard)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(
    private readonly dashboard: AdminDashboardService,
    private readonly movies: AdminMoviesService,
    private readonly episodes: AdminEpisodesService,
    private readonly categories: CategoriesService,
  ) {}

  @Get('dashboard/stats')
  stats() {
    return this.dashboard.getStats();
  }

  @Get('categories')
  async categoryList(): Promise<CategoryGenreDto[]> {
    return this.categories.list();
  }

  @Get('movies')
  listMovies(@Query() query: AdminMovieQueryDto) {
    return this.movies.list(query);
  }

  @Get('movies/:id')
  getMovie(@Param('id', ParseUUIDPipe) id: string) {
    return this.movies.getById(id);
  }

  @Post('movies')
  createMovie(@Body() dto: CreateAdminMovieDto) {
    return this.movies.create(dto);
  }

  @Patch('movies/:id')
  updateMovie(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminMovieDto) {
    return this.movies.update(id, dto);
  }

  @Delete('movies/:id')
  deleteMovie(@Param('id', ParseUUIDPipe) id: string) {
    return this.movies.remove(id);
  }

  @Get('movies/:movieId/episodes')
  listEpisodes(@Param('movieId', ParseUUIDPipe) movieId: string) {
    return this.episodes.listByMovie(movieId);
  }

  @Get('episodes/:id')
  getEpisode(@Param('id', ParseUUIDPipe) id: string) {
    return this.episodes.getById(id);
  }

  @Post('episodes')
  createEpisode(@Body() dto: CreateAdminEpisodeDto) {
    return this.episodes.create(dto);
  }

  @Patch('episodes/:id')
  updateEpisode(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminEpisodeDto) {
    return this.episodes.update(id, dto);
  }

  @Delete('episodes/:id')
  deleteEpisode(@Param('id', ParseUUIDPipe) id: string) {
    return this.episodes.remove(id);
  }
}
