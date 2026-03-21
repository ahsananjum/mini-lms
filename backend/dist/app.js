"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const cors_2 = require("./config/cors");
const error_middleware_1 = require("./middlewares/error.middleware");
const apiResponse_1 = require("./utils/apiResponse");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const instructor_routes_1 = __importDefault(require("./routes/instructor.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const app = (0, express_1.default)();
// Core middleware
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Health endpoint
app.get('/api/health', (req, res) => {
    (0, apiResponse_1.sendSuccess)(res, 'API is running', { service: 'mini-lms-backend' });
});
// Route scaffolds
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/instructor', instructor_routes_1.default);
app.use('/api/student', student_routes_1.default);
// Error handling
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=app.js.map