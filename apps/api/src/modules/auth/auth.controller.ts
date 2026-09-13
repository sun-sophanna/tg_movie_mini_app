import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTelegramUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@ApiBearerAuth('tma')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@CurrentTelegramUser() user: UserEntity) {
    return this.usersService.toDto(user);
  }
}
