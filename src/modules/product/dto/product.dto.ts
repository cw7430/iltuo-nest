import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductRequestDto {
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
  minerCategoryId!: string;

  @IsNotEmpty({
    message: '제품명을 입력해주세요.',
  })
  @IsString({
    message: '제품명 형식이 올바르지 않습니다.',
  })
  @MaxLength(255, { message: '255자 이하로 작성해주요.' })
  @ApiProperty({
    description: '제품명',
    type: String,
  })
  productName!: string;

  @IsOptional()
  @IsString({
    message: '제품설명 형식이 올바르지 않습니다.',
  })
  @MaxLength(255, { message: '255자 이하로 작성해주요.' })
  @ApiProperty({
    description: '제품설명',
    type: String,
  })
  productComments: string | null = null;

  @IsNotEmpty({
    message: '가격을 입력하여주세요.',
  })
  @Matches(/^([0-9])/, {
    message: '가격 형식이 올바르지 않습니다.',
  })
  @ApiProperty({
    description: '가격',
    type: String,
    example: '1',
  })
  price!: string;

  @IsOptional()
  @Matches(/^\d*$/, {
    message: '할인율 형식이 올바르지 않습니다.',
  })
  @ApiProperty({
    description: '할인율',
    type: String,
    example: '0',
  })
  discountRate: string = '0';
}
