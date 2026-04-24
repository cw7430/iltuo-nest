import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { inspect } from 'util';
import { drizzle } from 'drizzle-orm/mysql2';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

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
      ): Promise<MySql2Database<typeof schema>> => {
        const log = new Logger('Drizzle');

        const db = config.getOrThrow<DbConfig>('db');

        const pool = mysql.createPool({
          host: db.HOST,
          port: db.PORT,
          user: db.USER,
          password: db.PASSWORD,
          database: db.NAME,
          charset: db.CHARSET,
          waitForConnections: true,
          timezone: db.TIMEZONE,
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
          mode: 'default',
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
