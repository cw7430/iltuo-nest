import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { TransformBigintToString } from '@/common/decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddressRequestDto {
  @IsString({
    message: '우편 번호 형식이 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '우편 번호를 입력해 주세요.',
  })
  @ApiProperty({
    description: '우편 번호',
    type: String,
    example: '14579',
  })
  postalCode!: string;

  @IsString({
    message: '주소 형식이 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '주소를 입력해 주세요.',
  })
  @ApiProperty({
    description: '주소',
    type: String,
    example: 'OO도 OO시 OO구 OO로 000',
  })
  defaultAddress!: string;

  @IsOptional()
  @ApiProperty({
    description: '상세 주소',
    type: String,
    example: ', 000동 0000호',
    nullable: true,
  })
  detailAddress: string | null = null;

  @IsOptional()
  @ApiProperty({
    description: '추가 주소',
    type: String,
    example: '(OO동)',
    nullable: true,
  })
  extraAddress: string | null = null;
}

export class AddressResponseDto {
  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '주소 일련번호',
    type: String,
    example: '1',
  })
  addressId!: bigint;

  @Expose()
  @TransformBigintToString()
  @ApiProperty({
    description: '회원 일련번호',
    type: String,
    example: '1',
  })
  userId!: bigint;

  @Expose()
  @ApiProperty({
    description: '우편 번호',
    type: String,
    example: '14579',
  })
  postalCode!: string;

  @Expose()
  @ApiProperty({
    description: '주소',
    type: String,
    example: 'OO도 OO시 OO구 OO로 000',
  })
  defaultAddress!: string;

  @Expose()
  @ApiProperty({
    description: '상세 주소',
    type: String,
    example: '000동 0000호',
    nullable: true,
  })
  detailAddress!: string | null;

  @Expose()
  @ApiProperty({
    description: '추가 주소',
    type: String,
    example: '(OO동)',
    nullable: true,
  })
  extraAddress!: string | null;

  @Expose()
  @ApiProperty({
    description: '기본 주소 여부',
    type: Boolean,
    example: false,
  })
  isMain!: boolean;

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
