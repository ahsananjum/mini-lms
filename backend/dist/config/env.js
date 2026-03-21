"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnv(key, fallback) {
    const value = process.env[key] || fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
exports.env = {
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
//# sourceMappingURL=env.js.map