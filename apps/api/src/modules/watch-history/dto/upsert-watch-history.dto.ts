import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpsertWatchHistoryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  positionSeconds!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
