const { defineConfig } = require('drizzle-kit');
const dotenv = require('dotenv');

dotenv.config();

module.exports = defineConfig({
  dialect: 'mysql',
  schema: './src/modules/database/schemas/**/*.ts',
  out: './drizzle',

  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) ?? 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'iltuo',
  },
});
