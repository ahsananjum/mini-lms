"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const Assignment_1 = require("./models/Assignment");
const app_1 = __importDefault(require("./app"));
async function runMigrations() {
    // One-time migration: backfill gradingType for old assignments
    const result = await Assignment_1.Assignment.updateMany({ gradingType: { $exists: false } }, { $set: { gradingType: 'graded' } });
    if (result.modifiedCount > 0) {
        console.log(`🔄 Migration: Set gradingType='graded' on ${result.modifiedCount} old assignments`);
    }
}
async function startServer() {
    try {
        await (0, db_1.connectDB)();
        await runMigrations();
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`🚀 Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map