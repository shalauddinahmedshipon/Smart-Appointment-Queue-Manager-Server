import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as any).message || 'Internal server error';

    // ✅ Log the actual error and stack trace
    this.logger.error(
      `💥 ${request.method} ${request.url}`,
      (exception as any).stack,
      JSON.stringify(message),
    );

    response.status(status).json({
      statusCode: status,
      success: false,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || message,
      path: request.url,
    });
  }
}