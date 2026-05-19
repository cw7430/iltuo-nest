import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { TransformBigintToString } from '@/common/decorator';

class DetailOptionResponseDto {
  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '세부 옵션 일련번호',
    type: String,
    example: '1',
  })
  detailOptionId!: bigint;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '옵션 일련번호',
    type: String,
    example: '1',
  })
  optionId!: bigint;

  @Expose()
  @ApiProperty({
    description: '세부 옵션 명칭',
    type: String,
    example: '풀시티',
  })
  detailOptionName!: string;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '변화 가격',
    type: String,
    example: '110',
  })
  optionValue!: string;

  @Expose()
  @ApiProperty({ description: '유효성 여부', type: String, example: true })
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

export class OptionResponseDto {
  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '옵션 일련번호',
    type: String,
    example: '1',
  })
  optionId!: bigint;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '주 카테고리 일련번호',
    type: String,
    example: '1',
  })
  majorCategoryId!: bigint;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({ description: '정렬 키', type: String, example: '1' })
  sortKey!: bigint;

  @Expose()
  @ApiProperty({ description: '옵션 명칭', type: String, example: '배전도' })
  optionName!: string;

  @Expose()
  @ApiProperty({ description: '옵션 종류', type: String, example: 'RATE' })
  optionType!: 'RATE' | 'ABSOLUTE';

  @Expose()
  @ApiProperty({ description: '유효성 여부', type: String, example: true })
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

  @Expose()
  @Type(() => DetailOptionResponseDto)
  @ApiProperty({
    description: '세부 옵션',
    type: () => [DetailOptionResponseDto],
  })
  detailOptions!: DetailOptionResponseDto[];
}
