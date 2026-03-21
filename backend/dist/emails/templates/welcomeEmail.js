"use strict";
// Phase 0 scaffold — real welcome email template will be added in Phase 1.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWelcomeEmailHtml = getWelcomeEmailHtml;
function getWelcomeEmailHtml(name, role, email, loginUrl) {
    return `
    <h1>Welcome to Mini LMS!</h1>
    <p>Hi ${name},</p>
    <p>Your <strong>${role}</strong> account has been approved.</p>
    <p>You can log in using your email: <strong>${email}</strong></p>
    <p><a href="${loginUrl}">Go to Login</a></p>
    <p>— Mini LMS Team</p>
  `;
}
//# sourceMappingURL=welcomeEmail.js.map