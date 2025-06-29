import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Reset your password',
      html: `
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 15px;background:#2563eb;color:white;text-decoration:none;border-radius:4px;">Reset Password</a></p>
        <p>If you did not request this, you can safely ignore it.</p>
      `,
    });

    if (error) {
      console.error(' Failed to send reset email:', error);
    } else {
      console.log(' Sent reset email to', to);
    }
  } catch (err) {
    console.error(' Unexpected error sending reset email:', err);
  }
}
