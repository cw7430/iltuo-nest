import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

const successProperties: Record<string, any> = {
  code: { type: 'string', example: 'SU' },
  message: { type: 'string', example: '요청이 성공적으로 처리되었습니다.' },
};

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model?: TModel,
) => {
  const properties: Record<string, any> = {
    ...successProperties,
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

export const ApiSuccessResponsePage = <TModel extends Type<any>>(
  model?: TModel,
) => {
  const pageProperties: Record<string, any> = {
    totalElements: {
      type: 'number',
      example: 100,
    },
    totalPages: {
      type: 'number',
      example: 20,
    },
    page: {
      type: 'number',
      example: 1,
    },
    size: {
      type: 'number',
      example: 8,
    },
    startPage: {
      type: 'number',
      example: 1,
    },
    endPage: {
      type: 'number',
      example: 5,
    },
    hasNext: {
      type: 'boolean',
      example: true,
    },
    hasPrevious: {
      type: 'boolean',
      example: false,
    },
  };

  if (model) {
    pageProperties.content = {
      type: 'array',
      items: {
        $ref: getSchemaPath(model),
      },
    };
  }

  const properties: Record<string, any> = {
    ...successProperties,
    result: {
      type: 'object',
      properties: pageProperties,
    },
  };

  const decorators = [
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: properties,
      },
    }),
  ];

  if (model) {
    decorators.push(ApiExtraModels(model));
  }

  return applyDecorators(...decorators);
};
