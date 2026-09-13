import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MovieType } from '../entities/movie.entity';

export enum MovieSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  RATING = 'rating',
  TITLE = 'title',
}

export class MovieQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  releaseYear?: number;

  @IsOptional()
  @IsEnum(MovieType)
  type?: MovieType;

  @IsOptional()
  @IsEnum(MovieSort)
  sort?: MovieSort = MovieSort.NEWEST;
}
