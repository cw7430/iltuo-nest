import { IsInt, IsOptional, Max, Min } from 'class-validator';
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

export class PageResponseDto<T> {
  protected constructor(
    readonly content: T[],
    readonly totalElements: number,
    readonly totalPages: number,
    readonly page: number,
    readonly size: number,
    readonly startPage: number,
    readonly endPage: number,
    readonly hasNext: boolean,
    readonly hasPrevious: boolean,
  ) {}

  static of<T>(
    content: T[],
    pageRequest: PageRequestDto,
    totalElements: number,
  ): PageResponseDto<T> {
    const totalPages = Math.ceil(totalElements / pageRequest.size);

    const startPage =
      Math.floor((pageRequest.page - 1) / pageRequest.blockSize) *
        pageRequest.blockSize +
      1;

    const endPage = Math.min(startPage + pageRequest.blockSize - 1, totalPages);

    return new PageResponseDto(
      content,
      totalElements,
      totalPages,
      pageRequest.page,
      pageRequest.size,
      startPage,
      endPage,
      endPage < totalPages,
      startPage > 1,
    );
  }
}
