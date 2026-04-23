export abstract class ResponseDto {
  readonly code: string;
  readonly message: string;

  protected constructor(code: string, message: string) {
    this.code = code;
    this.message = message;
  }
}

export interface ResponseType {
  code: string;
  message: string;
}
