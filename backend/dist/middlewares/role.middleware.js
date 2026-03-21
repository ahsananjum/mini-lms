"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const ApiError_1 = require("../utils/ApiError");
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            next(ApiError_1.ApiError.unauthorized('Authentication required'));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(ApiError_1.ApiError.forbidden('You do not have permission to access this resource'));
            return;
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map