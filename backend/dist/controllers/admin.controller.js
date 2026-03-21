"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
exports.listRequests = listRequests;
exports.approve = approve;
exports.reject = reject;
exports.listUsers = listUsers;
exports.updateStatus = updateStatus;
exports.removeUser = removeUser;
const user_service_1 = require("../services/user.service");
const dashboard_service_1 = require("../services/dashboard.service");
const apiResponse_1 = require("../utils/apiResponse");
// ── Dashboard ──
async function getDashboard(req, res, next) {
    try {
        const data = await (0, dashboard_service_1.getAdminDashboard)();
        (0, apiResponse_1.sendSuccess)(res, 'Admin dashboard loaded successfully', data);
    }
    catch (error) {
        next(error);
    }
}
async function listRequests(req, res, next) {
    try {
        const { status, role, search } = req.query;
        const requests = await (0, user_service_1.getRegistrationRequests)({
            status: status,
            role: role,
            search: search,
        });
        (0, apiResponse_1.sendSuccess)(res, 'Registration requests', { requests });
    }
    catch (error) {
        next(error);
    }
}
async function approve(req, res, next) {
    try {
        const id = req.params.id;
        const { user, emailSent } = await (0, user_service_1.approveUser)(id);
        (0, apiResponse_1.sendSuccess)(res, 'User approved successfully', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
            emailSent,
        });
    }
    catch (error) {
        next(error);
    }
}
async function reject(req, res, next) {
    try {
        const id = req.params.id;
        const user = await (0, user_service_1.rejectUser)(id);
        (0, apiResponse_1.sendSuccess)(res, 'User rejected successfully', {
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
// ── Phase 2: User Management ──
async function listUsers(req, res, next) {
    try {
        const { role, status, search } = req.query;
        const users = await (0, user_service_1.getUsers)({
            role: role,
            status: status,
            search: search,
        });
        (0, apiResponse_1.sendSuccess)(res, 'Users fetched successfully', { users });
    }
    catch (error) {
        next(error);
    }
}
async function updateStatus(req, res, next) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const user = await (0, user_service_1.updateUserStatus)(id, status);
        (0, apiResponse_1.sendSuccess)(res, 'User status updated successfully', {
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
async function removeUser(req, res, next) {
    try {
        const id = req.params.id;
        const deletedUserId = await (0, user_service_1.deleteUser)(id);
        (0, apiResponse_1.sendSuccess)(res, 'User deleted successfully', { deletedUserId });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=admin.controller.js.map