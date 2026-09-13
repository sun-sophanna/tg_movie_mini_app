import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ErrorCodes } from '../constants/error-codes';

function defaultCodeForStatus(status: number): string {
  if (status === HttpStatus.BAD_REQUEST) return 'VALIDATION_ERROR';
  if (status === HttpStatus.UNAUTHORIZED) return ErrorCodes.UNAUTHORIZED;
  if (status === HttpStatus.FORBIDDEN) return ErrorCodes.FORBIDDEN;
  if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
  if (status === HttpStatus.TOO_MANY_REQUESTS) return ErrorCodes.RATE_LIMIT_EXCEEDED;
  return ErrorCodes.DATABASE_UNAVAILABLE;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = defaultCodeForStatus(status);
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const obj = body as Record<string, unknown>;
        const rawMessage = obj.message ?? exception.message;
        message = Array.isArray(rawMessage)
          ? rawMessage.join('; ')
          : String(rawMessage);
        if (obj.code != null) {
          code = String(obj.code);
        }
      } else {
        message = String(body);
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = ErrorCodes.DATABASE_UNAVAILABLE;
      message = 'Database query failed';
      this.logger.error(exception.message, exception.stack);
    } else if (exception instanceof Error) {
      message = exception.message;
      if (/connect|ECONNREFUSED|timeout|database/i.test(exception.message)) {
        code = ErrorCodes.DATABASE_UNAVAILABLE;
        status = HttpStatus.SERVICE_UNAVAILABLE;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `Request failed ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      message,
      code,
    });
  }
}
