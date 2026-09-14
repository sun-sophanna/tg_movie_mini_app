import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { ErrorCodes } from '../../../common/constants/error-codes';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configured = this.config.get<string>('ADMIN_API_KEY')?.trim();
    if (!configured) {
      throw new UnauthorizedException({
        message: 'Admin API is not configured (set ADMIN_API_KEY)',
        code: ErrorCodes.ADMIN_UNAUTHORIZED,
      });
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const headerKey = request.headers['x-admin-key']?.trim();
    const auth = request.headers.authorization?.trim();
    const bearerKey = auth?.startsWith('Admin ') ? auth.slice(6).trim() : undefined;
    const provided = headerKey || bearerKey;

    if (!provided || !this.safeEqual(provided, configured)) {
      throw new UnauthorizedException({
        message: 'Invalid admin key',
        code: ErrorCodes.ADMIN_UNAUTHORIZED,
      });
    }
    return true;
  }

  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }
}
