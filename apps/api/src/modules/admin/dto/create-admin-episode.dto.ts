import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { EpisodeStatus } from '../../episodes/entities/episode.entity';

export class CreateAdminEpisodeDto {
  @IsUUID()
  movieId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  episodeNumber!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  titleKh?: string;

  @IsString()
  @MinLength(3)
  telegramFileId!: string;

  @IsOptional()
  @IsString()
  telegramFileUniqueId?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsEnum(EpisodeStatus)
  status!: EpisodeStatus;
}
