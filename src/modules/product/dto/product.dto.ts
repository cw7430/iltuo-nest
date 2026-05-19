import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
  IsIn,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import {
  IsBigInt,
  TransformBigintToString,
  TransformStringToBigint,
} from '@/common/decorator';
import {
  PageRequestDto,
  CategoryResponseDto,
  PageResponseDto,
} from '@/modules/global/dto';
import { OptionResponseDto } from './option.dto';
export class ProductsRequestDto extends PageRequestDto {
  constructor() {
    super();
  }

  @TransformStringToBigint()
  @ApiProperty({
    description: '부 카테고리 일련번호',
    type: String,
    example: '0',
  })
  @IsOptional()
  @IsBigInt({
    message: '숫자만 입력 가능합니다.',
  })
  minerCategoryId: bigint = 0n;

  @IsOptional()
  @IsIn(['recommended', 'priceAsc', 'priceDesc', 'createdAsc', 'createdDesc'], {
    message: '정렬 기준이 올바르지 않습니다.',
  })
  @ApiProperty({
    description: '정렬 기준',
    type: String,
    example: 'recommended',
  })
  sort:
    | 'recommended'
    | 'priceAsc'
    | 'priceDesc'
    | 'createdAsc'
    | 'createdDesc' = 'recommended';
}

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
    nullable: true,
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

export class ProductResponseDto {
  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '상품 일련번호',
    type: String,
    example: '1',
  })
  productId!: bigint;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '부 카테고리 일련번호',
    type: String,
    example: '1',
  })
  minerCategoryId!: bigint;

  @Expose()
  @ApiProperty({
    description: '상품명',
    type: String,
    example: '파나마 게이샤',
  })
  productName!: string;

  @Expose()
  @ApiProperty({
    description: '상품 설명',
    type: String,
    example: '초콜레티한 향미',
    nullable: true,
  })
  productComments!: string | null;

  @Expose()
  @ApiProperty({
    description: '이미지 파일명',
    type: String,
    example: '3efa341b-92b6-4523-a80f-e8214e0817ff.jpg',
  })
  fileName!: string;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '상품 가격',
    type: String,
    example: '10000',
  })
  price!: bigint;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '상품 할인율',
    type: String,
    example: '10',
  })
  discountedRate!: bigint;

  @Expose()
  @ApiProperty({
    description: '추천 여부',
    type: Boolean,
    example: false,
  })
  isRecommended!: boolean;

  @Expose()
  @ApiProperty({
    description: '유효성 여부',
    type: Boolean,
    example: true,
  })
  isValid!: boolean;

  @Expose()
  @ApiProperty({ description: '생성일', type: Date })
  createdAt!: Date;

  @Expose()
  @ApiProperty({ description: '수정일', type: Date })
  updatedAt!: Date;

  @Expose()
  @ApiProperty({ description: '삭제일', type: Date, nullable: true })
  deletedAt!: Date | null;
}

class PagedProductsResponseDto extends PageResponseDto {
  constructor() {
    super();
  }

  @Expose()
  @Type(() => ProductResponseDto)
  @ApiProperty({
    description: '상품',
    type: () => [ProductResponseDto],
  })
  content!: ProductResponseDto[];
}

export class ProductsResponseDto extends CategoryResponseDto {
  constructor() {
    super();
  }

  @Expose()
  @Type(() => PagedProductsResponseDto)
  @ApiProperty({
    description: '상품 목록',
    type: () => PagedProductsResponseDto,
  })
  products!: PagedProductsResponseDto;
}

export class ProductDetailResponseDto extends ProductResponseDto {
  constructor() {
    super();
  }

  @Expose()
  @Type(() => OptionResponseDto)
  @ApiProperty({
    description: '옵션 목록',
    type: () => [OptionResponseDto],
  })
  options!: OptionResponseDto;
}
