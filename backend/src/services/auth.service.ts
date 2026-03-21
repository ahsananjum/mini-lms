import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}

interface LoginData {
  email: string;
  password: string;
}

export async function signupUser(data: SignupData): Promise<IUser> {
  const { name, email, password, role } = data;

  // Check duplicate email
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user with pending status
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    status: 'pending',
  });

  return user;
}

export async function loginUser(data: LoginData): Promise<{ user: IUser; token: string }> {
  const { email, password } = data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Block rejected users
  if (user.status === 'rejected') {
    throw ApiError.forbidden('Your account has been rejected. Please contact admin.');
  }

  // Sign token
  const token = signToken({
    userId: String(user._id),
    role: user.role,
    status: user.status,
  });

  return { user, token };
}
