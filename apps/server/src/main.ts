import express from 'express';
import { env } from './config/env';

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', env.CLIENT_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

app.listen(env.PORT, () => {
  console.log(`Server started on port ${env.PORT}`);
  console.log(`CORS allowed for: ${env.CLIENT_URL}`);
});
