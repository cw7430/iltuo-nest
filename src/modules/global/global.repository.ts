import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import * as schema from '@/modules/database/schemas';
import { type DbOrTx } from '@/modules/database/types';

@Injectable()
export class GlobalRepository {
  private findMajorCategories(conn: DbOrTx) {
    return conn.select().from(schema.majorCategory);
  }

  private findMinerCategories(conn: DbOrTx) {
    const { minerCategory } = schema;
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

    return conn
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
      .from(minerCategory);
  }

  async findAllMajorCategories(conn: DbOrTx) {
    const { majorCategory } = schema;
    const result = await this.findMajorCategories(conn)
      .where(eq(majorCategory.isValid, true))
      .orderBy(majorCategory.sortKey, majorCategory.majorCategoryId);

    return result ?? undefined;
  }

  async findMajorCategoryById(conn: DbOrTx, majorCategoryId: bigint) {
    const { majorCategory } = schema;
    const result = await this.findMajorCategories(conn).where(
      and(
        eq(majorCategory.isValid, true),
        eq(majorCategory.majorCategoryId, majorCategoryId),
      ),
    );

    return result[0] ?? undefined;
  }

  async findAllMinerCategories(conn: DbOrTx) {
    const { minerCategory, majorCategory } = schema;

    const result = await this.findMinerCategories(conn)
      .innerJoin(
        majorCategory,
        eq(minerCategory.majorCategoryId, majorCategory.majorCategoryId),
      )
      .where(eq(minerCategory.isValid, true))
      .orderBy(
        majorCategory.sortKey,
        minerCategory.sortKey,
        minerCategory.minerCategoryId,
      );

    return result ?? undefined;
  }

  async findMinerCategoriesByMajorCategoryId(
    conn: DbOrTx,
    majorCategoryId: bigint,
  ) {
    const { minerCategory } = schema;

    const result = await this.findMinerCategories(conn)
      .where(
        and(
          eq(minerCategory.isValid, true),
          eq(minerCategory.majorCategoryId, majorCategoryId),
        ),
      )
      .orderBy(minerCategory.sortKey, minerCategory.minerCategoryId);

    return result ?? undefined;
  }
}
