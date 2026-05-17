import { registerDecorator, ValidationOptions } from 'class-validator';

export const IsBigInt =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isBigInt',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'bigint';
        },
      },
    });
  };
