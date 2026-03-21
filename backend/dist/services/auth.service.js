"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupUser = signupUser;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
async function signupUser(data) {
    const { name, email, password, role } = data;
    // Check duplicate email
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw ApiError_1.ApiError.conflict('An account with this email already exists');
    }
    // Hash password
    const salt = await bcryptjs_1.default.genSalt(10);
    const passwordHash = await bcryptjs_1.default.hash(password, salt);
    // Create user with pending status
    const user = await User_1.User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        status: 'pending',
    });
    return user;
}
async function loginUser(data) {
    const { email, password } = data;
    const user = await User_1.User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw ApiError_1.ApiError.unauthorized('Invalid email or password');
    }
    // Check password
    const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        throw ApiError_1.ApiError.unauthorized('Invalid email or password');
    }
    // Block rejected users
    if (user.status === 'rejected') {
        throw ApiError_1.ApiError.forbidden('Your account has been rejected. Please contact admin.');
    }
    // Sign token
    const token = (0, jwt_1.signToken)({
        userId: String(user._id),
        role: user.role,
        status: user.status,
    });
    return { user, token };
}
//# sourceMappingURL=auth.service.js.map