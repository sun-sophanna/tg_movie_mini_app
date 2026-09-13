import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { EpisodesService } from '../episodes/episodes.service';

@ApiTags('seasons')
@ApiBearerAuth('tma')
@Public()
@Controller({ path: 'seasons', version: '1' })
export class SeasonsController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get(':id/episodes')
  listEpisodes(@Param('id', ParseUUIDPipe) id: string) {
    return this.episodesService.findBySeasonId(id);
  }
}
