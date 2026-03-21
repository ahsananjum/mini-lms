import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  CLIENT_URL: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  COOKIE_NAME: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:3000'),
  MONGODB_URI: getEnv('MONGODB_URI'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
  COOKIE_NAME: getEnv('COOKIE_NAME', 'lms_token'),
  RESEND_API_KEY: getEnv('RESEND_API_KEY', ''),
  EMAIL_FROM: getEnv('EMAIL_FROM', 'Mini LMS <onboarding@yourdomain.com>'),
  ADMIN_EMAIL: getEnv('ADMIN_EMAIL', 'admin@minilms.com'),
  ADMIN_PASSWORD: getEnv('ADMIN_PASSWORD', 'Admin123!'),
};
