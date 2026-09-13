import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentTelegramUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { UpsertWatchHistoryDto } from './dto/upsert-watch-history.dto';
import { WatchHistoryService } from './watch-history.service';

@ApiTags('watch-history')
@ApiBearerAuth('tma')
@Controller({ path: 'watch-history', version: '1' })
export class WatchHistoryController {
  constructor(private readonly history: WatchHistoryService) {}

  @Get()
  list(@CurrentTelegramUser() user: UserEntity) {
    return this.history.list(user.id);
  }

  @Put(':episodeId')
  upsert(
    @CurrentTelegramUser() user: UserEntity,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @Body() dto: UpsertWatchHistoryDto,
  ) {
    return this.history.upsert(user.id, episodeId, dto);
  }

  @Delete(':episodeId')
  remove(
    @CurrentTelegramUser() user: UserEntity,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
  ) {
    return this.history.remove(user.id, episodeId);
  }
}
