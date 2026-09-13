import { Controller, Get, Param, ParseUUIDPipe, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { SkipResponseWrap } from '../../common/decorators/skip-response-wrap.decorator';
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

  /** Resolves playback metadata; `url` in the response is the video stream URL (not this path). */
  @Get(':id/playback')
  resolvePlayback(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTelegramUser() user: UserEntity,
    @Req() req: Request,
  ) {
    return this.playback.getPlaybackSource(id, user, req);
  }

  /** @deprecated Prefer GET `:id/playback` */
  @Get(':id/play')
  play(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTelegramUser() user: UserEntity,
    @Req() req: Request,
  ) {
    return this.playback.getPlaybackSource(id, user, req);
  }

  @Public()
  @SkipThrottle()
  @SkipResponseWrap()
  @Get(':id/stream')
  async stream(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('exp') exp: string,
    @Query('sig') sig: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.playback.assertStreamAccess(id, exp, sig);
    await this.playback.streamEpisodeToResponse(id, req, res);
  }
}
