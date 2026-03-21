import { Resend } from 'resend';
import { env } from '../config/env';
import { getWelcomeEmailHtml } from '../emails/templates/welcomeEmail';

// Only create the Resend client if the API key is provided
let resend: Resend | null = null;
if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(
  name: string,
  role: string,
  email: string
): Promise<boolean> {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping welcome email');
    return false;
  }

  const loginUrl = `${env.CLIENT_URL}/login`;
  const html = getWelcomeEmailHtml(name, role, email, loginUrl);

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Mini LMS — Your Account Has Been Approved',
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}
