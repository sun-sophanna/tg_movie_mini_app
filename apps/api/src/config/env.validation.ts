import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  NODE_ENV!: string;

  @IsInt()
  @Min(1)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  API_PREFIX!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  TELEGRAM_BOT_TOKEN?: string;

  @IsString()
  @IsOptional()
  TELEGRAM_BOT_USERNAME?: string;

  @IsString()
  @IsOptional()
  TELEGRAM_STORAGE_CHAT_ID?: string;

  @IsInt()
  @Min(60)
  TELEGRAM_AUTH_MAX_AGE_SECONDS!: number;

  @IsBoolean()
  CACHE_ENABLED!: boolean;

  @IsInt()
  @Min(1)
  CACHE_DEFAULT_TTL_SECONDS!: number;

  @IsString()
  CORS_ORIGINS!: string;

  @IsInt()
  @Min(1000)
  RATE_LIMIT_TTL_MS!: number;

  @IsInt()
  @Min(1)
  RATE_LIMIT_MAX!: number;

  @IsBoolean()
  @IsOptional()
  TELEGRAM_MOCK_AUTH_ENABLED?: boolean;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const transformed = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(transformed, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return transformed;
}
