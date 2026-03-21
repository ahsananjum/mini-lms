import { IUser } from '../models/User';
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
export declare function signupUser(data: SignupData): Promise<IUser>;
export declare function loginUser(data: LoginData): Promise<{
    user: IUser;
    token: string;
}>;
export {};
//# sourceMappingURL=auth.service.d.ts.map