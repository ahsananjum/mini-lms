import { CookieOptions } from 'express';
import { env } from './env';

export function getCookieOptions(): CookieOptions {
  const isDeployEnv = env.NODE_ENV === 'production' || process.env.VERCEL === '1' || !!process.env.VERCEL_ENV;

  return {
    httpOnly: true,
    secure: isDeployEnv,
    sameSite: isDeployEnv ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}
