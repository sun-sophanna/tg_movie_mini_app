import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { TelegramAuthService } from './telegram-auth.service';
import { UsersService } from '../users/users.service';

function buildValidInitData(botToken: string, user: object, authDate: number): string {
  const userJson = JSON.stringify(user);
  const params = new URLSearchParams({
    auth_date: String(authDate),
    user: userJson,
  });
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  params.set('hash', hash);
  return params.toString();
}

describe('TelegramAuthService', () => {
  const botToken = '123456:ABC-DEF';
  let usersService: jest.Mocked<UsersService>;
  let service: TelegramAuthService;

  beforeEach(() => {
    usersService = {
      upsertFromTelegram: jest.fn().mockResolvedValue({ id: 'user-1' }),
    } as unknown as jest.Mocked<UsersService>;

    const config = {
      get: (key: string, fallback?: unknown) => {
        const map: Record<string, unknown> = {
          TELEGRAM_BOT_TOKEN: botToken,
          TELEGRAM_AUTH_MAX_AGE_SECONDS: 86400,
          NODE_ENV: 'test',
          TELEGRAM_MOCK_AUTH_ENABLED: false,
        };
        return map[key] ?? fallback;
      },
    } as ConfigService;

    service = new TelegramAuthService(config, usersService);
  });

  it('accepts valid initData signature', async () => {
    const authDate = Math.floor(Date.now() / 1000);
    const initData = buildValidInitData(botToken, { id: 42, first_name: 'Test' }, authDate);
    await service.authenticateInitData(initData);
    expect(usersService.upsertFromTelegram).toHaveBeenCalled();
  });

  it('rejects tampered initData', async () => {
    const authDate = Math.floor(Date.now() / 1000);
    const initData = buildValidInitData(botToken, { id: 42, first_name: 'Test' }, authDate);
    const tampered = initData.replace('Test', 'Hacker');
    await expect(service.authenticateInitData(tampered)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects expired auth_date', async () => {
    const authDate = Math.floor(Date.now() / 1000) - 90000;
    const initData = buildValidInitData(botToken, { id: 42, first_name: 'Test' }, authDate);
    await expect(service.authenticateInitData(initData)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
