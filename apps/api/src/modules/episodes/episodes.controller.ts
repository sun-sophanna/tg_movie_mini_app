import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentTelegramUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { PlaybackService } from '../playback/playback.service';
import { EpisodesService } from './episodes.service';

@ApiTags('episodes')
@ApiBearerAuth('tma')
@Controller({ path: 'episodes', version: '1' })
export class EpisodesController {
  constructor(
    private readonly episodes: EpisodesService,
    private readonly playback: PlaybackService,
  ) {}

  @Public()
  @Get(':id')
  byId(@Param('id', ParseUUIDPipe) id: string) {
    return this.episodes.findById(id);
  }

  @Get(':id/play')
  play(@Param('id', ParseUUIDPipe) id: string, @CurrentTelegramUser() user: UserEntity) {
    return this.playback.getPlaybackSource(id, user);
  }
}
