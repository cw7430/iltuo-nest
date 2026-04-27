const { defineConfig } = require('drizzle-kit');
const dotenv = require('dotenv');

dotenv.config();

module.exports = defineConfig({
  dialect: 'postgresql',
  schema: './src/modules/database/schemas/*.schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) ?? 5432,
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'iltuo',
    ssl: process.env.APP_ENV === 'production' ? true : false,
  },
  verbose: true,
  strict: true,
});
