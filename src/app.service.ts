import { Inject, Injectable, Logger } from '@nestjs/common';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { plainToInstance } from 'class-transformer';

import { AppRepository } from './app.repository';
import * as schema from '@/modules/database/schemas';
import { CustomException } from '@/common/api/exception';
import { CategoryResponseDto } from './dto';
@Injectable()
export class AppService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly appRepository: AppRepository,
  ) {}

  private readonly log = new Logger(AppService.name);

  getHello(): string {
    this.log.log('It is Healthy');
    return 'Hello World!';
  }

  async categories() {
    const majorCategories = await this.appRepository.findAllMajorCategories(
      this.db,
    );
    const minerCategories = await this.appRepository.findAllMinerCategories(
      this.db,
    );

    if (!majorCategories || !minerCategories) {
      throw new CustomException('RESOURCE_NOT_FOUND');
    }

    const response = majorCategories.map((majorCategory) => {
      const minerCategory = minerCategories.filter(
        (minerCategory) =>
          minerCategory.majorCategoryId === majorCategory.majorCategoryId,
      );
      return { ...majorCategory, minerCategories: minerCategory };
    });

    this.log.debug('Categories Called');

    return plainToInstance(CategoryResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
