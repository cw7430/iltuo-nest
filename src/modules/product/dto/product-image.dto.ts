import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductImageRequestDto {
  @IsNotEmpty({
    message: '일련번호를 입력하여주세요.',
  })
  @Matches(/^\d+$/, {
    message: '일련번호 형식이 올바르지 않습니다.',
  })
  @ApiProperty({
    description: '일련번호',
    type: String,
    example: '1',
  })
  productImageId!: string;
}
