import { IUser } from '../models/User';
interface ListRequestsQuery {
    status?: string;
    role?: string;
    search?: string;
}
export declare function getRegistrationRequests(query: ListRequestsQuery): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
})[]>;
export declare function approveUser(userId: string): Promise<{
    user: IUser;
    emailSent: boolean;
}>;
export declare function rejectUser(userId: string): Promise<IUser>;
export declare function getUserById(userId: string): Promise<import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
interface ListUsersQuery {
    role?: string;
    status?: string;
    search?: string;
}
export declare function getUsers(query: ListUsersQuery): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
})[]>;
export declare function updateUserStatus(userId: string, newStatus: 'active' | 'rejected'): Promise<IUser>;
export declare function deleteUser(userId: string): Promise<string>;
export {};
//# sourceMappingURL=user.service.d.ts.map