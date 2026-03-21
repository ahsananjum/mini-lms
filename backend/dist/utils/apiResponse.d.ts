import { Response } from 'express';
export declare function sendSuccess(res: Response, message: string, data?: any, statusCode?: number): Response<any, Record<string, any>>;
export declare function sendError(res: Response, message: string, errors?: string[], statusCode?: number): Response<any, Record<string, any>>;
//# sourceMappingURL=apiResponse.d.ts.map