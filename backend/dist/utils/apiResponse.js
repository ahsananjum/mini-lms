"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, message, data = {}, statusCode = 200) {
    const response = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
}
function sendError(res, message, errors = [], statusCode = 400) {
    const response = {
        success: false,
        message,
        errors,
    };
    return res.status(statusCode).json(response);
}
//# sourceMappingURL=apiResponse.js.map