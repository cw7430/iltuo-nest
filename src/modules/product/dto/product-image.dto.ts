import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { TransformStringToBigint } from '@/common/decorator';

export class ProductImageRequestDto {
  @TransformStringToBigint()
  @IsNotEmpty({
    message: '일련번호를 입력하여주세요.',
  })
  @Matches(/^([0-9])/, {
    message: '일련번호 형식이 올바르지 않습니다.',
  })
  @ApiProperty({
    description: '일련번호',
    type: String,
    example: '1',
  })
  productImageId!: bigint;

  @TransformStringToBigint()
  @IsNotEmpty({
    message: '파일 크기를 입력하여주세요.',
  })
  @Matches(/^([0-9])/, {
    message: '파일 크기 형식이 올바르지 않습니다.',
  })
  @ApiProperty({
    description: '파일 크기',
    type: String,
    example: '10485760',
  })
  fileSize!: bigint;
}
