import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { TransformBigintToString } from '@/common/decorator';

class MinerCategoryResponseDto {
  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '부 카테고리 일련번호',
    type: String,
    example: 1,
  })
  minerCategoryId!: bigint;

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
  @ApiProperty({ description: '부 카테고리 명칭', type: String, example: '1' })
  minerCategoryName!: string;

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
  @ApiProperty({ description: '삭제일', type: Date })
  deletedAt!: Date | null;
}

export class CategoryResponseDto {
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
  @Type(() => MinerCategoryResponseDto)
  @ApiProperty({
    description: '부 카테고리',
    type: () => [MinerCategoryResponseDto],
  })
  minerCategories!: MinerCategoryResponseDto[];

  @Expose()
  @ApiProperty({ description: '주 카테고리 명칭', type: String, example: '1' })
  majorCategoryName!: string;

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
  @ApiProperty({ description: '삭제일', type: Date })
  deletedAt!: Date | null;
}
