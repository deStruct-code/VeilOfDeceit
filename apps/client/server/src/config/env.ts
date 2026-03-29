export const env = {
  PORT:         process.env.PORT         || '8000',
  NODE_ENV:     process.env.NODE_ENV     || 'development',
  CLIENT_URL:   process.env.CLIENT_URL   || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgresqwe%@localhost:5432/veil',

  GOOGLE_CLIENT_ID:     process.env.GOOGLE_CLIENT_ID     || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI:  process.env.GOOGLE_REDIRECT_URI  || '',

  SESSION_SECRET: process.env.SESSION_SECRET || 'veil-dev-secret-change-in-prod',
};