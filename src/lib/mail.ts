import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || '"CipherDrop Security" <security@cipherdrop.com>',
    to: email,
    subject: "Reset your CipherDrop Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your CipherDrop account.</p>
        <p>Click the button below to secure your account:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">Or copy this link: <br> <a href="${resetLink}">${resetLink}</a></p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[MAIL] Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[MAIL ERROR] Failed to send email:", error);
    // We log the error but return false so the caller knows, 
    // though for security we usually still tell the user "If success, email sent".
    throw error;
  }
}
