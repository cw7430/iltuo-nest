import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { TransformStringToNumber } from '@/common/decorator';

export class PageRequestDto {
  @TransformStringToNumber()
  @IsOptional()
  @IsInt({ message: '숫자만 가능합니다.' })
  @Min(1, { message: '1 이상만 가능합니다.' })
  @ApiProperty({
    description: '페이지 번호',
    type: Number,
    example: 1,
  })
  page: number = 1;

  @TransformStringToNumber()
  @IsOptional()
  @IsInt({ message: '숫자만 가능합니다.' })
  @Min(8, { message: '8 이상 64 이하만 가능합니다.' })
  @Max(100, { message: '8 이상 64 이하만 가능합니다.' })
  @ApiProperty({
    description: '페이지 당 요소',
    type: Number,
    example: 8,
  })
  size: number = 8;

  @TransformStringToNumber()
  @IsOptional()
  @IsInt({ message: '숫자만 가능합니다.' })
  @Min(5, { message: '5 이상 10 이하만 가능합니다.' })
  @Max(10, { message: '5 이상 10 이하만 가능합니다.' })
  @ApiProperty({
    description: '페이지 블록 당 페이지 번호 수',
    type: Number,
    example: 8,
  })
  blockSize: number = 5;
}

export class PageResponseDto {
  @Expose()
  @ApiProperty({
    description: '총 요소 개수',
    type: Number,
    example: 100,
  })
  totalElements!: number;

  @Expose()
  @ApiProperty({
    description: '총 페이지 개수',
    type: Number,
    example: 20,
  })
  totalPages!: number;

  @Expose()
  @ApiProperty({
    description: '현재 페이지',
    type: Number,
    example: 1,
  })
  currentPage!: number;

  @Expose()
  @ApiProperty({
    description: '페이지 당 요소',
    type: Number,
    example: 8,
  })
  size!: number;

  @Expose()
  @ApiProperty({
    description: '시작 페이지',
    type: Number,
    example: 1,
  })
  startPage!: number;

  @Expose()
  @ApiProperty({
    description: '끝 페이지',
    type: Number,
    example: 20,
  })
  endPage!: number;

  @Expose()
  @ApiProperty({
    description: '다음 블록 유무',
    type: Boolean,
    example: true,
  })
  hasNext!: boolean;

  @Expose()
  @ApiProperty({
    description: '이전 블록 유무',
    type: Boolean,
    example: false,
  })
  hasPrevious!: boolean;
}
