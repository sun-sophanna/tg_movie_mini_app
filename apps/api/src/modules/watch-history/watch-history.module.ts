import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodesModule } from '../episodes/episodes.module';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { WatchHistoryEntity } from './entities/watch-history.entity';
import { WatchHistoryController } from './watch-history.controller';
import { WatchHistoryService } from './watch-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WatchHistoryEntity, EpisodeEntity]),
    EpisodesModule,
  ],
  controllers: [WatchHistoryController],
  providers: [WatchHistoryService],
})
export class WatchHistoryModule {}
