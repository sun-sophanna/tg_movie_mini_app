import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from '@movie/types';
import { UserEntity, UserStatus } from './entities/user.entity';
import { TelegramWebAppUser } from '../auth/telegram-init-data.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async upsertFromTelegram(tg: TelegramWebAppUser): Promise<UserEntity> {
    const telegramUserId = String(tg.id);
    let user = await this.repo.findOne({ where: { telegramUserId } });
    const now = new Date();
    if (!user) {
      user = this.repo.create({
        telegramUserId,
        username: tg.username ?? null,
        firstName: tg.first_name ?? null,
        lastName: tg.last_name ?? null,
        languageCode: tg.language_code ?? null,
        photoUrl: tg.photo_url ?? null,
        status: UserStatus.ACTIVE,
        lastSeenAt: now,
      });
    } else {
      user.username = tg.username ?? user.username;
      user.firstName = tg.first_name ?? user.firstName;
      user.lastName = tg.last_name ?? user.lastName;
      user.languageCode = tg.language_code ?? user.languageCode;
      user.photoUrl = tg.photo_url ?? user.photoUrl;
      user.lastSeenAt = now;
    }
    return this.repo.save(user);
  }

  toDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      telegramUserId: user.telegramUserId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      languageCode: user.languageCode,
      photoUrl: user.photoUrl,
      status: user.status,
    };
  }
}
