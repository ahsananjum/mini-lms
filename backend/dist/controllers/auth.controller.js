"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.getMe = getMe;
const auth_service_1 = require("../services/auth.service");
const user_service_1 = require("../services/user.service");
const apiResponse_1 = require("../utils/apiResponse");
const cookie_1 = require("../config/cookie");
const env_1 = require("../config/env");
async function signup(req, res, next) {
    try {
        const { name, email, password, role } = req.body;
        const user = await (0, auth_service_1.signupUser)({ name, email, password, role });
        (0, apiResponse_1.sendSuccess)(res, 'Account created successfully. Please wait for admin approval.', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        }, 201);
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const { user, token } = await (0, auth_service_1.loginUser)({ email, password });
        // Set JWT in HTTP-only cookie
        res.cookie(env_1.env.COOKIE_NAME, token, (0, cookie_1.getCookieOptions)());
        (0, apiResponse_1.sendSuccess)(res, 'Login successful', {
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function logout(req, res) {
    res.clearCookie(env_1.env.COOKIE_NAME, (0, cookie_1.getCookieOptions)());
    (0, apiResponse_1.sendSuccess)(res, 'Logged out successfully');
}
async function getMe(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated', errors: [] });
            return;
        }
        const user = await (0, user_service_1.getUserById)(req.user.userId);
        (0, apiResponse_1.sendSuccess)(res, 'Current user', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map