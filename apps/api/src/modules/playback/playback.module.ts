import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramModule } from '../telegram/telegram.module';
import { EpisodeEntity } from '../episodes/entities/episode.entity';
import { MovieEntity } from '../movies/entities/movie.entity';
import { PlaybackService } from './playback.service';
import { TelegramVideoProvider } from './telegram-video.provider';
import { VIDEO_PROVIDER } from './playback.types';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([EpisodeEntity, MovieEntity]),
    TelegramModule,
  ],
  providers: [
    PlaybackService,
    TelegramVideoProvider,
    { provide: VIDEO_PROVIDER, useExisting: TelegramVideoProvider },
  ],
  exports: [PlaybackService],
})
export class PlaybackModule {}
