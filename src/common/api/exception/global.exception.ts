import {
  Logger,
  Catch,
  HttpException,
  type ExceptionFilter,
  type ArgumentsHost,
} from '@nestjs/common';
import { type FastifyReply } from 'fastify';

import {
  ErrorResponseDto,
  ResponseCode,
  type ResponseCodeKey,
} from '@/common/api/response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private handler = new GlobalExceptionHandler();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    if (exception instanceof CustomException) {
      const errorResponse = this.handler.handleCustomException(exception);
      const status = ResponseCode[exception.responseCodeKey].status;
      reply.status(status).send(errorResponse);
      return;
    }

    const errorResponse = this.handler.handleGeneralException(exception);
    reply.status(ResponseCode.INTERNAL_SERVER_ERROR.status).send(errorResponse);
  }
}

export class GlobalExceptionHandler {
  private readonly log = new Logger(GlobalExceptionHandler.name);

  handleCustomException(exception: CustomException<unknown>): ErrorResponseDto {
    if (exception.responseCodeKey === 'VALIDATION_ERROR') {
      this.log.warn(
        `Validation exception occurred: ${JSON.stringify(exception.payload)}`,
      );

      return ErrorResponseDto.fromWithErrors(
        ResponseCode.VALIDATION_ERROR,
        exception.payload,
      );
    }

    this.log.error(`Custom exception occurred: ${exception.responseCodeKey}`);
    return ErrorResponseDto.from(ResponseCode[exception.responseCodeKey]);
  }

  handleGeneralException(exception: unknown): ErrorResponseDto {
    if (this.isMySqlError(exception)) {
      this.log.error(
        `Database Error: [${exception.code}] ${exception.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
      return ErrorResponseDto.from(ResponseCode.INTERNAL_SERVER_ERROR);
    }

    this.log.error('Unhandled exception occurred:', exception);
    return ErrorResponseDto.from(ResponseCode.INTERNAL_SERVER_ERROR);
  }

  private isMySqlError(
    exception: unknown,
  ): exception is {
    code: string | number;
    message: string;
    errno?: number;
    sqlState?: string;
  } {
    const ex = exception as Record<string, unknown>;

    return (
      !!ex &&
      (typeof ex.errno === 'number' || typeof ex.code === 'string') &&
      typeof ex.message === 'string'
    );
  }
}

export class CustomException<T = unknown> extends HttpException {
  constructor(
    public readonly responseCodeKey: ResponseCodeKey,
    public readonly payload?: T,
  ) {
    const responseCode = ResponseCode[responseCodeKey];

    super(
      {
        code: responseCode.code,
        message: responseCode.message,
        payload,
      },
      responseCode.status,
    );
  }
}
