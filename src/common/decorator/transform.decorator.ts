import { Transform, TransformFnParams } from 'class-transformer';

export const TransformBigintToString = () => {
  return Transform(({ value }: TransformFnParams): string => {
    return typeof value === 'bigint' ? value.toString() : value;
  });
};

export const TransformStringToBigint = () => {
  return Transform(({ value }: TransformFnParams): bigint => {
    return typeof value === 'string' ? BigInt(value) : value;
  });
};

export const TransformNumberToString = () => {
  return Transform(({ value }: TransformFnParams): string => {
    return typeof value === 'number' ? value.toString() : value;
  });
};

export const TransformStringToNumber = () => {
  return Transform(({ value }: TransformFnParams): number => {
    return typeof value === 'string' ? Number(value) : value;
  });
};
