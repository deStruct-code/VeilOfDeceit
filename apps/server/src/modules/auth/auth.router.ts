import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../../config/db';
import { env } from '../../config/env';

export const authRouter = Router();

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const SESSION_COOKIE = 'veil_session';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 дней

// ─── GET /auth/google — редирект на Google ────────────────────────────────────

authRouter.get('/google', (_req, res) => {
  const params = new URLSearchParams({
    client_id:     env.GOOGLE_CLIENT_ID,
    redirect_uri:  env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
});

// ─── GET /auth/google/callback — обработка кода от Google ────────────────────

authRouter.get('/google/callback', async (req, res) => {
  const code = String(req.query.code || '');

  if (!code) {
    res.redirect(`${env.CLIENT_URL}/?auth=error`);
    return;
  }

  try {
    // 1. Меняем code на access_token
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  env.GOOGLE_REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };

    if (!tokenData.access_token) {
      console.error('[auth] Token exchange failed:', tokenData.error);
      res.redirect(`${env.CLIENT_URL}/?auth=error`);
      return;
    }

    // 2. Получаем данные пользователя
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json() as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };

    // 3. Upsert пользователя в БД
    const { rows } = await db.query<{ id: number; name: string }>(
      `INSERT INTO users (google_id, email, name, avatar)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE
         SET email  = EXCLUDED.email,
             name   = EXCLUDED.name,
             avatar = EXCLUDED.avatar
       RETURNING id, name`,
      [googleUser.id, googleUser.email, googleUser.name, googleUser.picture ?? null]
    );

    const user = rows[0];

    // 4. Создаём сессию
    const token = crypto.randomBytes(32).toString('hex');

    await db.query(
      `INSERT INTO sessions (token, user_id) VALUES ($1, $2)`,
      [token, user.id]
    );

    // 5. Ставим cookie и редиректим на клиент
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   COOKIE_MAX_AGE,
    });

    res.redirect(`${env.CLIENT_URL}/`);
  } catch (err) {
    console.error('[auth] Callback error:', err);
    res.redirect(`${env.CLIENT_URL}/?auth=error`);
  }
});

// ─── GET /auth/me — текущий пользователь ─────────────────────────────────────

authRouter.get('/me', async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];

  if (!token) {
    res.json({ user: null });
    return;
  }

  try {
    const { rows } = await db.query<{
      id: number;
      name: string;
      email: string;
      avatar: string | null;
    }>(
      `SELECT u.id, u.name, u.email, u.avatar
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = $1
         AND s.expires_at > now()`,
      [token]
    );

    if (!rows[0]) {
      res.clearCookie(SESSION_COOKIE);
      res.json({ user: null });
      return;
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('[auth] /me error:', err);
    res.json({ user: null });
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

authRouter.post('/logout', async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];

  if (token) {
    await db.query('DELETE FROM sessions WHERE token = $1', [token]).catch(() => {});
  }

  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});