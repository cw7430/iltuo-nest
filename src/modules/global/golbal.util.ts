import { Injectable } from '@nestjs/common';

import { PageRequestDto } from './dto';

@Injectable()
export class GlobalUtil {
  convertToPage<T>(
    content: T[],
    pageRequest: PageRequestDto,
    totalElements: number,
  ) {
    const totalPages = Math.ceil(totalElements / pageRequest.size);
    const startPage =
      Math.floor((pageRequest.page - 1) / pageRequest.blockSize) *
        pageRequest.blockSize +
      1;
    const endPage = Math.min(startPage + pageRequest.blockSize - 1, totalPages);

    return {
      content,
      totalElements,
      totalPages,
      currentPage: pageRequest.page,
      size: pageRequest.size,
      startPage,
      endPage,
      hasNext: endPage < totalPages,
      hasPrevious: startPage > 1,
    };
  }
}
