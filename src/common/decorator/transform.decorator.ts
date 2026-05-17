import { Transform, TransformFnParams } from 'class-transformer';

export const TransformBigintToString = () =>
  Transform(({ value }: TransformFnParams): string => {
    return typeof value === 'bigint' ? value.toString() : value;
  });

export const TransformStringToBigint = () =>
  Transform(({ value }: TransformFnParams): bigint | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    try {
      return typeof value === 'string' ? BigInt(value) : value;
    } catch {
      return value;
    }
  });

export const TransformNumberToString = () =>
  Transform(({ value }: TransformFnParams): string => {
    return typeof value === 'number' ? value.toString() : value;
  });

export const TransformStringToNumber = () =>
  Transform(({ value }: TransformFnParams): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = typeof value === 'string' ? Number(value) : value;

    return Number.isNaN(parsed) ? value : parsed;
  });
