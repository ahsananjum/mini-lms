export declare class ApiError extends Error {
    statusCode: number;
    errors: string[];
    constructor(statusCode: number, message: string, errors?: string[]);
    static badRequest(message: string, errors?: string[]): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static notFound(message?: string): ApiError;
    static conflict(message: string): ApiError;
    static internal(message?: string): ApiError;
}
//# sourceMappingURL=ApiError.d.ts.map