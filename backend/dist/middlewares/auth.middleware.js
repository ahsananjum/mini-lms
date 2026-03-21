"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
const env_1 = require("../config/env");
function authenticate(req, res, next) {
    const token = req.cookies[env_1.env.COOKIE_NAME];
    if (!token) {
        next(ApiError_1.ApiError.unauthorized('Authentication required'));
        return;
    }
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch {
        next(ApiError_1.ApiError.unauthorized('Invalid or expired token'));
    }
}
//# sourceMappingURL=auth.middleware.js.map