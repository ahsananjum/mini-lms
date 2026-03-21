import { User, IUser, UserRole, UserStatus } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { sendWelcomeEmail } from './email.service';

interface ListRequestsQuery {
  status?: string;
  role?: string;
  search?: string;
}

export async function getRegistrationRequests(query: ListRequestsQuery) {
  const filter: Record<string, any> = {};

  // Exclude admin users from the list
  filter.role = { $in: ['student', 'instructor'] };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.role && (query.role === 'student' || query.role === 'instructor')) {
    filter.role = query.role;
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const requests = await User.find(filter)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return requests;
}

export async function approveUser(userId: string): Promise<{ user: IUser; emailSent: boolean }> {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.badRequest('Cannot approve admin accounts');
  }

  if (user.status !== 'pending') {
    throw ApiError.badRequest(`User is already ${user.status}`);
  }

  user.status = 'active';
  await user.save();

  // Attempt welcome email — approval succeeds regardless
  const emailSent = await sendWelcomeEmail(user.name, user.role, user.email);

  return { user, emailSent };
}

export async function rejectUser(userId: string): Promise<IUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.badRequest('Cannot reject admin accounts');
  }

  if (user.status !== 'pending') {
    throw ApiError.badRequest(`User is already ${user.status}`);
  }

  user.status = 'rejected';
  await user.save();

  return user;
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

// ── Phase 2: Admin User Management ──

interface ListUsersQuery {
  role?: string;
  status?: string;
  search?: string;
}

export async function getUsers(query: ListUsersQuery) {
  const filter: Record<string, any> = {};

  // Only return student and instructor users, never admin
  if (query.role && query.role !== 'all') {
    filter.role = query.role;
  } else {
    filter.role = { $in: ['student', 'instructor'] };
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const users = await User.find(filter)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return users;
}

export async function updateUserStatus(userId: string, newStatus: 'active' | 'rejected'): Promise<IUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.badRequest('Cannot modify admin accounts');
  }

  if (user.status === 'pending') {
    throw ApiError.badRequest('Pending users must be managed through the registration requests page');
  }

  // Only allow active <-> rejected transitions
  if (user.status === newStatus) {
    throw ApiError.badRequest(`User is already ${newStatus}`);
  }

  user.status = newStatus;
  await user.save();

  return user;
}

export async function deleteUser(userId: string): Promise<string> {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.badRequest('Cannot delete admin accounts');
  }

  await User.findByIdAndDelete(userId);

  return userId;
}
