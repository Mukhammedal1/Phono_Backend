import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable, 
  Inject, 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'; 
import { Logger as WinstonLogger } from 'winston'; 

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  correlationId?: string;
  message: string | object;
}

@Injectable() 
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const requestDetails = {
      method: request.method,
      path: request.url,
      ip: request.ip,
    };

    let responseMessage: string | object;
    let logMessage: string;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      responseMessage =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : exceptionResponse;
      logMessage = `HTTP Exception: ${exception.message || JSON.stringify(exceptionResponse)}`;
    } else if (exception instanceof Error) {
      responseMessage = 'An unexpected internal server error occurred.';
      logMessage = `Unhandled Error: ${exception.message}`;
    } else {
      responseMessage = 'An unexpected internal server error occurred.';
      logMessage = 'Unhandled unknown exception';
    }

    this.logger.error(logMessage, {
      status,
      exception,
      request: requestDetails,
    });

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: responseMessage,
    };

    response.status(status).json(errorResponse);
  }
}