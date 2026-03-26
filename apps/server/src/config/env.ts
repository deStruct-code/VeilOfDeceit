export const env = {
  PORT:         process.env.PORT         || '8000',
  NODE_ENV:     process.env.NODE_ENV     || 'development',
  CLIENT_URL:   process.env.CLIENT_URL   || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgresqwe%@localhost:5432/veil',
};
