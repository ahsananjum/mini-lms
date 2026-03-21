import { UserRole, UserStatus } from '../models/User';
interface JwtPayload {
    userId: string;
    role: UserRole;
    status: UserStatus;
}
export declare function signToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): JwtPayload;
export {};
//# sourceMappingURL=jwt.d.ts.map