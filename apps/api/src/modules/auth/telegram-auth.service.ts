import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { ErrorCodes } from '../../common/constants/error-codes';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { TelegramInitData, TelegramWebAppUser } from './telegram-init-data.interface';

const MOCK_PREFIX = 'mock:';

@Injectable()
export class TelegramAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async authenticateInitData(rawInitData: string): Promise<UserEntity> {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const maxAge = this.config.get<number>('TELEGRAM_AUTH_MAX_AGE_SECONDS', 86400);
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    const mockEnabled = this.config.get<boolean>('TELEGRAM_MOCK_AUTH_ENABLED', false);

    if (
      nodeEnv !== 'production' &&
      mockEnabled &&
      rawInitData.startsWith(MOCK_PREFIX)
    ) {
      return this.authenticateMock(rawInitData.slice(MOCK_PREFIX.length));
    }

    if (!botToken) {
      throw new UnauthorizedException({
        message: 'Telegram bot is not configured',
        code: ErrorCodes.INVALID_TELEGRAM_AUTH,
      });
    }

    const parsed = this.parseInitData(rawInitData);
    this.verifySignature(rawInitData, parsed.hash, botToken);

    const authDate = Number(parsed.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (!authDate || now - authDate > maxAge) {
      throw new UnauthorizedException({
        message: 'Telegram auth expired',
        code: ErrorCodes.TELEGRAM_AUTH_EXPIRED,
      });
    }

    const tgUser = this.parseUser(parsed.user);
    return this.usersService.upsertFromTelegram(tgUser);
  }

  private authenticateMock(payload: string): Promise<UserEntity> {
    let user: TelegramWebAppUser;
    try {
      user = JSON.parse(payload) as TelegramWebAppUser;
    } catch {
      user = {
        id: 100001,
        first_name: 'Dev',
        username: 'dev_user',
        language_code: 'en',
      };
    }
    return this.usersService.upsertFromTelegram(user);
  }

  parseInitData(raw: string): TelegramInitData {
    const params = new URLSearchParams(raw);
    const hash = params.get('hash');
    if (!hash) {
      throw new UnauthorizedException({
        message: 'Invalid Telegram init data',
        code: ErrorCodes.INVALID_TELEGRAM_AUTH,
      });
    }
    const authDate = params.get('auth_date');
    const record: TelegramInitData = {
      auth_date: authDate ? Number(authDate) : 0,
      hash,
    };
    for (const [key, value] of params.entries()) {
      if (key === 'hash' || key === 'auth_date') {
        continue;
      }
      if (key === 'user') {
        record.user = JSON.parse(value) as TelegramWebAppUser;
      } else {
        record[key] = value;
      }
    }
    return record;
  }

  private verifySignature(raw: string, hash: string, botToken: string): void {
    const params = new URLSearchParams(raw);
    params.delete('hash');
    const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculated = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const a = Buffer.from(calculated, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException({
        message: 'Invalid Telegram init data signature',
        code: ErrorCodes.INVALID_TELEGRAM_AUTH,
      });
    }
  }

  private parseUser(user: TelegramWebAppUser | undefined): TelegramWebAppUser {
    if (!user?.id) {
      throw new UnauthorizedException({
        message: 'Telegram user missing from init data',
        code: ErrorCodes.INVALID_TELEGRAM_AUTH,
      });
    }
    return user;
  }
}
