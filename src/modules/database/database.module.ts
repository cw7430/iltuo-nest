import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { inspect } from 'util';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schemas';
import type { DbConfig } from '@/common/config';

const DRIZZLE = 'DRIZZLE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService,
      ): Promise<NodePgDatabase<typeof schema>> => {
        const log = new Logger('Drizzle');

        const db = config.getOrThrow<DbConfig>('db');

        const pool = new Pool({
          host: db.HOST,
          port: db.PORT,
          user: db.USER,
          password: db.PASSWORD,
          database: db.NAME,
          ssl: db.SSL
        });

        try {
          await pool.query('SELECT 1');
          log.log('PostgreSQL connected successfully');
        } catch (e) {
          log.error('Database connection failed', e);
          throw e;
        }

        return drizzle(pool, {
          schema,
          logger: {
            logQuery(query: string, params: unknown[]) {
              log.debug(query);
              log.debug(inspect(params, { colors: true, depth: null }));
            },
          },
        });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
