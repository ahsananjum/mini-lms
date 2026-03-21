"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const ApiError_1 = require("../utils/ApiError");
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const messages = result.error.issues.map((i) => i.message);
            next(ApiError_1.ApiError.badRequest('Validation failed', messages));
            return;
        }
        next();
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const messages = result.error.issues.map((i) => i.message);
            next(ApiError_1.ApiError.badRequest('Invalid query parameters', messages));
            return;
        }
        next();
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            const messages = result.error.issues.map((i) => i.message);
            next(ApiError_1.ApiError.badRequest('Invalid parameters', messages));
            return;
        }
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map