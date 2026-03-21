"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const ApiError_1 = require("../utils/ApiError");
const env_1 = require("../config/env");
function errorMiddleware(err, req, res, next) {
    if (err instanceof ApiError_1.ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
        return;
    }
    console.error('Unhandled error:', err);
    const message = env_1.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
    res.status(500).json({
        success: false,
        message,
        errors: [],
    });
}
//# sourceMappingURL=error.middleware.js.map