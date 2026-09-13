import { Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentTelegramUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth('tma')
@Controller({ path: 'favorites', version: '1' })
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentTelegramUser() user: UserEntity) {
    return this.favorites.list(user.id);
  }

  @Post(':movieId')
  add(@CurrentTelegramUser() user: UserEntity, @Param('movieId', ParseUUIDPipe) movieId: string) {
    return this.favorites.add(user.id, movieId);
  }

  @Delete(':movieId')
  remove(@CurrentTelegramUser() user: UserEntity, @Param('movieId', ParseUUIDPipe) movieId: string) {
    return this.favorites.remove(user.id, movieId);
  }
}
