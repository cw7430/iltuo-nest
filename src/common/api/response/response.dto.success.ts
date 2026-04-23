import { ResponseDto } from './response.dto';
import { ResponseCode } from './response.code';

export abstract class SuccessResponseDto extends ResponseDto {
  protected constructor() {
    super(ResponseCode.SUCCESS.code, ResponseCode.SUCCESS.message);
  }

  static ok(): SuccessSimpleResponseDto {
    return SuccessSimpleResponseDto.INSTANCE;
  }

  static okWith<T>(result: T): SuccessWithResultResponseDto<T> {
    return new SuccessWithResultResponseDto(result);
  }
}

class SuccessSimpleResponseDto extends SuccessResponseDto {
  static readonly INSTANCE = new SuccessSimpleResponseDto();

  private constructor() {
    super();
  }
}

class SuccessWithResultResponseDto<T> extends SuccessResponseDto {
  readonly result: T;

  constructor(result: T) {
    super();
    this.result = result;
  }
}