import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole, UserStatus } from '../models/User';

interface JwtPayload {
  userId: string;
  role: UserRole;
  status: UserStatus;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };
  return jwt.sign(payload as object, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
