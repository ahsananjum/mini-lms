import { Request, Response, NextFunction } from 'express';
import { signupUser, loginUser } from '../services/auth.service';
import { getUserById } from '../services/user.service';
import { sendSuccess } from '../utils/apiResponse';
import { getCookieOptions } from '../config/cookie';
import { env } from '../config/env';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role } = req.body;
    const user = await signupUser({ name, email, password, role });

    sendSuccess(res, 'Account created successfully. Please wait for admin approval.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    }, 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });

    // Set JWT in HTTP-only cookie
    res.cookie(env.COOKIE_NAME, token, getCookieOptions());

    sendSuccess(res, 'Login successful', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie(env.COOKIE_NAME, getCookieOptions());
  sendSuccess(res, 'Logged out successfully');
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated', errors: [] });
      return;
    }

    const user = await getUserById(req.user.userId);

    sendSuccess(res, 'Current user', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
}
