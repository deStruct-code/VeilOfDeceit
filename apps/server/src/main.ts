import express from 'express';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';

const app = express();
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const hasClientBuild = fs.existsSync(clientDistPath);

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

if (hasClientBuild) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API route not found' });
      return;
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      env: env.NODE_ENV,
      message: 'Client build not found. Build apps/client first.',
    });
  });
}

app.listen(env.PORT, () => {
  console.log(`Server started on port ${env.PORT}`);
  console.log(`CORS allowed for: ${env.CLIENT_URL}`);
});
