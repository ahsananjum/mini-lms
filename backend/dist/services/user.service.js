"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistrationRequests = getRegistrationRequests;
exports.approveUser = approveUser;
exports.rejectUser = rejectUser;
exports.getUserById = getUserById;
exports.getUsers = getUsers;
exports.updateUserStatus = updateUserStatus;
exports.deleteUser = deleteUser;
const User_1 = require("../models/User");
const ApiError_1 = require("../utils/ApiError");
const email_service_1 = require("./email.service");
async function getRegistrationRequests(query) {
    const filter = {};
    // Exclude admin users from the list
    filter.role = { $in: ['student', 'instructor'] };
    if (query.status) {
        filter.status = query.status;
    }
    if (query.role && (query.role === 'student' || query.role === 'instructor')) {
        filter.role = query.role;
    }
    if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ name: regex }, { email: regex }];
    }
    const requests = await User_1.User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 });
    return requests;
}
async function approveUser(userId) {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    if (user.role === 'admin') {
        throw ApiError_1.ApiError.badRequest('Cannot approve admin accounts');
    }
    if (user.status !== 'pending') {
        throw ApiError_1.ApiError.badRequest(`User is already ${user.status}`);
    }
    user.status = 'active';
    await user.save();
    // Attempt welcome email — approval succeeds regardless
    const emailSent = await (0, email_service_1.sendWelcomeEmail)(user.name, user.role, user.email);
    return { user, emailSent };
}
async function rejectUser(userId) {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    if (user.role === 'admin') {
        throw ApiError_1.ApiError.badRequest('Cannot reject admin accounts');
    }
    if (user.status !== 'pending') {
        throw ApiError_1.ApiError.badRequest(`User is already ${user.status}`);
    }
    user.status = 'rejected';
    await user.save();
    return user;
}
async function getUserById(userId) {
    const user = await User_1.User.findById(userId).select('-passwordHash');
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    return user;
}
async function getUsers(query) {
    const filter = {};
    // Only return student and instructor users, never admin
    if (query.role && query.role !== 'all') {
        filter.role = query.role;
    }
    else {
        filter.role = { $in: ['student', 'instructor'] };
    }
    if (query.status && query.status !== 'all') {
        filter.status = query.status;
    }
    if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ name: regex }, { email: regex }];
    }
    const users = await User_1.User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 });
    return users;
}
async function updateUserStatus(userId, newStatus) {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    if (user.role === 'admin') {
        throw ApiError_1.ApiError.badRequest('Cannot modify admin accounts');
    }
    if (user.status === 'pending') {
        throw ApiError_1.ApiError.badRequest('Pending users must be managed through the registration requests page');
    }
    // Only allow active <-> rejected transitions
    if (user.status === newStatus) {
        throw ApiError_1.ApiError.badRequest(`User is already ${newStatus}`);
    }
    user.status = newStatus;
    await user.save();
    return user;
}
async function deleteUser(userId) {
    const user = await User_1.User.findById(userId);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    if (user.role === 'admin') {
        throw ApiError_1.ApiError.badRequest('Cannot delete admin accounts');
    }
    await User_1.User.findByIdAndDelete(userId);
    return userId;
}
//# sourceMappingURL=user.service.js.map