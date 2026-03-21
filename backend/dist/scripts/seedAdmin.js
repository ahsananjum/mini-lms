"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
async function seedAdmin() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        console.log('✅ Database connected');
        const existingAdmin = await User_1.User.findOne({ email: env_1.env.ADMIN_EMAIL });
        if (existingAdmin) {
            console.log(`ℹ️  Admin already exists with email: ${env_1.env.ADMIN_EMAIL}`);
            console.log('   Skipping seed.');
            process.exit(0);
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(env_1.env.ADMIN_PASSWORD, salt);
        const admin = await User_1.User.create({
            name: 'Admin',
            email: env_1.env.ADMIN_EMAIL,
            passwordHash,
            role: 'admin',
            status: 'active',
        });
        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role:  ${admin.role}`);
        console.log(`   Status: ${admin.status}`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}
seedAdmin();
//# sourceMappingURL=seedAdmin.js.map