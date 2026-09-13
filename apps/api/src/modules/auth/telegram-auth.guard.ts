import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { ErrorCodes } from '../../common/constants/error-codes';
import { TelegramAuthService } from './telegram-auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private readonly telegramAuth: TelegramAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const header = request.headers.authorization;
    if (!header?.startsWith('tma ')) {
      throw new UnauthorizedException({
        message: 'Missing Telegram authorization',
        code: ErrorCodes.UNAUTHORIZED,
      });
    }

    const initData = header.slice(4).trim();
    request.user = await this.telegramAuth.authenticateInitData(initData);
    return true;
  }
}
