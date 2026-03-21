import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
export declare function authorize(...allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map