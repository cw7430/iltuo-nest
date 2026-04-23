import { ResponseDto, type ResponseType } from './response.dto';

export abstract class ErrorResponseDto extends ResponseDto {
  protected constructor(code: string, message: string) {
    super(code, message);
  }

  static from(responseCode: ResponseType): ErrorSimpleResponseDto {
    return new ErrorSimpleResponseDto(responseCode.code, responseCode.message);
  }

  static fromWithErrors<T>(
    responseCode: ResponseType,
    errors: T,
  ): ErrorWithErrorsResponseDto<T> {
    return new ErrorWithErrorsResponseDto(
      responseCode.code,
      responseCode.message,
      errors,
    );
  }
}

class ErrorSimpleResponseDto extends ErrorResponseDto {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

class ErrorWithErrorsResponseDto<T> extends ErrorResponseDto {
  readonly errors: T;

  constructor(code: string, message: string, errors: T) {
    super(code, message);
    this.errors = errors;
  }
}