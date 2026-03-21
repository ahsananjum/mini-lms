import { Request, Response, NextFunction } from 'express';
import { getRegistrationRequests, approveUser, rejectUser, getUsers, updateUserStatus, deleteUser } from '../services/user.service';
import { getAdminDashboard } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';

// ── Dashboard ──

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await getAdminDashboard();
    sendSuccess(res, 'Admin dashboard loaded successfully', data);
  } catch (error) {
    next(error);
  }
}

export async function listRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, role, search } = req.query;
    const requests = await getRegistrationRequests({
      status: status as string | undefined,
      role: role as string | undefined,
      search: search as string | undefined,
    });

    sendSuccess(res, 'Registration requests', { requests });
  } catch (error) {
    next(error);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { user, emailSent } = await approveUser(id);

    sendSuccess(res, 'User approved successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      emailSent,
    });
  } catch (error) {
    next(error);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await rejectUser(id);

    sendSuccess(res, 'User rejected successfully', {
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

// ── Phase 2: User Management ──

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role, status, search } = req.query;
    const users = await getUsers({
      role: role as string | undefined,
      status: status as string | undefined,
      search: search as string | undefined,
    });

    sendSuccess(res, 'Users fetched successfully', { users });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const user = await updateUserStatus(id, status);

    sendSuccess(res, 'User status updated successfully', {
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

export async function removeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const deletedUserId = await deleteUser(id);

    sendSuccess(res, 'User deleted successfully', { deletedUserId });
  } catch (error) {
    next(error);
  }
}
