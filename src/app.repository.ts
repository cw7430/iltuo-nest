import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import * as schema from '@/modules/database/schemas';
import { type DbOrTx } from '@/modules/database/types';

@Injectable()
export class AppRepository {
  async findAllMajorCategories(conn: DbOrTx) {
    const { majorCategory } = schema;
    const result = await conn
      .select()
      .from(majorCategory)
      .where(eq(majorCategory.isValid, true))
      .orderBy(majorCategory.sortKey, majorCategory.majorCategoryId);

    return result ?? undefined;
  }

  async findAllMinerCategories(conn: DbOrTx) {
    const { minerCategory, majorCategory } = schema;
    const {
      minerCategoryId,
      majorCategoryId,
      sortKey,
      minerCategoryName,
      isValid,
      createdAt,
      updatedAt,
      deletedAt,
    } = minerCategory;

    const result = await conn
      .select({
        minerCategoryId,
        majorCategoryId,
        sortKey,
        minerCategoryName,
        isValid,
        createdAt,
        updatedAt,
        deletedAt,
      })
      .from(minerCategory)
      .where(eq(isValid, true))
      .innerJoin(
        majorCategory,
        eq(majorCategoryId, majorCategory.majorCategoryId),
      )
      .orderBy(
        majorCategory.sortKey,
        minerCategory.sortKey,
        minerCategory.minerCategoryId,
      );

    return result ?? undefined;
  }
}
