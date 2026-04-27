import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model?: TModel,
) => {
  const properties: Record<string, any> = {
    code: { type: 'string', example: 'SU' },
    message: { type: 'string', example: '요청이 성공적으로 처리되었습니다.' },
  };

  if (model) {
    properties.result = {
      $ref: getSchemaPath(model),
    };
  }

  const decorators = [
    ApiOkResponse({
      schema: {
        properties,
      },
    }),
  ];

  if (model) {
    decorators.push(ApiExtraModels(model));
  }

  return applyDecorators(...decorators);
};
