import { mysqlTable, bigint, varchar } from 'drizzle-orm/mysql-core';

import { timestampsForSoftDelete } from '@/modules/database/utils';
import { primaryKey } from 'drizzle-orm/mysql-core';

export const user = mysqlTable(
  'user',
  {
    userId: bigint('id', { mode: 'bigint' }).primaryKey().autoincrement(),
    userName: varchar('user_name', { length: 255 }).notNull(),
    authRole: varchar('auth_role', { length: 10 }).notNull(),
    ...timestampsForSoftDelete,
  },
  (tb) => [primaryKey({ name: 'pk_user', columns: [tb.userId] })],
);
