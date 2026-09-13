import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/env.validation';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { TelegramAuthGuard } from './modules/auth/telegram-auth.guard';
import { UsersModule } from './modules/users/users.module';
import { MoviesModule } from './modules/movies/movies.module';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { GenresModule } from './modules/genres/genres.module';
import { BannersModule } from './modules/banners/banners.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { PlaybackModule } from './modules/playback/playback.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { CacheModule } from './modules/cache/cache.module';
import { HealthModule } from './modules/health/health.module';
import { UserEntity } from './modules/users/entities/user.entity';
import { MovieEntity } from './modules/movies/entities/movie.entity';
import { SeasonEntity } from './modules/seasons/entities/season.entity';
import { EpisodeEntity } from './modules/episodes/entities/episode.entity';
import { CategoryEntity } from './modules/categories/entities/category.entity';
import { GenreEntity } from './modules/genres/entities/genre.entity';
import { BannerEntity } from './modules/banners/entities/banner.entity';
import { FavoriteEntity } from './modules/favorites/entities/favorite.entity';
import { WatchHistoryEntity } from './modules/watch-history/entities/watch-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL_MS', 60000),
          limit: config.get<number>('RATE_LIMIT_MAX', 100),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: config.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        entities: [
          UserEntity,
          MovieEntity,
          SeasonEntity,
          EpisodeEntity,
          CategoryEntity,
          GenreEntity,
          BannerEntity,
          FavoriteEntity,
          WatchHistoryEntity,
        ],
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    CacheModule,
    AuthModule,
    UsersModule,
    TelegramModule,
    PlaybackModule,
    MoviesModule,
    SeasonsModule,
    EpisodesModule,
    CategoriesModule,
    GenresModule,
    BannersModule,
    FavoritesModule,
    WatchHistoryModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: TelegramAuthGuard },
  ],
})
export class AppModule {}
