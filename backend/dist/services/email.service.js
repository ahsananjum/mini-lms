"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
const resend_1 = require("resend");
const env_1 = require("../config/env");
const welcomeEmail_1 = require("../emails/templates/welcomeEmail");
// Only create the Resend client if the API key is provided
let resend = null;
if (env_1.env.RESEND_API_KEY) {
    resend = new resend_1.Resend(env_1.env.RESEND_API_KEY);
}
async function sendWelcomeEmail(name, role, email) {
    if (!resend) {
        console.warn('⚠️  RESEND_API_KEY not set — skipping welcome email');
        return false;
    }
    const loginUrl = `${env_1.env.CLIENT_URL}/login`;
    const html = (0, welcomeEmail_1.getWelcomeEmailHtml)(name, role, email, loginUrl);
    try {
        await resend.emails.send({
            from: env_1.env.EMAIL_FROM,
            to: email,
            subject: 'Welcome to Mini LMS — Your Account Has Been Approved',
            html,
        });
        return true;
    }
    catch (error) {
        console.error('Failed to send welcome email:', error);
        return false;
    }
}
//# sourceMappingURL=email.service.js.map